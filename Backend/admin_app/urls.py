from django.urls import path
from . views import *

urlpatterns = [
   
    path('all-users/', UserListAPIView.as_view(), name='all-users'),
]
   