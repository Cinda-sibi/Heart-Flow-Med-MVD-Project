from rest_framework import serializers
from . models import *
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from . utils import *

# class RegistrationSerailizer
# class PatientRegistrationSerializer(serializers.ModelSerializer):
#     # Include patient-specific fields
#     date_of_birth = serializers.DateField()
#     gender = serializers.CharField(max_length=10)
#     address = serializers.CharField()
#     emergency_contact = serializers.CharField(max_length=100)
#     insurance_provider = serializers.CharField(max_length=100, required=False, allow_blank=True)
#     insurance_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
#     country = serializers.CharField(max_length=55 , required=False , allow_blank=True)

#     class Meta:
#         model = ProfileUser
#         fields = ['email', 'password', 'phone', 'date_of_birth', 'gender', 'address','first_name','last_name',
#                   'emergency_contact', 'insurance_provider', 'insurance_id', 'country']

#     def create(self, validated_data):
#         # Extract PatientProfile fields
#         patient_data = {
#             'date_of_birth': validated_data.pop('date_of_birth'),
#             'gender': validated_data.pop('gender'),
#             'address': validated_data.pop('address'),
#             'emergency_contact': validated_data.pop('emergency_contact'),
#             'insurance_provider': validated_data.pop('insurance_provider', ''),
#             'insurance_id': validated_data.pop('insurance_id', ''),
#             'country': validated_data.pop('country',''),
#         }

#         # Create user with role 'Patient'
#         user = ProfileUser.objects.create(
#             email=validated_data['email'],
#             phone=validated_data.get('phone', ''),
#             role='Patient',
#             first_name=validated_data.get('first_name', ''),
#             last_name=validated_data.get('last_name', ''),
#             password=make_password(validated_data['password']),
#             is_verified=False
#         )
#         patient_id = generate_patient_id()
#         # Create patient profile
#         PatientProfile.objects.create(user=user, unique_id = patient_id,**patient_data)

#         return user

# login
class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

# verify otp 
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

# doctor registration serializer
# class CardiologistRegistrationSerializer(serializers.ModelSerializer):
#     emergency_contact = serializers.CharField(max_length=100)
#     address = serializers.CharField()
#     gender = serializers.CharField(max_length=10)
#     date_of_birth = serializers.DateField()
#     specialization = serializers.CharField(max_length=100,required=False,allow_blank=True)
#     experience = serializers.IntegerField(required=False,allow_null=True)
#     availability = serializers.CharField(max_length=100,required=False,allow_blank=True)
#     fees = serializers.DecimalField(max_digits=10, decimal_places=2,required=False,allow_null=True)

#     class Meta:
#         model = ProfileUser
#         fields = ['email', 'password', 'phone', 'date_of_birth', 'gender', 'address','first_name','last_name',
#                   'emergency_contact', 'specialization', 'experience', 'availability', 'fees']

#     def create(self, validated_data):
#         user = ProfileUser.objects.create(
#             email=validated_data['email'],
#             password=make_password(validated_data['password']),
#             phone=validated_data.get('phone', ''),
#             role='Cardiologist',
#             first_name=validated_data.get('first_name', ''),
#             last_name=validated_data.get('last_name', ''),
#             is_verified=False
#         )
#         doctor_data = {
#             'date_of_birth': validated_data.pop('date_of_birth'),
#             'gender': validated_data.pop('gender'),
#             'address': validated_data.pop('address'),
#             'emergency_contact': validated_data.pop('emergency_contact'),
#             'specialization': validated_data.pop('specialization',''),
#             'experience': validated_data.pop('experience',0),
#             'availability': validated_data.pop('availability',''),
#             'fees': validated_data.pop('fees',0.0),
#         }
#         DoctorProfile.objects.create(user=user, **doctor_data)
#         return user



# administrative staff registration serializer
# class AdministrativeStaffRegistrationSerializer(serializers.ModelSerializer):
#     address = serializers.CharField()
#     gender = serializers.CharField(max_length=10)
#     office_location = serializers.CharField(max_length=200,required=False,allow_blank=True)
#     # date_of_birth = serializers.DateField()
#     department = serializers.CharField(max_length=100,required=False,allow_blank=True)
#     working_hours = serializers.IntegerField(required=False,allow_null=True)
#     job_title = serializers.CharField(max_length=100,required=False,allow_blank=True)
#     shift = serializers.DecimalField(max_digits=10, decimal_places=2,required=False,allow_null=True)
#     extension_number  =  serializers.CharField(max_length=100,required=False,allow_blank=True)
#     gender =  serializers.CharField(max_length=100,required=False,allow_blank=True)
#     age = serializers.CharField(required=False,allow_blank=True)
#     address = serializers.CharField(required=False,allow_blank=True)

