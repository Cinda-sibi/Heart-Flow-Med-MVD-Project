from rest_framework import serializers
from heart_flow_app.models import *
from  patient_app.serializers import ProfileUserSerializer
from . models import *
from gp_app.models import *

class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField() 
    class Meta:
        model = Appointment
        fields = ['id','doctor','patient','patient_name','doctor_name','date','time','status','notes']

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"  

    def get_time(self, obj):
        # Format time to 12-hour format with AM/PM
        return obj.time.strftime('%I:%M %p')  # Example: 02:45 PM 
    

class ListallPatientsSerializer(serializers.ModelSerializer):
    user = ProfileUserSerializer()
    class Meta:
        model = PatientProfile
        fields = '__all__'

# sonography referral and report uploading 

# serializers.py
# list all sonographers 
class SonographerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ProfileUser
        fields = ['id', 'email', 'phone', 'full_name', 'is_verified', 'user_images']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class SonographyReferralSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    sonographer_name = serializers.SerializerMethodField()

    class Meta:
        model = SonographyReferral
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'sonographer', 'sonographer_name', 'appointment',
            'reason', 'referral_date', 'status', 'notes', 'report'
        ]
        read_only_fields = ['referral_date', 'report']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name()

    def get_sonographer_name(self, obj):
        return obj.sonographer.get_full_name()


class SonographyReferralReportSerializer(serializers.ModelSerializer):
    notes = serializers.CharField(max_length =500,required=False,allow_null = True)
    class Meta:
        model = SonographyReferral
        fields = ['id', 'report', 'notes','status']
        read_only_fields = ['id']


class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['medication', 'dosage', 'frequency', 'duration']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'prescribed_by', 'created_at', 'items']
        read_only_fields = ['patient', 'prescribed_by', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        prescription = Prescription.objects.create(**validated_data)
        for item in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item)
        return prescription



class DoctorNotesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientReferral
        fields = ['doctor_notes','status']
        read_only_fields = ['status']