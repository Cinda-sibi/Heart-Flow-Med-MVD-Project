

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


# booking appointment for tests 
class BookDiagnosticAppointment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "Admin":
            return custom_404("Only Admins can book diagnostic appointments.")

        serializer = DiagnosticAppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(booked_by=request.user)
            return custom_200("DiagnosticTest Appointment booked successfully ",serializer.data)
        return custom_404(serializer.errors)
    

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
