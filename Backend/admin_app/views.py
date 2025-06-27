from django.shortcuts import render

# Create your views here.
# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser , AllowAny
from heart_flow_app.models import ProfileUser
from . serializers import ProfileUserListSerializer

class UserListAPIView(APIView):
    permission_classes = [AllowAny]
    # permission_classes = [IsAdminUser]  # Uncomment if only admin should access

    def get(self, request, *args, **kwargs):
        users = ProfileUser.objects.all()
        serializer = ProfileUserListSerializer(users, many=True)
        return Response(serializer.data)




