from django.urls import path
from . views import *

urlpatterns = [
    path('user-registration/',RoleBasedRegistrationAPIView.as_view(),name='user-registration'),
    # path('patient-registration/',PatientRegisterView.as_view(),name='pateint-registration'),
    path('user-login/',UserLoginAPIView.as_view(),name='user-login'),
    path('verify-otp/',VerifyOTPView.as_view(),name='verify-otp'),
    path('resend-otp/',ResendOTPAPIView.as_view(),name='resend-otp'),
    # path('cardiologist-registration/',CardiologistRegisterView.as_view(),name='cardiologist-registration'),
    # path('administrative-staff/',AdministrativeStaffRegistration.as_view(),name='administrative-staff'),
    path('get-all-user-profile/',GetUsersProfile.as_view(),name='get-all-user-profile'),
    path('update-user-profile/',UpdateUserProfileAPIView.as_view(),name='update-user-profile'),

    # search

    path('search-patient/',SearchPatientAPIView.as_view(),name='search-patient'),
    path('search-doctor/',SearchDoctorAPIView.as_view(),name='search-doctor'),

    path('my-notifications/', UserNotificationListAPIView.as_view(), name='my-notifications'),
# forgot password 
    path('forgot-password-request/', ForgotPasswordRequestAPIView.as_view(),name='forgot-password-request'),
    path('reset-password/', ResetPasswordAPIView.as_view(),name='reset-password'),
    
]