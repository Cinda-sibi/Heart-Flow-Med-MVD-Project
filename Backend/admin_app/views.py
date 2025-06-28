

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
        return Response(serializer.data)


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