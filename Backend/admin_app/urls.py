from django.urls import path
from . views import *

urlpatterns = [
   
    path('all-users/', UserListAPIView.as_view(), name='all-users'),
    path('users-by-role/', ListUsersByRoleAPIView.as_view(), name='list-users-by-role'),
    path('referrals-ongoing-linked/', OngoingLinkedReferralsAPIView.as_view(), name='referrals-ongoing-linked'),
    path('book-diagnostic-appointment/', BookDiagnosticAppointment.as_view(), name='book-diagnostic-appointment'),
    path('diagnostic-appointments-list/', DiagnosticAppointmentListAPIView.as_view(), name='diagnostic-appointment-list'),
   
    path('diagnostic-appointments-edit/<int:pk>/', DiagnosticAppointmentUpdateDeleteAPIView.as_view(), name='diagnostic-appointments-edit'),

    path('user-register-by-admin/',RegisterUserAPIView.as_view(),name='user-register-by-admin'),
    path('edit-users/<int:user_id>/', EditUserAPIView.as_view(), name='edit-user'),
    path('delete-user/<int:user_id>/', DeleteUserAPIView.as_view(), name='delete-user'),


 
    path('diagnostic-tests/', DiagnosticTestListAPIView.as_view(), name='diagnostic-test-list'),
    path('assignable-staff-list/', AssignableStaffListAPIView.as_view(), name='assignable-staff-list'),

]

   