#     class Meta:
#         model = ProfileUser
#         fields = ['email', 'password', 'phone', 'gender', 'address','first_name','last_name','job_title','department','working_hours','extension_number','age','office_location','shift']

#     def create(self, validated_data):
#         user = ProfileUser.objects.create(
#             email=validated_data['email'],
#             password=make_password(validated_data['password']),
#             phone=validated_data.get('phone', ''),
#             role='Administrative Staff',
#             first_name=validated_data.get('first_name', ''),
#             last_name=validated_data.get('last_name', ''),
#             is_verified=False
#         )
#         staff_data = {
#             'department': validated_data.pop('department',''),
#             'gender': validated_data.pop('gender',''),
#             'address': validated_data.pop('address',''),
#             'age': validated_data.pop('age',''),
#             'extension_number': validated_data.pop('extension_number',''),
#             'job_title': validated_data.pop('job_title',''),
#             'working_hours': validated_data.pop('working_hours',''),
#             'shift': validated_data.pop('shift',''),
#             'office_location': validated_data.pop('office_location',''),
#         }
#         AdministrativeStaffProfile.objects.create(user=user, **staff_data)
#         return user
class BaseUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = ProfileUser
        fields = ['email', 'password', 'phone', 'first_name', 'last_name','role']

    def create_user(self, validated_data, role):
        user = ProfileUser.objects.create(
            email=validated_data['email'],
            password=make_password(validated_data['password']),
            phone=validated_data.get('phone', ''),
            role=role,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_verified=False
        )
        return user
    def create(self, validated_data):
        role = validated_data.get('role')
        return self.create_user(validated_data, role=role)
    
class PatientRegistrationSerializer(BaseUserSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=10,required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(max_length=100,required=False, allow_blank=True)
    age = serializers.CharField(max_length=5,required=False, allow_blank=True)
    insurance_provider = serializers.CharField(max_length=100, required=False, allow_blank=True)
    insurance_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    country = serializers.CharField(max_length=55, required=False, allow_blank=True)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            'date_of_birth', 'gender', 'address', 'emergency_contact',
            'insurance_provider', 'insurance_id', 'country','age'
        ]

    def create(self, validated_data):
        patient_data = {
            'date_of_birth': validated_data.pop('date_of_birth'),
            'gender': validated_data.pop('gender'),
            'address': validated_data.pop('address'),
            'emergency_contact': validated_data.pop('emergency_contact'),
            'insurance_provider': validated_data.pop('insurance_provider', ''),
            'insurance_id': validated_data.pop('insurance_id', ''),
            'country': validated_data.pop('country', ''),
            'age' : validated_data.pop('age', '0')
        }

        user = self.create_user(validated_data, role='Patient')
        patient_data['unique_id'] = generate_patient_id()
        PatientProfile.objects.create(user=user, **patient_data)
        return user    

class CardiologistRegistrationSerializer(BaseUserSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=10,required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(max_length=100,required=False, allow_blank=True)
    specialization = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.IntegerField(required=False, allow_null=True)
    availability = serializers.CharField(required=False, allow_blank=True)
    fees = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            'date_of_birth', 'gender', 'address', 'emergency_contact',
            'specialization', 'experience', 'availability', 'fees'
        ]

    def create(self, validated_data):
        doctor_data = {
            'date_of_birth': validated_data.pop('date_of_birth'),
            'gender': validated_data.pop('gender'),
            'address': validated_data.pop('address'),
            'emergency_contact': validated_data.pop('emergency_contact'),
            'specialization': validated_data.pop('specialization', ''),
            'experience': validated_data.pop('experience', None),
            'availability': validated_data.pop('availability', ''),
            'fees': validated_data.pop('fees', None),
        }

        user = self.create_user(validated_data, role='Cardiologist')
        DoctorProfile.objects.create(user=user, **doctor_data)
        return user

