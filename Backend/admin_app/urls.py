from django.urls import path
from . views import *

urlpatterns = [
   
    path('all-users/', UserListAPIView.as_view(), name='all-users'),
    path('referrals-ongoing-linked/', OngoingLinkedReferralsAPIView.as_view(), name='referrals-ongoing-linked'),
    path('book-diagnostic-appointment/', BookDiagnosticAppointment.as_view(), name='book-diagnostic-appointment'),
]

   