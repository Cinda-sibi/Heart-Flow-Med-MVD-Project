from django.shortcuts import render
from rest_framework.views import APIView 
from heart_flow_app.mixins import *
from .serializers import *
from rest_framework.permissions import AllowAny,IsAuthenticated
from heart_flow_app. utils import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
import pyotp
from patient_app.serializers import *
from django.db.models import Q
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from doctor_app.serializers import *
from rest_framework.parsers import MultiPartParser, FormParser ,JSONParser
import requests
from . utils import *
from django.core.files.base import ContentFile
# Create your views here.
# views.py

# list administrative staffs 
class AdministrativeStaffListAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Enable if needed

    def get(self, request):
        staff = AdministrativeStaffProfile.objects.select_related('user').all()
        serializer = AdministrativeStaffProfileSerializer(staff, many=True)
        return custom_200("Staff listed successfully",serializer.data)

# patient referral 
class PatientReferralListCreateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser ,JSONParser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'General Practitioner':
            referrals = PatientReferral.objects.filter(referred_by=request.user).order_by('-referred_at')
        else:
            referrals = PatientReferral.objects.all().order_by('-referred_at')

        serializer = PatientReferralSerializer(referrals, many=True)
        return custom_200("Patients referral listed successfully", serializer.data)
    
    def post(self, request):
        file_obj = request.FILES.get('audio_file')
        print("FILES:", request.FILES)

        transcription = ''
        summary = ''

        # Optional transcription via DictateMed
        if file_obj:
            headers = {
                "Authorization": "dictateDvZQNKb5genyoqEuBpWGIIzvMV4qi1vxMSz2EL26oG42liPJ9khgBONNunlsvtQup5uxrlNbAAKqaAAHV9caP0wf6sbtP2vCSczuIqDYOeWOynFdlRzswUkq7",
                "Content-Type": file_obj.content_type,
            }

            files = {
                "file": (file_obj.name, file_obj, file_obj.content_type),
            }

            data = {
                "summary_template": "DEFA",
                "specialty_type": "General Practicioner",
            }

            try:
                response = requests.post(
                    "https://api.dictatemed.com/ai/transcribe-and-summarize",
                    headers=headers,
                    files=files,
                    data=data
                )
                if response.status_code == 200:
                    result = response.json()
                    transcription = result.get("transcription", "")
                    summary = result.get("summary", "")
                else:
                    return Response({"error": "DictateMed API failed", "details": response.text}, status=response.status_code)
            except Exception as e:
                return Response({"error": str(e)}, status=500)

        # Step 2: Save the referral record
        referral_data = request.data.copy()
        referral_data['transcription'] = transcription
        referral_data['summary'] = summary

        serializer = PatientReferralSerializer(data=referral_data)
        if serializer.is_valid():
            referral = serializer.save(audio_file=file_obj if file_obj else None, referred_by=request.user)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
        pdf_file = generate_referral_pdf(referral)
        referral.referral_pdf.save(f"referral_{referral.id}.pdf", ContentFile(pdf_file))
        referral.save()
        # Step 4: Email PDF to Admin + Staff
        admin_staff_users = ProfileUser.objects.filter(role__in=['Admin', 'Administrative Staff','Cardiologist'])
        email_recipients = list(admin_staff_users.values_list('email', flat=True))

        if email_recipients:
            email_subject = "New Patient Referral"
            email_body = f"""
Dear Staff,

A new referral has been submitted by GP {referral.referred_by.get_full_name()}.

Patient: {referral.patient_first_name} {referral.patient_last_name}
Email: {referral.patient_email}
Phone: {referral.patient_phone}

Reason:
{referral.reason}

Please find the attached PDF for more details.
"""

            email = EmailMessage(
                subject=email_subject,
                body=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=email_recipients
            )
            email.attach(f"referral-{referral.id}.pdf", pdf_file, "application/pdf")
            email.send()

        # Step 5: Create notifications
        for user in admin_staff_users:
            Notification.objects.create(
                user=user,
                notification_type='referral_received',
                title='New Referral Received',
                message=f"Referral for {referral.patient_first_name} {referral.patient_last_name} from GP {referral.referred_by.get_full_name()}",
                is_read=False
            )

        return custom_200("Referral submitted successfully",referral.id)
    