class AdministrativeStaffRegistrationSerializer(BaseUserSerializer):
    gender = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    working_hours = serializers.CharField(required=False, allow_blank=True)
    job_title = serializers.CharField(required=False, allow_blank=True)
    shift = serializers.CharField(required=False, allow_blank=True)
    extension_number = serializers.CharField(required=False, allow_blank=True)
    office_location = serializers.CharField(required=False, allow_blank=True)
    age = serializers.CharField(required=False, allow_blank=True)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            'gender', 'address', 'department', 'working_hours',
            'job_title', 'shift', 'extension_number', 'office_location', 'age'
        ]

    def create(self, validated_data):
        staff_data = {
            'gender': validated_data.pop('gender', ''),
            'address': validated_data.pop('address', ''),
            'department': validated_data.pop('department', ''),
            'working_hours': validated_data.pop('working_hours', ''),
            'job_title': validated_data.pop('job_title', ''),
            'shift': validated_data.pop('shift', ''),
            'extension_number': validated_data.pop('extension_number', ''),
            'office_location': validated_data.pop('office_location', ''),
            'age': validated_data.pop('age', '0'),
        }

        user = self.create_user(validated_data, role='Administrative Staff')
        AdministrativeStaffProfile.objects.create(user=user, **staff_data)
        return user
class NurseRegistrationSerializer(BaseUserSerializer):
    department = serializers.CharField(max_length=100)
    shift = serializers.CharField(max_length=50)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            'department', 'shift'
        ]

    def create(self, validated_data):
        nurse_data = {
            'department': validated_data.pop('department'),
            'shift': validated_data.pop('shift')
        }

        user = self.create_user(validated_data, role='Nurse')
        NurseProfile.objects.create(user=user, **nurse_data)
        return user
    
class SonographerRegistrationSerializer(BaseUserSerializer):
    certification = serializers.CharField(max_length=100)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + [
            'certification'
        ]

    def create(self, validated_data):
        certification = validated_data.pop('certification')
        user = self.create_user(validated_data, role='Sonographer')
        SonographerProfile.objects.create(user=user, certification=certification)
        return user





# serializers for listing all the users profile along with users corresponding profile details  
class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = '__all__'

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class NurseProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseProfile
        fields = '__all__'

class SonographerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SonographerProfile
        fields = '__all__'

class AdminStaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdministrativeStaffProfile
        fields = '__all__'

class AllUsersProfileSerializer(serializers.ModelSerializer):
    patient_profile = serializers.SerializerMethodField()
    doctor_profile = serializers.SerializerMethodField()
    nurse_profile = serializers.SerializerMethodField()
    sonographer_profile = serializers.SerializerMethodField()
    admin_staff_profile = serializers.SerializerMethodField()
    class Meta:
        model = ProfileUser
        fields = ['id','role','first_name','last_name','phone','patient_profile','doctor_profile','nurse_profile','sonographer_profile','admin_staff_profile']

    def get_patient_profile(self, obj):
        if obj.role == 'Patient' and hasattr(obj, 'patientprofile'):
            return PatientProfileSerializer(obj.patientprofile).data
        return None

    def get_doctor_profile(self, obj):
        if obj.role == 'Cardiologist' and hasattr(obj, 'doctorprofile'):
            return DoctorProfileSerializer(obj.doctorprofile).data
        return None

    def get_nurse_profile(self, obj):
        if obj.role == 'Nurse' and hasattr(obj, 'nurseprofile'):
            return NurseProfileSerializer(obj.nurseprofile).data
        return None

    def get_sonographer_profile(self, obj):
        if obj.role == 'Sonographer' and hasattr(obj, 'sonographerprofile'):
            return SonographerProfileSerializer(obj.sonographerprofile).data
        return None

    def get_admin_staff_profile(self, obj):
        if obj.role == 'Administrative Staff' and hasattr(obj, 'administrativestaffprofile'):
            return AdminStaffProfileSerializer(obj.administrativestaffprofile).data
        return None    

# Profile Update Serializers for editing user profiles
class BaseProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ProfileUser
        fields = ['first_name', 'last_name', 'phone']

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance

