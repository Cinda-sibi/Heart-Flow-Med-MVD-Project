from django.urls import path
from . views import *

urlpatterns = [
    path('list-administrative-staffs/', AdministrativeStaffListAPIView.as_view(), name='list-administrative-staff-list'),
    path('patient-referral/',PatientReferralListCreateAPIView.as_view(),name='patient-referral')
]