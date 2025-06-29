from django.urls import path
from . views import *

urlpatterns = [
     path('list-all-patients/',ListPatientsAPIView.as_view(),name='list-patients'),
     path('doctor-recent-3-patients/', ListRecentThreePatientsByDoctor.as_view(),name='doctor-recent-3-patients'),

     path('list-patients-by-login-doc/',ListPatientsByDoctors.as_view(),name='list-patients-by-doc'),
     path('doc-patient-by-id/<int:patient_id>/', DoctorPatientDetailAPIView.as_view(), name='doc-patient-by-id'),

     path('list-todays-appointment/',ListTodaysAppointments.as_view(),name='list-todays-appointment'),
     path('list-doc-all-appointment/',ListAllDoctorAppointments.as_view(),name='list-doc-all-appointment'),
     path('list-doc-availability/',DoctorOwnAvailabilityAPIView.as_view(),name='list-doc-availability'),

    path('doctor-patient-count/', DoctorPatientCountAPIView.as_view(),name='doctor-patient-count'),
    path('doctor-todays-appointments-count/', TodaysAppointmentsCountAPIView.as_view(),name='doctor-todays-appointments-count'),

# sonographers referral , upload report , list sonographers 
    path('list-sonographers/',SonographerListAPIView.as_view(),name='list-sonographers'),

    path('sonography-referral/', SonographyReferralView.as_view(), name='sonography-referral'),
    path('sonography-referral-upload-report/<int:pk>/', SonographyReportUploadView.as_view(), name='sonography-referral-upload-report'),
     path('latest-sonography-referrals/', LatestSonographyReferralsView.as_view(),name='latest-sonography-referrals '),

     path('sonography-report/<int:referral_id>/', SonographyReportByReferralView.as_view(),name='sonography-report'),

    path('appointments-prescribe/<int:appointment_id>/', WritePrescriptionAPIView.as_view(), name='write-prescription'),

    path('add-notes-by-doc/<int:referral_id>/',AddDoctorNotesAPIView.as_view(),name='add-notes-by-doc'),
    path('referrals-by-status/<str:status>/', ReferralListByStatusAPIView.as_view(), name='referrals-by-status'),

    path('patients-test-results/<int:patient_id>/', PatientTestResultListAPIView.as_view(), name='patients-test-results'),


]