#     def post(self, request):
#         if request.user.role != 'General Practitioner':
#             return Response({"message": "Only GPs can make referrals"}, status=403)

#         data = request.data.copy()
#         serializer = PatientReferralSerializer(data=data)
#         if serializer.is_valid():
#             # Save without referred_to
#             referral = serializer.save(referred_by=request.user)

#             # Generate PDF
#             buffer = BytesIO()
#             p = canvas.Canvas(buffer, pagesize=A4)
#             width, height = A4
#             line = height - 50

#             p.setFont("Helvetica-Bold", 16)
#             p.drawCentredString(width / 2.0, line, "Patient Referral Report")

#             p.setFont("Helvetica", 12)
#             line -= 40
#             p.drawString(50, line, f"Referral ID: {referral.id}")
#             line -= 20
#             p.drawString(50, line, f"Date: {referral.referred_at.strftime('%Y-%m-%d %H:%M')}")

#             line -= 40
#             p.setFont("Helvetica-Bold", 12)
#             p.drawString(50, line, "Patient Information")
#             p.setFont("Helvetica", 12)
#             line -= 20
#             p.drawString(70, line, f"Name: {referral.patient_first_name} {referral.patient_last_name}")
#             line -= 20
#             p.drawString(70, line, f"Email: {referral.patient_email}")
#             line -= 20
#             p.drawString(70, line, f"Phone: {referral.patient_phone}")

#             line -= 40
#             p.setFont("Helvetica-Bold", 12)
#             p.drawString(50, line, "Referral Details")
#             p.setFont("Helvetica", 12)
#             line -= 20
#             p.drawString(70, line, f"Referred By (GP): {referral.referred_by.get_full_name()} ({referral.referred_by.email})")

#             line -= 40
#             p.drawString(50, line, "Reason for Referral:")
#             line -= 20

#             text = p.beginText(70, line)
#             text.setFont("Helvetica", 12)
#             for line_text in referral.reason.split('\n'):
#                 text.textLine(line_text)
#             p.drawText(text)

#             p.showPage()
#             p.save()

#             pdf_file = buffer.getvalue()
#             buffer.close()

#             # Fetch all Admin and Administrative Staff users
#             admin_staff_users = ProfileUser.objects.filter(
#                 role__in=["Admin", "Administrative Staff"]
#             ).distinct()

#             # Email content
#             email_subject = "New Patient Referral"
#             email_body = f"""
# Dear Staff,

# You have received a new referral from GP {referral.referred_by.get_full_name()} ({referral.referred_by.email}).

# Patient Name: {referral.patient_first_name} {referral.patient_last_name}
# Email: {referral.patient_email}
# Phone: {referral.patient_phone}

# Reason:
# {referral.reason}

# Please find the attached PDF for full details.
# """

#             email_recipients = list(admin_staff_users.values_list('email', flat=True))

#             if email_recipients:
#                 email = EmailMessage(
#                     subject=email_subject,
#                     body=email_body,
#                     from_email=settings.DEFAULT_FROM_EMAIL,
#                     to=email_recipients
#                 )
#                 email.attach(f"referral-{referral.id}.pdf", pdf_file, "application/pdf")
#                 email.send()

#             # Create notifications for all admin and staff
#             for user in admin_staff_users:
#                 Notification.objects.create(
#                     user=user,
#                     notification_type='referral_received',
#                     title='New Referral Received',
#                     message=f"Referral received for patient {referral.patient_first_name} {referral.patient_last_name} from GP {referral.referred_by.get_full_name()}",
#                     is_read=False
#                 )

#             return custom_200("Referral submitted successfully", referral.id)
#         return custom_404(serializer.errors)
    

# recent 3 referrals of the patient 
class RecentPatientReferralsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # GPs see only their own referrals
        if request.user.role == 'General Practitioner':
            referrals = PatientReferral.objects.filter(referred_by=request.user).order_by('-referred_at')[:3]
        else:
            referrals = PatientReferral.objects.all().order_by('-referred_at')[:3]

        serializer = PatientReferralSerializer(referrals, many=True)
        return custom_200("Recent 3 referrals retrieved successfully", serializer.data)
