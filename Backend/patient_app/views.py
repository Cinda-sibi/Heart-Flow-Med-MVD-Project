from django.shortcuts import render
from rest_framework.views import APIView 
from heart_flow_app.mixins import *
from heart_flow_app.serializers import *
from rest_framework.permissions import AllowAny,IsAuthenticated
from heart_flow_app. utils import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import *
from .serializers import *
from doctor_app.serializers import *
from django.utils.timezone import now
from administrative_staff_app.models import *
import datetime
# Create your views here.




# list patient profile based on login patient
class GetPatientProfileByIDAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            # Get the patient profile using the user ID from the token
            patient = PatientProfile.objects.get(user=request.user)
            serializer = PatientProfileSerializer(patient)
            
            # Format the response data
            response_data = {
                "id": serializer.data["id"],
                "email": serializer.data["user"]["email"],
                "first_name": serializer.data["user"]["first_name"],
                "last_name": serializer.data["user"]["last_name"],
                "role": serializer.data["user"]["role"],
                "is_verified": serializer.data["user"]["is_verified"],
                "date_of_birth": serializer.data["date_of_birth"],
                "gender": serializer.data["gender"],
                "address": serializer.data["address"],
                "emergency_contact": serializer.data["emergency_contact"],
                "insurance_provider": serializer.data["insurance_provider"],
                "insurance_id": serializer.data["insurance_id"],
                "country": serializer.data["country"],
                "unique_id": serializer.data["unique_id"]
            }
            
            return custom_200("Profile retrived successfully",response_data)
        except PatientProfile.DoesNotExist:
            return custom_404("Patient profile not found. Please complete your profile registration.")
        except Exception as e:
            return custom_404(f"Error fetching patient profile: {str(e)}")


# update patient profile api
class UpdatePatientProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def patch(self, request):
        try:
            # Get the patient profile using the user from the token
            patient = PatientProfile.objects.get(user=request.user)
            
            # Update the patient profile
            serializer = PatientProfileSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Format the response data
                response_data = {
                    "id": serializer.data["id"],
                    "email": serializer.data["user"]["email"],
                    "first_name": serializer.data["user"]["first_name"],
                    "last_name": serializer.data["user"]["last_name"],
                    "role": serializer.data["user"]["role"],
                    "is_verified": serializer.data["user"]["is_verified"],
                    "date_of_birth": serializer.data["date_of_birth"],
                    "gender": serializer.data["gender"],
                    "address": serializer.data["address"],
                    "emergency_contact": serializer.data["emergency_contact"],
                    "insurance_provider": serializer.data["insurance_provider"],
                    "insurance_id": serializer.data["insurance_id"],
                    "country": serializer.data["country"],
                    "unique_id": serializer.data["unique_id"]
                }
                
                return custom_200("Updated Successfully",response_data)
            return custom_404(serializer.errors)
            
        except PatientProfile.DoesNotExist:
            return custom_404("Patient profile not found. Please complete your profile registration.")
        except Exception as e:
            return custom_404(f"Error updating patient profile: {str(e)}")


#get the user by login user
class GetUserByLoginUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        serializer = UserSerializer(user)
        return custom_200("User details retreived",serializer.data)


