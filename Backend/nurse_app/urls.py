from django.urls import path
from . views import *

urlpatterns = [


    path('appointments-today/', TodaysAppointmentsAPIView.as_view(), name='todays-appointments'),
    path('diagnostic-tasks-summary-count/', DiagnosticTaskSummaryAPIView.as_view(), name='diagnostic-task-summary-count'),

    path('assigned-patients-list/', AssignedPatientsListAPIView.as_view(), name='assigned-patients-list'),
    path('diagnostic-results-upload/<int:appointment_id>/', UploadDiagnosticTestResultAPIView.as_view(), name='upload-diagnostic-result'),
 
]
   