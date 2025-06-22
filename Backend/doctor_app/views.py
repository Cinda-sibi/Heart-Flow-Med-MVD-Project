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
from django.utils.timezone import now
from administrative_staff_app.serializers import *
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

        # Ensure the user is a doctor
        if doctor.role != 'Cardiologist':
            return custom_404("Only doctors can access their appointments.")

        # Fetch all appointments of the doctor
        appointments = Appointment.objects.filter(doctor=doctor).order_by('-date', '-time')

        serializer = AppointmentListSerializer(appointments, many=True)
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
