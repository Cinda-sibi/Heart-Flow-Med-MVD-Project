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
    
    def to_representation(self, instance):
        """ Format start_time and end_time as 12-hour AM/PM in the output """
        rep = super().to_representation(instance)
        rep['start_time'] = instance.start_time.strftime('%I:%M %p') if instance.start_time else None
        rep['end_time'] = instance.end_time.strftime('%I:%M %p') if instance.end_time else None
        return rep



class DoctorLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLeave
        fields = '__all__'
