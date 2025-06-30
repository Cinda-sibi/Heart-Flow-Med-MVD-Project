from dataclasses import field
from rest_framework import serializers
from . models import *
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from heart_flow_app. utils import *
from admin_app.models import *

class ProfileUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_verified']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = ProfileUserSerializer() 
    class Meta:
        model = PatientProfile
        fields = '__all__'
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = ProfileUser.objects.create(**user_data)
        patient = PatientProfile.objects.create(user=user, **validated_data)
        return patient

    def update(self, instance, validated_data):
       user_data = validated_data.pop('user', None)  # Safely get 'user'
   
   
       if user_data:
           for attr, value in user_data.items():
               setattr(instance.user, attr, value)
           instance.user.save()
   
       for attr, value in validated_data.items():
           setattr(instance, attr, value)
       instance.save()
       return instance

    
class ListallDcotorsSerializer(serializers.ModelSerializer):
    user = ProfileUserSerializer()
    class Meta:
        model = DoctorProfile
        fields = '__all__'

# listing all users 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileUser
        fields = ['id','email','first_name','last_name','phone','role']


class BookAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        

# serializers.py
class PatientTestResultSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    test_name = serializers.CharField(source='appointment.test.name')
    appointment_date = serializers.DateField(source='appointment.date')
    appointment_time = serializers.TimeField(source='appointment.time')

    class Meta:
        model = DiagnosticTestResult
        fields = ['id', 'patient_name','test_name', 'appointment_date', 'appointment_time', 'result_summary', 'attached_report', 'recorded_at']
    
    def get_patient_name(self, obj):
        return obj.appointment.patient.user.get_full_name()