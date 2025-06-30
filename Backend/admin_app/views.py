

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser , AllowAny , IsAuthenticated
from heart_flow_app.models import ProfileUser
from . serializers import ProfileUserListSerializer
from gp_app.models import *
from gp_app.serializers import *
from heart_flow_app.mixins import *
from . serializers import *



# list all users 
class UserListAPIView(APIView):
    permission_classes = [AllowAny]
    # permission_classes = [IsAdminUser]  # Uncomment if only admin should access

    def get(self, request, *args, **kwargs):
        users = ProfileUser.objects.all()
        serializer = ProfileUserListSerializer(users, many=True)
        return custom_200("User details listed successfully",serializer.data)


# list registered and accepted patients list 
class OngoingLinkedReferralsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter referrals with status="Ongoing" and where linked_patient is not null
        referrals = PatientReferral.objects.filter(status="Ongoing", linked_patient__isnull=False)
        serializer = PatientReferralSerializer(referrals, many=True)
        return custom_200("Ongoing referrals",serializer.data)

# list tests available
class DiagnosticTestListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tests = DiagnosticTest.objects.all()
        serializer = DiagnosticTestSerializer(tests, many=True)
        return custom_200("List of available diagnostic tests", serializer.data)

# booking appointment for tests 
class BookDiagnosticAppointment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "Admin":
            return custom_404("Only Admins can book diagnostic appointments.")

        serializer = DiagnosticAppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save(booked_by=request.user)
            staff = appointment.assigned_staff
            Notification.objects.create(
                user=staff,
                notification_type='appointment_created',
                title='New Diagnostic Appointment Assigned',
                message=f"You have been assigned to a diagnostic test for patient {appointment.patient.user.get_full_name()} on {appointment.date} at {appointment.time}.",
                appointment=appointment  # This must be compatible with your Notification model (see note below)
            )
            return custom_200("DiagnosticTest Appointment booked successfully ",serializer.data)
        return custom_404(serializer.errors)

# list diagonistic appointments
class DiagnosticAppointmentListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Optionally filter based on user role
        user = request.user
        if user.role in ['Nurse', 'Sonographer']:
            appointments = DiagnosticAppointment.objects.filter(assigned_staff=user)
        else:
            appointments = DiagnosticAppointment.objects.all()

        appointments = appointments.select_related('patient__user', 'assigned_staff', 'test')
        serializer = DiagnosticAppointmentListSerializer(appointments, many=True)
        return custom_200("List of diagnostic test appointments", serializer.data)    


# update and delete test appointments
class DiagnosticAppointmentUpdateDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return DiagnosticAppointment.objects.get(pk=pk)
        except DiagnosticAppointment.DoesNotExist:
            return None

    def patch(self, request, pk):
        if request.user.role != "Admin":
            return custom_404("Only Admins can update diagnostic appointments.")

        appointment = self.get_object(pk)
        if not appointment:
            return custom_404("Diagnostic appointment not found.")

        serializer = DiagnosticAppointmentSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            updated_appointment = serializer.save()

            staff = updated_appointment.assigned_staff
            Notification.objects.create(
                user=staff,
                notification_type='appointment_updated',
                title='Diagnostic Appointment Updated',
                message=(
                    f"Your diagnostic test appointment for patient "
                    f"{updated_appointment.patient.user.get_full_name()} on "
                    f"{updated_appointment.date} at {updated_appointment.time} has been updated.",
                ),
                appointment=updated_appointment
            )

            return custom_200("Diagnostic appointment updated successfully.", serializer.data)
        return custom_404(serializer.errors)

    def delete(self, request, pk):
        if request.user.role != "Admin":
            return custom_404("Only Admins can delete diagnostic appointments.")

        appointment = self.get_object(pk)
        if not appointment:
            return custom_404("Diagnostic appointment not found.")

        staff = appointment.assigned_staff
        Notification.objects.create(
            user=staff,
            notification_type='appointment_cancelled',
            title='Diagnostic Appointment Cancelled',
            message=(
                f"Your diagnostic test appointment for patient "
                f"{appointment.patient.user.get_full_name()} on "
                f"{appointment.date} at {appointment.time} has been cancelled."
            )
        )

        appointment.delete()
        return custom_200("Diagnostic appointment deleted successfully.")


# user registration
class RegisterUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return custom_200(f"{user.role} registered successfully.",user.email)
        return custom_404(serializer.errors)    
    
# user update 
class EditUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, user_id):
        try:
            user = ProfileUser.objects.get(id=user_id)
        except ProfileUser.DoesNotExist:
            return custom_404("User not found.")

        serializer = UserUpdateSerializer(user, data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return custom_200("User updated successfully.")
        return custom_404(serializer.errors)    
    
# delete api
class DeleteUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, user_id):
        try:
            user = ProfileUser.objects.get(id=user_id)
            user.delete()
            return custom_200("User deleted successfully.")
        except ProfileUser.DoesNotExist:
            return custom_404("User not found.")    
        
# list users by role
class ListUsersByRoleAPIView(APIView):
    def get(self, request):
        role = request.query_params.get('role')  # Example: ?role=Patient

        if not role:
            return custom_404("Please provide a 'role' query parameter.")

        users = ProfileUser.objects.filter(role=role)
        serializer = UserListByRoleSerializer(users, many=True)
        return custom_200("User listed successflly",serializer.data)


# list staffs for assigning the blood tests
class AssignableStaffListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # List all staff with role Nurse or Sonographer
        staff_members = ProfileUser.objects.filter(role__in=['Nurse', 'Sonographer'])

        serializer = AssignedStaffListSerializer(staff_members, many=True)
        return custom_200("Assignable staff list", serializer.data)