# book appointment api by patient and also by front office staff that is admin staff and sending notifications
class BookAppointmentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def check_doctor_availability(self, doctor_id, date, time):
        """
        Checks if the doctor is available on the given date and time based on:
        - DoctorAvailability model (day of week, start_time, end_time)
        - No overlapping Appointment at the same date and time
        - Doctor is not on leave (optional, not implemented here)
        """
      

        try:
            # Get the weekday name from the date
            weekday = datetime.datetime.strptime(date, "%Y-%m-%d").strftime('%A')
            # Check if doctor has availability on this weekday
            availability = DoctorAvailability.objects.filter(
                doctor=doctor_id,
                day_of_week=weekday
            ).first()
            if not availability:
                return False, "Doctor is not available on this day."

            # Check if the requested time is within the available time range
            input_time = datetime.datetime.strptime(time, "%H:%M").time()
            if not (availability.start_time <= input_time <= availability.end_time):
                return False, "Requested time is outside doctor's working hours."

            # Check for overlapping appointment
            overlapping = Appointment.objects.filter(
                doctor_id=doctor_id,
                date=date,
                time=time,
                status='Scheduled'
            ).exists()
            if overlapping:
                return False, "Doctor already has an appointment at this time."

            return True, ""
        except Exception as e:
            print(f"Error checking doctor availability: {str(e)}")
            return False, "Error checking doctor availability."

    def post(self, request):
        doctor_id = request.data.get('doctor')
        appointment_date = request.data.get('date')
        appointment_time = request.data.get('time')

        try:
            # Check if doctor is available (using new logic)
            is_available, reason = self.check_doctor_availability(doctor_id, appointment_date, appointment_time)
            if not is_available:
                return custom_404(f"Doctor is not available at the selected date and time. {reason} Please choose another slot.")

            # Get patient user (ProfileUser)
            if 'patient' in request.data:
                patient_profile = PatientProfile.objects.get(user__id=request.data.get('patient'))
            else:
                patient_profile = PatientProfile.objects.get(user=request.user)

            patient_user = patient_profile.user  # 👈 Get the ProfileUser from PatientProfile

            # Prepare data for serializer
            appointment_data = request.data.copy()
            appointment_data['patient'] = patient_user.id  # ✅ Correct: pass ProfileUser ID
            appointment_data['status'] = 'Scheduled'

            serializer = BookAppointmentSerializer(data=appointment_data)
            if serializer.is_valid():
                appointment = serializer.save()

                # Update doctor's availability (optional: you may want to remove this if not needed)
                doctor_user = appointment.doctor
                try:
                    doctor_profile = DoctorProfile.objects.get(user=doctor_user)
                    doctor_profile.is_available = False
                    doctor_profile.save()
                except DoctorProfile.DoesNotExist:
                    pass  # If not found, skip

                # Notifications
                Notification.objects.create(
                    user=patient_user,
                    appointment=appointment,
                    notification_type='appointment_created',
                    title='Appointment Booked',
                    message=f"Your appointment with Dr. {doctor_user.get_full_name()} on {appointment.date} at {appointment.time} is confirmed."
                )

                Notification.objects.create(
                    user=doctor_user,
                    appointment=appointment,
                    notification_type='appointment_created',
                    title='New Appointment',
                    message=f"You have a new appointment with {patient_user.get_full_name()} on {appointment.date} at {appointment.time}."
                )

                # Emails
                send_email_notification(
                    subject="Your Appointment is Confirmed",
                    message=f"Dear {patient_user.get_full_name()},\n\nYour appointment with Dr. {doctor_user.get_full_name()} is scheduled on {appointment.date} at {appointment.time}.",
                    recipient_list=[patient_user.email]
                )

                send_email_notification(
                    subject="New Appointment Scheduled",
                    message=f"Dear Dr. {doctor_user.get_full_name()},\n\nYou have a new appointment with {patient_user.get_full_name()} on {appointment.date} at {appointment.time}.",
                    recipient_list=[doctor_user.email]
                )

                return custom_200("Appointment booked successfully")

            return custom_404(serializer.errors)

        except PatientProfile.DoesNotExist:
            return custom_404("Patient not found")
        except DoctorProfile.DoesNotExist:
            return custom_404("Doctor profile not found")
        except Exception as e:
            return custom_404(f"Error booking appointment: {str(e)}")

# edit appointment
class EditAppointmentAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def patch(self, request, appointment_id):
        try:
            # Get the appointment
            appointment = Appointment.objects.get(id=appointment_id)
            user = request.user

            # Check if user is patient, doctor, or administrative staff
            allowed = False
            if appointment.patient == user or appointment.doctor == user:
                allowed = True
            else:
                # Check if user is admin staff
                if hasattr(user, 'administrativestaffprofile'):
                    allowed = True

            if not allowed:
                return custom_404("You do not have permission to edit this appointment.")

            data = request.data

            # Allow updating date, time, status, notes
            allowed_fields = ['date', 'time', 'status', 'notes']
            updated = False
            for field in allowed_fields:
                if field in data:
                    setattr(appointment, field, data[field])
                    updated = True

            if not updated:
                return custom_404("No valid fields to update.")

            appointment.save()

            # Send notification to both patient and doctor
            Notification.objects.create(
                user=appointment.patient,
                appointment=appointment,
                notification_type='appointment_updated',
                title='Appointment Updated',
                message=f"Your appointment with Dr. {appointment.doctor.get_full_name()} has been updated to {appointment.date} at {appointment.time}."
            )
            Notification.objects.create(
                user=appointment.doctor,
                appointment=appointment,
                notification_type='appointment_updated',
                title='Appointment Updated',
                message=f"Your appointment with {appointment.patient.get_full_name()} has been updated to {appointment.date} at {appointment.time}."
            )

            # Send emails
            send_email_notification(
                subject="Appointment Updated",
                message=f"Dear {appointment.patient.get_full_name()},\n\nYour appointment with Dr. {appointment.doctor.get_full_name()} has been updated to {appointment.date} at {appointment.time}.",
                recipient_list=[appointment.patient.email]
            )
            send_email_notification(
                subject="Appointment Updated",
                message=f"Dear Dr. {appointment.doctor.get_full_name()},\n\nYour appointment with {appointment.patient.get_full_name()} has been updated to {appointment.date} at {appointment.time}.",
                recipient_list=[appointment.doctor.email]
            )

            return custom_200("Appointment updated successfully")
        except Appointment.DoesNotExist:
            return custom_404("Appointment not found")
        except Exception as e:
            return custom_404(f"Error updating appointment: {str(e)}")

