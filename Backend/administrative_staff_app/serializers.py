from rest_framework import serializers
from .models import *

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor_full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = DoctorAvailability
        fields = '__all__'
        read_only_fields = ['doctor_full_name']

    def get_doctor_full_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

class DoctorLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLeave
        fields = '__all__'
