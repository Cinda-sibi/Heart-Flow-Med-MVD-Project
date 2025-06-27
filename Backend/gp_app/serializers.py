
from rest_framework import serializers
from . models import *
from heart_flow_app.models import AdministrativeStaffProfile, ProfileUser

class AdministrativeStaffProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    user_images = serializers.ImageField(source='user.user_images', read_only=True)

    class Meta:
        model = AdministrativeStaffProfile
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'is_verified',
            'user_images',
            'office_location',
            'department',
            'job_title',
            'shift',
            'working_hours',
            'extension_number',
            'gender',
            'age',
            'address'
        ]

# serializer for patient referral
class PatientReferralSerializer(serializers.ModelSerializer):
    referred_by_name = serializers.CharField(source='referred_by.get_full_name', read_only=True)
    referred_to = serializers.CharField(required=False , allow_blank=True)
    transcription = serializers.CharField(required=False , allow_blank=True)
    summary = serializers.CharField(required=False , allow_blank=True)
    audio_file = serializers.FileField(required=False , allow_null=True)
    medical_reference_no = serializers.CharField(required=False , allow_blank=True)

    class Meta:
        model = PatientReferral
        fields = [
            'id',
            'referred_by',
            'referred_to',
            'referred_by_name',
            'patient_first_name',
            'patient_last_name',
            'patient_email',
            'patient_phone',
            'gender',
            'age',
            'reason',
            'symptoms',
            'referred_at',
            'status',
            'linked_patient',
            'doctor_notes',
            'medical_reference_no',
            'is_accepted',
            'transcription',
            'summary',
            'audio_file',
            'referral_pdf',
        ]
        read_only_fields = ['referred_at', 'linked_patient','referred_by','referred_by_name','referral_pdf']
