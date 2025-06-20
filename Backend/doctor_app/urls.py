from django.urls import path
from . views import *

urlpatterns = [
     path('list-all-patients/',ListPatientsAPIView.as_view(),name='list-patients'),
     path('list-patients-by-login-doc/',ListPatientsByDoctors.as_view(),name='list-patients-by-doc'),
     path('list-todays-appointment/',ListTodaysAppointments.as_view(),name='list-todays-appointment'),
]