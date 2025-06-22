from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from . serializers import *
from heart_flow_app.mixins import custom_200, custom_404
from heart_flow_app.models import *
from heart_flow_app.serializers import *
from django.utils.timezone import now
from datetime import datetime
from doctor_app.serializers import *
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404

# Create your views here.
# add patients
class AddPatientView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PatientRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        
            
            return custom_200("Patient registered successfully")
        return custom_404(serializer.errors)

# create doctor availability
class DoctorAvailabilityListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        availability = DoctorAvailability.objects.all()
        serializer = DoctorAvailabilitySerializer(availability, many=True)
        return custom_200("Availability listed successfully", serializer.data)

    def post(self, request):
        data = request.data.copy()
        # If doctor_id is not provided, assume the logged-in user is the doctor
        if not data.get('doctor'):
            # Assuming the user is a doctor and has a related Doctor profile
            try:
                doctor_profile  = DoctorProfile.objects.get(user=request.user)
                data['doctor'] = doctor_profile .user.id
            except DoctorProfile.DoesNotExist:
                return custom_404({"doctor": "Doctor profile not found for the logged-in user."})
        serializer = DoctorAvailabilitySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return custom_200("Availability created", serializer.data)
        return custom_404(serializer.errors)

# create doctor leave 
class DoctorLeaveCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        # If doctor_id is not provided, assume the logged-in user is the doctor
        if not data.get('doctor'):
            try:
                doctor = DoctorProfile.objects.get(user=request.user)
                data['doctor'] = doctor.id
            except DoctorProfile.DoesNotExist:
                return custom_404({"doctor": "Doctor profile not found for the logged-in user."})
        serializer = DoctorLeaveSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return custom_200("Leave created", serializer.data)
        return custom_404(serializer.errors)



# check doctor avialbility 
class CheckDoctorAvailability(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        date = request.data.get('date')  # format: YYYY-MM-DD
        time = request.data.get('time')  # format: HH:MM

        if not (doctor_id and date and time):
            return Response({"detail": "doctor_id, date and time are required"}, status=400)

        # Check if doctor is on leave
        leave_exists = DoctorLeave.objects.filter(doctor_id=doctor_id, date=date).exists()
        if leave_exists:
            return Response({"available": False, "reason": "Doctor is on leave"})

        # Check if availability exists
        weekday = datetime.strptime(date, "%Y-%m-%d").strftime('%A')
        try:
            availability = DoctorAvailability.objects.get(doctor_id=doctor_id, day_of_week=weekday)
        except DoctorAvailability.DoesNotExist:
            return Response({"available": False, "reason": "Doctor is not available on this day"})

        # Check if time falls within available time
        input_time = datetime.strptime(time, "%H:%M").time()
        if not (availability.start_time <= input_time <= availability.end_time):
            return Response({"available": False, "reason": "Requested time is outside working hours"})

        # Check overlapping appointments
        overlapping = Appointment.objects.filter(
            doctor_id=doctor_id,
            date=date,
            time=time
        ).exists()

        if overlapping:
            return Response({"available": False, "reason": "Doctor already has an appointment at this time"})

        return Response({"available": True, "message": "Doctor is available"})



# list all doctors appointments
class ListallAppointments(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        try:
         appointments = Appointment.objects.all().order_by('-date','-time')
         now = timezone.localtime()  # Get timezone-aware current datetime

         for appointment in appointments:
                appointment_datetime = datetime.combine(appointment.date, appointment.time)
                appointment_datetime = timezone.make_aware(appointment_datetime)

                if appointment.status == 'Scheduled' and appointment_datetime < now:
                    appointment.status = 'Completed'
                    appointment.save(update_fields=['status'])
         serializer = AppointmentListSerializer(appointments,many=True)
         return custom_200("List all appointments",serializer.data)
        except Appointment.DoesNotExist:
         return custom_404("Appointments not scheduled")


# search availability by doctors name first name and last name

class SearchDoctorAvailabilityAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        first_name = request.query_params.get('first_name')
        last_name = request.query_params.get('last_name')

        if not (first_name or last_name):
            return Response({"status": False, "message": "At least one search parameter (first_name, last_name) is required"}, status=400)

        # Filter for Cardiologist role and name
        filters = Q(role='Cardiologist')
        if first_name:
            filters &= Q(first_name__icontains=first_name)
        if last_name:
            filters &= Q(last_name__icontains=last_name)

        doctors = ProfileUser.objects.filter(filters)
        if not doctors.exists():
            return custom_404("No doctors found matching the criteria")

        # Get all availabilities for these doctors
        availabilities = DoctorAvailability.objects.filter(doctor__in=doctors).select_related('doctor')
        if not availabilities.exists():
            return custom_404("No availability found for the specified doctor(s)")

        serializer = DoctorAvailabilitySerializer(availabilities, many=True)
        return custom_200("Doctor availability found", serializer.data)


# get single patients details by id
class PatientDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, patient_id):
        patient = get_object_or_404(PatientProfile, id=patient_id)
        serializer = ListallPatientsSerializer(patient)
        return custom_200("patient profile get successfully",serializer.data)