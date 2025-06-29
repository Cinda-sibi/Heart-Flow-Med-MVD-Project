from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from heart_flow_app.mixins import *
from admin_app.models import DiagnosticAppointment
from . serializers import *
from datetime import date


# counts api
class DiagnosticTaskSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in ['Nurse', 'Sonographer']:
            return custom_404("Only nurses or sonographers can view task summaries.")

        assigned_appointments = DiagnosticAppointment.objects.filter(assigned_staff=user)

        total_assigned = assigned_appointments.count()
        completed = assigned_appointments.filter(status='Completed').count()
        pending = assigned_appointments.filter(status='Scheduled').count()

        return Response({
            "assigned_patients": total_assigned,
            "completed_tasks": completed,
            "pending_tasks": pending
        }, status=status.HTTP_200_OK)



# todays appointment for staffs
class TodaysAppointmentsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in ['Nurse', 'Sonographer']:
            return custom_404("Access denied. Only nurses or sonographers can view this.")

        today = date.today()
        appointments = DiagnosticAppointment.objects.filter(
            assigned_staff=user,
            date=today,
            status__in=['Scheduled', 'Completed']
        ).select_related('patient__user', 'test')

        serializer = AssignedPatientSerializer(appointments, many=True)
        return custom_200("List todays appointment",serializer.data)

# list assigned patients for nurse and sonographers
class AssignedPatientsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ['Nurse', 'Sonographer','IT Staff']:
            return custom_404("Only nurses or sonographers can access this list.")

        appointments = DiagnosticAppointment.objects.filter(assigned_staff=user).select_related('patient__user', 'test')
        serializer = AssignedPatientSerializer(appointments, many=True)
        return custom_200("Assigned patients list",serializer.data)

# upload results
class UploadDiagnosticTestResultAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            appointment = DiagnosticAppointment.objects.get(id=appointment_id)
        except DiagnosticAppointment.DoesNotExist:
            return custom_404("Appointment not found.")

        try:
            # Check if result exists to update
            result_instance = DiagnosticTestResult.objects.get(appointment=appointment)
            is_update = True
        except DiagnosticTestResult.DoesNotExist:
            result_instance = None
            is_update = False

        serializer = DiagnosticTestResultUploadSerializer(
            instance=result_instance,
            data=request.data,
            context={'request': request, 'appointment': appointment},
            partial=True  # Allow partial updates
        )

        if serializer.is_valid():
            serializer.save()
            if is_update:
                return custom_200("Diagnostic test result updated successfully.")
            else:
                return custom_200("Diagnostic test result uploaded successfully.")
        return custom_404(serializer.errors)

