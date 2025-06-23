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

# Create your views here.
# views.py

# list administrative staffs 
class AdministrativeStaffListAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Enable if needed

    def get(self, request):
        staff = AdministrativeStaffProfile.objects.select_related('user').all()
        serializer = AdministrativeStaffProfileSerializer(staff, many=True)
        return custom_200("Staff listed successfully",serializer.data)

class PatientReferralListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'General Practitioner':
            referrals = PatientReferral.objects.filter(referred_by=request.user)
        else:
            referrals = PatientReferral.objects.all()

        serializer = PatientReferralSerializer(referrals, many=True)
        return custom_200("Patients referral listed successfully",serializer.data)

    def post(self, request):
        if request.user.role != 'General Practitioner':
            return Response({"message": "Only GPs can make referrals"}, status=403)

        data = request.data.copy()
        serializer = PatientReferralSerializer(data=data)
        if serializer.is_valid():
            referral = serializer.save(referred_by=request.user)

            # Generate PDF
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4
            line = height - 50

            p.setFont("Helvetica-Bold", 16)
            p.drawCentredString(width / 2.0, line, "Patient Referral Report")

            p.setFont("Helvetica", 12)
            line -= 40
            p.drawString(50, line, f"Referral ID: {referral.id}")
            line -= 20
            p.drawString(50, line, f"Date: {referral.referred_at.strftime('%Y-%m-%d %H:%M')}")

            line -= 40
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, line, "Patient Information")
            p.setFont("Helvetica", 12)
            line -= 20
            p.drawString(70, line, f"Name: {referral.patient_first_name} {referral.patient_last_name}")
            line -= 20
            p.drawString(70, line, f"Email: {referral.patient_email}")
            line -= 20
            p.drawString(70, line, f"Phone: {referral.patient_phone}")

            line -= 40
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, line, "Referral Details")
            p.setFont("Helvetica", 12)
            line -= 20
            p.drawString(70, line, f"Referred By (GP): {referral.referred_by.get_full_name()} ({referral.referred_by.email})")
            line -= 20
            p.drawString(70, line, f"Referred To: {referral.referred_to.get_full_name()}")

            line -= 40
            p.drawString(50, line, "Reason for Referral:")
            line -= 20

            text = p.beginText(70, line)
            text.setFont("Helvetica", 12)
            for line_text in referral.reason.split('\n'):
                text.textLine(line_text)
            p.drawText(text)

            p.showPage()
            p.save()

            pdf_file = buffer.getvalue()
            buffer.close()

            # Send email to Admin Staff
            email_body = f"""
Dear {referral.referred_to.first_name},

You have received a new referral from GP {referral.referred_by.get_full_name()} ({referral.referred_by.email}).

Patient Name: {referral.patient_first_name} {referral.patient_last_name}
Email: {referral.patient_email}
Phone: {referral.patient_phone}

Reason:
{referral.reason}

Please find the attached PDF for full details.
            """

            email = EmailMessage(
                subject="New Patient Referral",
                body=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[referral.referred_to.email]
            )
            email.attach(f"referral-{referral.id}.pdf", pdf_file, "application/pdf")
            email.send()

            # Create notification for admin staff
            Notification.objects.create(
                user=referral.referred_to,
                notification_type='referral_received',
                title='New Referral Received',
                message=f"You have received a referral for patient {referral.patient_first_name} {referral.patient_last_name} from GP {referral.referred_by.get_full_name()}",
                is_read=False
            )
            

            return custom_200("Referral submitted successfully",referral.id)
        return custom_404(serializer.errors)