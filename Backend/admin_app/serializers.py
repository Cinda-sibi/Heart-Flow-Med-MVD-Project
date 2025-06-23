# serializers.py

from rest_framework import serializers
from heart_flow_app.models import ProfileUser

class ProfileUserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ProfileUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'is_verified', 'user_images'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()
