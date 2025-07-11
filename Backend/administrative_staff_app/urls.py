from django.urls import path
from . views import *

urlpatterns = [
    path('add-patient/',AddPatientView.as_view(),name='add-patient'),
    path('get-patient-by-id/<int:patient_id>/',PatientDetailAPIView.as_view(),name='get-patient-by-id'),
    path('doctor-availability-by-id/<int:doctor_id>/', DoctorAvailabilityByDocIdView.as_view(),name='doctor-availability-by-id'),
    path('list-avilability/',AvailabilityList.as_view(),name='list-avilability'),
    path('create-list-doctor-availability/',DoctorAvailabilityListCreate.as_view(),name='create-list-doctor-availability'),
    path('update-availability/<int:pk>/', DoctorAvailabilityUpdateDelete.as_view(), name='update-availability'),
    path('doctor-leave/',DoctorLeaveCreate.as_view(),name='doctor-leave'),
    path('check-doctor-availability/',CheckDoctorAvailability.as_view(),name='check-doctor-availability'),

    path('list-all-appointments/',ListallAppointments.as_view(),name='list-all-appointments'),
    path('search-availability/',SearchDoctorAvailabilityAPIView.as_view(),name='search-availability'),
]
   