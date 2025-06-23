from django.urls import path
from . views import *

urlpatterns = [
     path('list-all-patients/',ListPatientsAPIView.as_view(),name='list-patients'),
     path('doctor-recent-3-patients/', ListRecentThreePatientsByDoctor.as_view(),name='doctor-recent-3-patients'),

     path('list-patients-by-login-doc/',ListPatientsByDoctors.as_view(),name='list-patients-by-doc'),
     path('list-todays-appointment/',ListTodaysAppointments.as_view(),name='list-todays-appointment'),
     path('list-doc-all-appointment/',ListAllDoctorAppointments.as_view(),name='list-doc-all-appointment'),
     path('list-doc-availability/',DoctorOwnAvailabilityAPIView.as_view(),name='list-doc-availability'),

    path('doctor-patient-count/', DoctorPatientCountAPIView.as_view(),name='doctor-patient-count'),
    path('doctor-todays-appointments-count/', TodaysAppointmentsCountAPIView.as_view(),name='doctor-todays-appointments-count'),

# sonographers referral , upload report , list sonographers 
    path('list-sonographers/',SonographerListAPIView.as_view(),name='list-sonographers'),
    path('sonography-referral/', SonographyReferralView.as_view(), name='sonography-referral'),
    path('sonography-referral-upload-report/<int:pk>/', SonographyReportUploadView.as_view(), name='sonography-referral-upload-report'),

]