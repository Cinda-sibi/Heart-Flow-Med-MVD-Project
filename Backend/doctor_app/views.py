from django.shortcuts import render
from rest_framework.views import APIView 
from heart_flow_app.mixins import *
from heart_flow_app.serializers import *
from rest_framework.permissions import AllowAny,IsAuthenticated
from heart_flow_app. utils import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from heart_flow_app.models import *
from . models import *
from patient_app.serializers import *
from . serializers import *
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.timezone import now
from rest_framework.parsers import MultiPartParser, FormParser
from administrative_staff_app.serializers import *
from gp_app.serializers import *
from django.db.models import Q
from django.shortcuts import get_object_or_404
from . models import PatientProfile
from admin_app.models import *
from nurse_app.serializers import *

# Create your views here.


# list all patients api
class ListPatientsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        patients = PatientProfile.objects.all()
        serializer = ListallPatientsSerializer(patients, many=True)
        return custom_200("Listed successfully",serializer.data)
    def get(self, request):
        try:
            # Get all doctors
            patients = PatientProfile.objects.all()
            
            # Serialize the data
            serializer = ListallPatientsSerializer(patients, many=True)
            
            # Format the response data
            response_data = []
            for patient in serializer.data:
                formatted_patient = {
                    "id": patient["id"],
                    "user_id":patient["user"]["id"],
                    "unique_id":patient["unique_id"],
                    "email": patient["user"]["email"],
                    "first_name": patient["user"]["first_name"],
                    "last_name": patient["user"]["last_name"],
                    "role": patient["user"]["role"],
                    "date_of_birth": patient["date_of_birth"],
                    "gender": patient["gender"],
                    "address": patient["address"],
                    "age": patient["age"]
                }
                response_data.append(formatted_patient)

            return custom_200("Patients retrieved successfully",response_data)
            
        except Exception as e:
            return custom_404(f"Error fetching doctors: {str(e)}")


 