class PatientProfileUpdateSerializer(BaseProfileUpdateSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    insurance_provider = serializers.CharField(max_length=100, required=False, allow_blank=True)
    insurance_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    country = serializers.CharField(max_length=55, required=False, allow_blank=True)
    medical_reference_no = serializers.CharField(max_length=50 , required=False, allow_blank=True)

    class Meta(BaseProfileUpdateSerializer.Meta):
        fields = BaseProfileUpdateSerializer.Meta.fields + [
            'date_of_birth', 'gender', 'address', 'emergency_contact',
            'insurance_provider', 'insurance_id', 'country', 'age','medical_reference_no'
        ]

    def update(self, instance, validated_data):
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update patient profile fields
        patient_profile = getattr(instance, 'patientprofile', None)
        if patient_profile:
            patient_fields = [
                'date_of_birth', 'gender', 'address', 'emergency_contact',
                'insurance_provider', 'insurance_id', 'country', 'age','medical_reference_no'
            ]
            for field in patient_fields:
                if field in validated_data:
                    setattr(patient_profile, field, validated_data[field])
            patient_profile.save()
        
        return instance

class DoctorProfileUpdateSerializer(BaseProfileUpdateSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(max_length=10, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    specialization = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.IntegerField(required=False, allow_null=True)
    availability = serializers.CharField(required=False, allow_blank=True)
    fees = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    is_available = serializers.BooleanField(required=False)

    class Meta(BaseProfileUpdateSerializer.Meta):
        fields = BaseProfileUpdateSerializer.Meta.fields + [
            'date_of_birth', 'gender', 'address', 'emergency_contact',
            'specialization', 'experience', 'availability', 'fees', 'is_available'
        ]

    def update(self, instance, validated_data):
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update doctor profile fields
        doctor_profile = getattr(instance, 'doctorprofile', None)
        if doctor_profile:
            doctor_fields = [
                'date_of_birth', 'gender', 'address', 'emergency_contact',
                'specialization', 'experience', 'availability', 'fees', 'is_available'
            ]
            for field in doctor_fields:
                if field in validated_data:
                    setattr(doctor_profile, field, validated_data[field])
            doctor_profile.save()
        
        return instance

class NurseProfileUpdateSerializer(BaseProfileUpdateSerializer):
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shift = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta(BaseProfileUpdateSerializer.Meta):
        fields = BaseProfileUpdateSerializer.Meta.fields + ['department', 'shift']

    def update(self, instance, validated_data):
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update nurse profile fields
        nurse_profile = getattr(instance, 'nurseprofile', None)
        if nurse_profile:
            nurse_fields = ['department', 'shift']
            for field in nurse_fields:
                if field in validated_data:
                    setattr(nurse_profile, field, validated_data[field])
            nurse_profile.save()
        
        return instance

class SonographerProfileUpdateSerializer(BaseProfileUpdateSerializer):
    certification = serializers.CharField(max_length=100, required=False, allow_blank=True)

    class Meta(BaseProfileUpdateSerializer.Meta):
        fields = BaseProfileUpdateSerializer.Meta.fields + ['certification']

    def update(self, instance, validated_data):
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update sonographer profile fields
        sonographer_profile = getattr(instance, 'sonographerprofile', None)
        if sonographer_profile:
            if 'certification' in validated_data:
                sonographer_profile.certification = validated_data['certification']
            sonographer_profile.save()
        
        return instance

class AdministrativeStaffProfileUpdateSerializer(BaseProfileUpdateSerializer):
    gender = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    working_hours = serializers.CharField(required=False, allow_blank=True)
    job_title = serializers.CharField(required=False, allow_blank=True)
    shift = serializers.CharField(required=False, allow_blank=True)
    extension_number = serializers.CharField(required=False, allow_blank=True)
    office_location = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)

    class Meta(BaseProfileUpdateSerializer.Meta):
        fields = BaseProfileUpdateSerializer.Meta.fields + [
            'gender', 'address', 'department', 'working_hours',
            'job_title', 'shift', 'extension_number', 'office_location', 'age'
        ]

    def update(self, instance, validated_data):
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Update administrative staff profile fields
        admin_staff_profile = getattr(instance, 'administrativestaffprofile', None)
        if admin_staff_profile:
            admin_fields = [
                'gender', 'address', 'department', 'working_hours',
                'job_title', 'shift', 'extension_number', 'office_location', 'age'
            ]
            for field in admin_fields:
                if field in validated_data:
                    setattr(admin_staff_profile, field, validated_data[field])
            admin_staff_profile.save()
        
        return instance    
    

# notification serializer
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'is_read',
            'created_at',
            'appointment'
        ]