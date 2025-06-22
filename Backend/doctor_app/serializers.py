from rest_framework import serializers
from heart_flow_app.models import *
from  patient_app.serializers import ProfileUserSerializer

class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    class Meta:
        model = Appointment
        fields = ['id','doctor','patient','patient_name','doctor_name','date','time','status','notes']

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"   
    

class ListallPatientsSerializer(serializers.ModelSerializer):
    user = ProfileUserSerializer()
    class Meta:
        model = PatientProfile
        fields = '__all__'