# list login doctors recent 3 patients    
class ListRecentThreePatientsByDoctor(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        # Ensure the user is a doctor
        if doctor.role != 'Cardiologist':
            return Response({"detail": "Only doctors can access this data."}, status=403)

        # Get recent appointments sorted by date/time
        recent_appointments = Appointment.objects.filter(doctor=doctor).order_by('-date', '-time')

        # Get unique patient profiles (latest 3)
        seen = set()
        unique_patients = []
        for appt in recent_appointments:
            patient_profile = getattr(appt.patient, 'patientprofile', None)
            if patient_profile and patient_profile.id not in seen:
                seen.add(patient_profile.id)
                unique_patients.append(patient_profile)
            if len(unique_patients) >= 3:
                break

        serializer = PatientProfileSerializer(unique_patients, many=True)
        return custom_200("Recent 3 patients retrieved successfully", serializer.data)

# list login doctors recent patients 
class ListPatientsByDoctors(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        # Ensure the user is a doctor
        if doctor.role != 'Cardiologist':
            return Response({"detail": "Only doctors can access this data."}, status=403)

        # Get recent appointments (e.g., last 30 days, or sort by latest)
        recent_appointments = Appointment.objects.filter(doctor=doctor).order_by('-date', '-time')

        # Get unique patients from those appointments, maintaining order
        seen = set()
        unique_patients = []
        for appt in recent_appointments:
            patient_profile = getattr(appt.patient, 'patientprofile', None)  # Get related PatientProfile
            if patient_profile and patient_profile.id not in seen:
                seen.add(patient_profile.id)
                unique_patients.append(patient_profile)
        # Serialize and return
        serializer = PatientProfileSerializer(unique_patients, many=True)
        return custom_200("Patients listed successfully",serializer.data)




# doctors patient details by patient id 
class DoctorPatientDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        doctor = request.user

        # Ensure the user is a doctor
        if doctor.role != 'Cardiologist':
            return custom_404("Only doctors can access this data.")

        # Check if this patient has any appointment with this doctor
        try:
            appointment = Appointment.objects.filter(
                doctor=doctor,
                patient__patientprofile__id=patient_id
            ).latest('date', 'time')  # any matching appointment, using latest

            patient_profile = appointment.patient.patientprofile
        except Appointment.DoesNotExist:
            return custom_404("Patient not found or not associated with this doctor.")
        except PatientProfile.DoesNotExist:
            return custom_404("Patient profile does not exist.")

        # Serialize and return
        serializer = PatientProfileSerializer(patient_profile)
        return custom_200("Patient details retrieved successfully", serializer.data)

# list todays appointments of doctor
class ListTodaysAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        # Check if the logged-in user is a doctor
        if doctor.role != 'Cardiologist':
            return custom_404("Only doctors can access their appointments.")

        today = now().date()
        todays_appointments = Appointment.objects.filter(doctor=doctor, date=today).order_by('time')

        serializer = AppointmentListSerializer(todays_appointments, many=True)
        return custom_200("Appointment listed successfully",serializer.data)


# count of patients 
class DoctorPatientCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        if doctor.role != 'Cardiologist':
            return Response({"detail": "Only doctors can access this data."}, status=403)

        patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient', flat=True).distinct()
        count = patient_ids.count()

        return custom_200("Patient count retrieved successfully", {"patient_count": count})

# count of todays appointment 
class TodaysAppointmentsCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        if doctor.role != 'Cardiologist':
            return Response({"detail": "Only doctors can access this data."}, status=403)

        today = now().date()
        count = Appointment.objects.filter(doctor=doctor, date=today).count()

        return custom_200("Today's appointment count retrieved successfully", {"today_appointment_count": count})
    
# login doctors all appointments 
class ListAllDoctorAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user

        if doctor.role != 'Cardiologist':
            return custom_404("Only doctors can access their appointments.")

        appointments = Appointment.objects.filter(doctor=doctor).order_by('-date', '-time')

        now_nz = timezone.localtime(timezone.now())  # Ensure you get current time in NZ timezone
        updated_appointments = []

        for appointment in appointments:
            appointment_datetime = datetime.combine(appointment.date, appointment.time)
            appointment_datetime = timezone.make_aware(appointment_datetime, timezone.get_current_timezone())

            # Skip if cancelled
            if appointment.status == 'Cancelled':
                continue

            # If appointment is in the past, mark as completed
            if appointment_datetime < now_nz and appointment.status != 'Completed':
                appointment.status = 'Completed'
                appointment.save(update_fields=['status'])

            updated_appointments.append(appointment)

        serializer = AppointmentListSerializer(updated_appointments, many=True)
        return custom_200("All appointments listed successfully", serializer.data)


class DoctorOwnAvailabilityAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure the user is a doctor
        if user.role != 'Cardiologist':
            return custom_404("Only doctors can access their availability.")

        availability = DoctorAvailability.objects.filter(doctor=user)
        serializer = DoctorAvailabilitySerializer(availability, many=True)
        return custom_200("Doctor's availability listed successfully", serializer.data)


# sonography referal
class SonographyReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'Sonographer':
            referrals = SonographyReferral.objects.filter(sonographer=user)
        elif user.role == 'Cardiologist':
            referrals = SonographyReferral.objects.filter(doctor=user)
        else:
            referrals = SonographyReferral.objects.none()

        serializer = SonographyReferralSerializer(referrals, many=True)
        return custom_200("Referrals fetched",serializer.data)

    def post(self, request):
        if request.user.role != 'Cardiologist':
            return Response({"message": "Only doctors can refer patients"}, status=403)

        data = request.data.copy()
        data['doctor'] = request.user.id

        serializer = SonographyReferralSerializer(data=data)
        if serializer.is_valid():
            referral = serializer.save()

            # ✅ Create Notification for Sonographer
            Notification.objects.create(
                user=referral.sonographer,
                notification_type='referral_received',
                title='New Sonography Referral',
                message=f"You have been referred a new patient: {referral.patient.get_full_name()}",
                appointment=referral.appointment
            )

            # ✅ Send Email to Sonographer
            send_mail(
                subject="New Sonography Referral",
                message=(
                    f"Dear {referral.sonographer.get_full_name()},\n\n"
                    f"You have received a new sonography referral from Dr. {referral.doctor.get_full_name()}.\n"
                    f"Patient: {referral.patient.get_full_name()}\n"
                    f"Reason: {referral.reason}\n\n"
                    f"Please log in to view more details.\n\n"
                    f"- HeartFlow Med Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[referral.sonographer.email],
                fail_silently=False
            )

            return custom_200("Referral created",serializer.data)
        return custom_404(serializer.errors)
    
    # latest 3 sonographer referral list 
class LatestSonographyReferralsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'Sonographer':
            referrals = SonographyReferral.objects.filter(sonographer=user).order_by('-created_at')[:3]
        elif user.role == 'Cardiologist':
            referrals = SonographyReferral.objects.filter(doctor=user).order_by('-created_at')[:3]
        else:
            referrals = SonographyReferral.objects.none()

        serializer = SonographyReferralSerializer(referrals, many=True)
        return custom_200("Latest 3 referrals fetched successfully", serializer.data)

# upload report as sonographer for patient 
class SonographyReportUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            referral = SonographyReferral.objects.get(id=pk, sonographer=request.user)
        except SonographyReferral.DoesNotExist:
            return custom_404("Referral not found or unauthorized")

        serializer = SonographyReferralReportSerializer(referral, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status="Completed")  # Mark completed on report upload

            # Notify doctor
            Notification.objects.create(
                user=referral.doctor,
                notification_type='referral_received',
                title='Sonography Completed',
                message=f"Sonography report uploaded for patient {referral.patient.get_full_name()} by {referral.sonographer.get_full_name()}",
                appointment=referral.appointment
            )

            return custom_200("Report uploaded and status updated",serializer.data)
        return custom_404(serializer.errors)


# list all sonographers
class SonographerListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sonographers = ProfileUser.objects.filter(role='Sonographer')
        serializer = SonographerListSerializer(sonographers, many=True)
        return custom_200("Sonographers listed successfully",serializer.data)
    

# list sonography report file
class SonographyReportByReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, referral_id):
        try:
            referral = SonographyReferral.objects.get(id=referral_id)
        except SonographyReferral.DoesNotExist:
            return custom_404("Referral not found")

        # Check if report is uploaded (status = Completed or report_file exists)
        if referral.status != "Completed" or not referral.report:
            return custom_404("No report uploaded for this referral yet")

        serializer = SonographyReferralReportSerializer(referral)
        return custom_200("Sonography report retrieved successfully", serializer.data)



# prescription by doctor 
# class WritePrescriptionAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, appointment_id):
#         try:
#             appointment = Appointment.objects.get(id=appointment_id)
#         except Appointment.DoesNotExist:
#             return custom_404("Appointment not found")

#         if request.user != appointment.doctor:
#             return custom_404("You are not authorized to prescribe for this appointment")

#         data = request.data.copy()
#         data['patient'] = appointment.patient.patientprofile.id
#         data['prescribed_by'] = request.user.id

#         serializer = PrescriptionSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return custom_200("Prescription created successfully",serializer.data)
#         return custom_404(serializer.errors)

class WritePrescriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user != appointment.doctor:
            return Response({"error": "You are not authorized to prescribe for this appointment"},
                            status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['patient'] = appointment.patient.patientprofile.id
        data['prescribed_by'] = request.user.id

        # Validate prescription data
        serializer = PrescriptionSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Extract medication IDs
        medication_ids = [item['medication'] for item in data.get('items', [])]

        # Check for drug interactions
        from administrative_staff_app.models import DrugInteraction
        interaction_warnings = []

        for i in range(len(medication_ids)):
            for j in range(i + 1, len(medication_ids)):
                med1 = medication_ids[i]
                med2 = medication_ids[j]

                # Check both directions
                interaction = DrugInteraction.objects.filter(
                    medication_1_id=med1,
                    medication_2_id=med2
                ).first() or DrugInteraction.objects.filter(
                    medication_1_id=med2,
                    medication_2_id=med1
                ).first()

                if interaction:
                    interaction_warnings.append({
                        "medication_1_id": med1,
                        "medication_2_id": med2,
                        "severity": interaction.severity,
                        "description": interaction.description
                    })

        # If high severity interaction exists, optionally block saving
        # If you want to block, uncomment below:
        if any(w['severity'] == 'High' for w in interaction_warnings):
            return Response({"error": "High severity drug interaction detected", "interactions": interaction_warnings},
                            status=status.HTTP_400_BAD_REQUEST)

        # Save prescription
        prescription = serializer.save()

        return Response({
            "message": "Prescription created successfully",
            "data": PrescriptionSerializer(prescription).data,
            "interactions": interaction_warnings
        }, status=status.HTTP_201_CREATED)



# adding notes to the referrals of patient and sending to the Admin for booking appointment
class AddDoctorNotesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, referral_id):
        try:
            referral = PatientReferral.objects.get(id=referral_id)
        except PatientReferral.DoesNotExist:
            return custom_404("Referral not found.")

        # Check if the logged-in user is the referred doctor
        if request.user.role != 'Cardiologist':
            return custom_404("You are not authorized to add notes to this referral.")
        
        # if referral.status == 'Pending':
        #     data = request.data.copy()
        #     data['status'] = 'Ongoing'
        # else:
        #     data = request.data

        serializer = DoctorNotesUpdateSerializer(referral,data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if referral.status == 'Pending':
                referral.status = 'Ongoing'
                referral.save()
            return custom_200("Doctor notes added successfully.",serializer.data)
        return custom_404(serializer.errors)
    

# list the referrals by status Ongoing and pending 
class ReferralListByStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, status):
        status = status.capitalize()

        if status not in ['Ongoing', 'Pending']:
            return Response({"detail": "Invalid status. Must be 'Ongoing' or 'Pending'."}, status=400)

        base_filter = {}
        if request.user.role == 'General Practitioner':
            base_filter['referred_by'] = request.user

        if status == 'Pending':
            # status=Pending OR (status=Ongoing AND linked_patient is NULL)
            referrals = PatientReferral.objects.filter(
                Q(status='Pending') |
                Q(status='Ongoing', linked_patient__isnull=True),
                **base_filter
            ).order_by('-referred_at')

        elif status == 'Ongoing':
            # Only Ongoing with linked_patient is not null
            referrals = PatientReferral.objects.filter(
                status='Ongoing',
                linked_patient__isnull=False,
                **base_filter
            ).order_by('-referred_at')

        serializer = PatientReferralSerializer(referrals, many=True)
        return custom_200(f"Referrals with status '{status}' listed successfully", serializer.data)


# get patints test results 
class PatientTestResultListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        

        patient = get_object_or_404(PatientProfile, id=patient_id)

        appointments = DiagnosticAppointment.objects.filter(patient=patient).select_related('result', 'test', 'assigned_staff')
        serializer = AssignedPatientSerializer(appointments, many=True, context={'request': request})
        return custom_200("Test results listed successfully",serializer.data)
