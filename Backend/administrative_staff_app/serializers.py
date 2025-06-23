from rest_framework import serializers
from .models import *

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor_full_name = serializers.SerializerMethodField(read_only=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    class Meta:
        model = DoctorAvailability
        fields = '__all__'
        read_only_fields = ['doctor_full_name']

    def get_doctor_full_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"
    
    def get_start_time(self, obj):
        # Format time to 12-hour format with AM/PM
        return obj.start_time.strftime('%I:%M %p') 
    def get_end_time(self, obj):
        # Format time to 12-hour format with AM/PM
        return obj.end_time.strftime('%I:%M %p') 



class DoctorLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLeave
        fields = '__all__'
