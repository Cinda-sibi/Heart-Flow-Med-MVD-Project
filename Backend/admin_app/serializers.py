# serializers.py
from rest_framework import serializers
from heart_flow_app.models import *
from . models import *
import random
import string
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail


# user list
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



# diagnostic appointment serializers
class DiagnosticTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticTest
        fields = ['id','name']


class DiagnosticAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticAppointment
        fields = '__all__'
        read_only_fields = ['booked_by', 'created_at']



class DiagnosticAppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    staff_name = serializers.CharField(source='assigned_staff.get_full_name', read_only=True)
    test_name = serializers.CharField(source='test.name', read_only=True)

    class Meta:
        model = DiagnosticAppointment
        fields = [
            'id', 'patient_name', 'test_name', 'date', 'time',
            'status', 'staff_name', 'notes'
        ]

# user registration
class UserRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=ProfileUser.ROLE_CHOICES)
    gender = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    additional_data = serializers.DictField(child=serializers.CharField(), required=False)  # for role-specific data

    def create(self, validated_data):
        role = validated_data['role']
        additional_data = validated_data.get('additional_data', {})

        # Auto-generate random 8-character password
        raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        hashed_password = make_password(raw_password)

        # Create the user
        user = ProfileUser.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=role,
            password=hashed_password,
        )

        # Create corresponding role-specific profile
        if role == "Patient":
            PatientProfile.objects.create(
                user=user,
                gender=validated_data.get("gender"),
                age=validated_data.get("age"),
                medical_reference_no=additional_data.get("medical_reference_no"),
                id_records=additional_data.get("id_records")
            )

        elif role == "Cardiologist":
            DoctorProfile.objects.create(
                user=user,
                gender=validated_data.get("gender"),
                date_of_birth=additional_data.get("date_of_birth"),
                address=additional_data.get("address"),
                emergency_contact=additional_data.get("emergency_contact"),
                specialization=additional_data.get("specialization"),
                experience=additional_data.get("experience"),
                fees=additional_data.get("fees"),
            )

        elif role == "Nurse":
            NurseProfile.objects.create(
                user=user,
                department=additional_data.get("department"),
                shift=additional_data.get("shift")
            )

        elif role == "Sonographer":
            SonographerProfile.objects.create(
                user=user,
                certification=additional_data.get("certification")
            )

        elif role == "Administrative Staff":
            AdministrativeStaffProfile.objects.create(
                user=user,
                office_location=additional_data.get("office_location"),
                department=additional_data.get("department"),
                job_title=additional_data.get("job_title", "Front Office Staff"),
                shift=additional_data.get("shift"),
                working_hours=additional_data.get("working_hours"),
                extension_number=additional_data.get("extension_number"),
                gender=validated_data.get("gender"),
                age=validated_data.get("age"),
                address=additional_data.get("address")
            )

        # Send welcome email
        send_mail(
            subject="Welcome to HeartFlowMed",
            message=(
                f"Dear {user.get_full_name()},\n\n"
                f"Your account has been created successfully.\n"
                f"Login Email: {user.email}\n"
                f"Temporary Password: {raw_password}\n\n"
                f"Please log in and change your password.\n\n"
                f"- HeartFlow Med Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user
    
# user update 
class UserUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    gender = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    additional_data = serializers.DictField(child=serializers.CharField(), required=False)

    def update(self, instance, validated_data):
        # Update user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        role = instance.role
        profile = None
        additional_data = validated_data.get("additional_data", {})

        if role == "Patient":
            profile = getattr(instance, 'patientprofile', None)
            if profile:
                profile.gender = validated_data.get("gender", profile.gender)
                profile.age = validated_data.get("age", profile.age)
                profile.medical_reference_no = additional_data.get("medical_reference_no", profile.medical_reference_no)
                profile.save()

        elif role == "Cardiologist":
            profile = getattr(instance, 'doctorprofile', None)
            if profile:
                profile.gender = validated_data.get("gender", profile.gender)
                profile.address = additional_data.get("address", profile.address)
                profile.experience = additional_data.get("experience", profile.experience)
                profile.specialization = additional_data.get("specialization", profile.specialization)
                profile.fees = additional_data.get("fees", profile.fees)
                profile.save()

        elif role == "Nurse":
            profile = getattr(instance, 'nurseprofile', None)
            if profile:
                profile.department = additional_data.get("department", profile.department)
                profile.shift = additional_data.get("shift", profile.shift)
                profile.save()

        elif role == "Sonographer":
            profile = getattr(instance, 'sonographerprofile', None)
            if profile:
                profile.certification = additional_data.get("certification", profile.certification)
                profile.save()

        elif role == "Administrative Staff":
            profile = getattr(instance, 'administrativestaffprofile', None)
            if profile:
                profile.gender = validated_data.get("gender", profile.gender)
                profile.age = validated_data.get("age", profile.age)
                profile.department = additional_data.get("department", profile.department)
                profile.shift = additional_data.get("shift", profile.shift)
                profile.working_hours = additional_data.get("working_hours", profile.working_hours)
                profile.job_title = additional_data.get("job_title", profile.job_title)
                profile.save()

        return instance    
    
# list users based on role 
class UserListByRoleSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ProfileUser
        fields = ['id', 'full_name', 'email', 'role', 'is_verified']

    def get_full_name(self, obj):
        return obj.get_full_name()

# listing the assigned staffs 

class AssignedStaffListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name')

    class Meta:
        model = ProfileUser
        fields = ['id', 'full_name', 'email', 'role']
