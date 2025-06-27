from rest_framework import serializers
from .models import *
import random
import string
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from heart_flow_app.models import *
from django.conf import settings
from gp_app.models import *


class PatientRegistrationByAdministrativeStaffSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    gender = serializers.CharField(required=False,allow_blank=True)
    age = serializers.IntegerField(required=False,allow_null=True)
    medical_reference_no = serializers.CharField()
    id_records = serializers.FileField(required=False, allow_null=True)

    def create(self, validated_data):
        # Auto-generate a random 8-character password
        raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

        # Encrypt the password
        hashed_password = make_password(raw_password)

        # Create ProfileUser with encrypted password
        user = ProfileUser.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='Patient',
            password=hashed_password,
        )

        # Create associated PatientProfile
        patient_profile = PatientProfile.objects.create(
            user=user,
            gender=validated_data['gender'],
            age=validated_data['age'],
            medical_reference_no=validated_data['medical_reference_no'],
            id_records=validated_data.get('id_records', None),
        )
        try:
         referral = PatientReferral.objects.get(patient_email=user.email, linked_patient__isnull=True)
         referral.linked_patient = patient_profile
         referral.is_accepted = True
         referral.save()
        except PatientReferral.DoesNotExist:
          pass

        # Send email with raw password
        send_mail(
            subject="HeartFlowMed Patient Account Created",
            message=(
                f"Dear {user.get_full_name()},\n\n"
                f"Your patient account has been created.\n"
                f"Login Email: {user.email}\n"
                f"Temporary Password: {raw_password}\n\n"
                f"Please log in and change your password.\n\n"
                f"- HeartFlow Med Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )

        return user




class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    doctor_full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DoctorAvailability
        fields = '__all__'
        read_only_fields = ['doctor_full_name','id']

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
