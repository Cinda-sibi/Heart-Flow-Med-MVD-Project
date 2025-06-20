from django.urls import path
from . views import *

urlpatterns = [
   
    path('list-all-doctors/',ListAllCardiologist.as_view(),name='list-all-doctors'),
    path('get-patient-profile/',GetPatientProfileByIDAPIView.as_view(),name='get-patient-profile'),
    path('update-patient-profile/',UpdatePatientProfileAPIView.as_view(),name='update-patient-profile'),
    path('book-appointment/',BookAppointmentAPIView.as_view(),name='book-appointment'),
    path('edit-appointment/<int:appointment_id>/',EditAppointmentAPIView.as_view(),name='edit-appointment'),
    path('cancel-appointment/<int:appointment_id>/',CancelAppointmentAPIView.as_view(),name='cancel-appointment'),

    path('list-patient-appointment/',ListPatientAppointments.as_view(),name='list-patient-appointment'),
    path('list-upcoming-appointments/',ListUpcomingAppointments.as_view(),name='list-upcoming-appointments'),
]