# cancel appointment 
class CancelAppointmentAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            user = request.user

            # Check if user is patient, doctor, or administrative staff
            allowed = False
            if appointment.patient == user or appointment.doctor == user:
                allowed = True
            else:
                # Check if user is admin staff
                if hasattr(user, 'administrativestaffprofile'):
                    allowed = True

            if not allowed:
                return custom_404("You do not have permission to cancel this appointment.")

            # Only allow cancelling if not already cancelled
            if appointment.status == 'Cancelled':
                return custom_404("Appointment is already cancelled.")

            appointment.status = 'Cancelled'
            appointment.save()

            # Send notification to both patient and doctor
            Notification.objects.create(
                user=appointment.patient,
                appointment=appointment,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f"Your appointment with Dr. {appointment.doctor.get_full_name()} on {appointment.date} at {appointment.time} has been cancelled."
            )
            Notification.objects.create(
                user=appointment.doctor,
                appointment=appointment,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f"Your appointment with {appointment.patient.get_full_name()} on {appointment.date} at {appointment.time} has been cancelled."
            )

            # Send emails
            send_email_notification(
                subject="Appointment Cancelled",
                message=f"Dear {appointment.patient.get_full_name()},\n\nYour appointment with Dr. {appointment.doctor.get_full_name()} on {appointment.date} at {appointment.time} has been cancelled.",
                recipient_list=[appointment.patient.email]
            )
            send_email_notification(
                subject="Appointment Cancelled",
                message=f"Dear Dr. {appointment.doctor.get_full_name()},\n\nYour appointment with {appointment.patient.get_full_name()} on {appointment.date} at {appointment.time} has been cancelled.",
                recipient_list=[appointment.doctor.email]
            )

            return custom_200("Appointment cancelled successfully")
        except Appointment.DoesNotExist:
            return custom_404("Appointment not found")
        except Exception as e:
            return custom_404(f"Error cancelling appointment: {str(e)}")





# list all doctors api
class ListAllCardiologist(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            # Get all doctors
            doctors = DoctorProfile.objects.all()
            
            # Serialize the data
            serializer = ListallDcotorsSerializer(doctors, many=True)
            
            # Format the response data
            response_data = []
            for doctor in serializer.data:
                formatted_doctor = {
                    "id": doctor["id"],
                    "user_id":doctor["user"]["id"],
                    "email": doctor["user"]["email"],
                    "first_name": doctor["user"]["first_name"],
                    "last_name": doctor["user"]["last_name"],
                    "role": doctor["user"]["role"],
                    "is_verified": doctor["user"]["is_verified"],
                    "specialization": doctor["specialization"],
                    "experience": doctor["experience"],
                    "availability": doctor["availability"],
                    "fees": doctor["fees"],
                    "is_available": doctor["is_available"],
                    "date_of_birth": doctor["date_of_birth"],
                    "gender": doctor["gender"],
                    "address": doctor["address"],
                    "emergency_contact": doctor["emergency_contact"]
                }
                response_data.append(formatted_doctor)

            return custom_200("Doctors retrieved successfully",response_data)
            
        except Exception as e:
            return custom_404(f"Error fetching doctors: {str(e)}")


# list login patients appointents
class ListPatientAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        patient = request.user
        try:
         appointments = Appointment.objects.filter(patient=patient).order_by('date','time')
         serializer = AppointmentListSerializer(appointments,many=True)
         return custom_200("Appointments listed successfully",serializer.data)
        except Appointment.DoesNotExist:
            return custom_404("Not appointment found")
        

# get one upcoming appointment
class ListUpcomingAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = request.user
        today = now().date()
        time_now = now().time()

        upcoming_appointments = Appointment.objects.filter(
            patient=patient,
            status='Scheduled'
        ).filter(
            date__gt=today
        ) | Appointment.objects.filter(
            patient=patient,
            status='Scheduled',
            date=today,
            time__gte=time_now
        )

        upcoming_appointments = upcoming_appointments.order_by('date', 'time')
        serializer = AppointmentListSerializer(upcoming_appointments, many=True)
        return custom_200("Upcoming appointments listed successfully", serializer.data)


