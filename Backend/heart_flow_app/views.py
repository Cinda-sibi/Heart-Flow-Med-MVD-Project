from django.shortcuts import render
from rest_framework.views import APIView 
from .mixins import *
from .serializers import *
from rest_framework.permissions import AllowAny,IsAuthenticated
from . utils import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
import pyotp
from patient_app.serializers import *
from django.db.models import Q
from doctor_app.serializers import *
# Create your views here.


# pateint registration api

class RoleBasedRegistrationAPIView(APIView):
    def post(self, request, *args, **kwargs):
        role = request.data.get('role')

        if role == 'Patient':
            serializer = PatientRegistrationSerializer(data=request.data)
        elif role == 'Cardiologist':
            serializer = CardiologistRegistrationSerializer(data=request.data)
        elif role == 'Administrative Staff':
            serializer = AdministrativeStaffRegistrationSerializer(data=request.data)
        elif role == 'Nurse':
            serializer = NurseRegistrationSerializer(data=request.data)
        elif role == 'Sonographer':
            serializer = SonographerRegistrationSerializer(data=request.data)
        else:
            return custom_404('Unsupported role')

        if serializer.is_valid():
            user = serializer.save()
            secret = generate_otp_secret(user.email)
            user.otp_secret = secret
            user.save()
            cache.set(f"otp_secret_{user.email}", secret, timeout=600)
            
            totp = pyotp.TOTP(secret)
            otp = totp.now()
            
            send_mail(
                subject="Your OTP for Registration",
                message=f"Your OTP is {otp}. It will expire in 10 minutes.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
            )
            return custom_200(f"{role} registered successfull")
        return custom_404(serializer.errors)
# class PatientRegisterView(APIView):
#     permission_classes = [AllowAny]
#     def post(self, request):
#         serializer = PatientRegistrationSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             # Generate and send OTP
#             secret = generate_otp_secret(user.email)
#             user.otp_secret = secret
#             user.save()
#             cache.set(f"otp_secret_{user.email}", secret, timeout=600)
            
#             totp = pyotp.TOTP(secret)
#             otp = totp.now()
            
#             send_mail(
#                 subject="Your OTP for Registration",
#                 message=f"Your OTP is {otp}. It will expire in 10 minutes.",
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[user.email],
#             )
            
#             return custom_200("Patient registered successfully. Please verify your email with OTP.")
#         return custom_404(serializer.errors)


# # cardiologist-doctors registration api
# class CardiologistRegisterView(APIView):
#     permission_classes = [AllowAny]
#     def post(self, request):
#         serializer = CardiologistRegistrationSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             # Generate and send OTP
#             secret = generate_otp_secret(user.email)
#             user.otp_secret = secret
#             user.save()
#             cache.set(f"otp_secret_{user.email}", secret, timeout=600)
            
#             totp = pyotp.TOTP(secret)
#             otp = totp.now()
            
#             send_mail(
#                 subject="Your OTP for Registration",
#                 message=f"Your OTP is {otp}. It will expire in 10 minutes.",
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[user.email],
#             )
            
#             return custom_200("Cardiologist registered successfully. Please verify your email with OTP.")
#         return custom_404(serializer.errors)    


# administartive staff registration
# class AdministrativeStaffRegistration(APIView):
#     permission_classes = [AllowAny]
#     def post(self, request):
#         serializer = AdministrativeStaffRegistrationSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             # Generate and send OTP
#             secret = generate_otp_secret(user.email)
#             user.otp_secret = secret
#             user.save()
#             cache.set(f"otp_secret_{user.email}", secret, timeout=600)
            
#             totp = pyotp.TOTP(secret)
#             otp = totp.now()
            
#             send_mail(
#                 subject="Your OTP for Registration",
#                 message=f"Your OTP is {otp}. It will expire in 10 minutes.",
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[user.email],
#             )
            
#             return custom_200("Administrative staff  registered successfully. Please verify your email with OTP.")
#         return custom_404(serializer.errors)


# login api based on roles
class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(email=email, password=password)

            if user is None:
                return custom_404('Invalid credentials')

            send_otp_via_email(user.email)
            return custom_200('OTP sent to your email')

        return custom_404(serializer.errors)
    

# verify the otp and pass tokens 
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            # 🔐 Fetch OTP secret from cache or fallback to user model
            secret = cache.get(f"otp_secret_{email}")

            if not secret:
                try:
                    user = ProfileUser.objects.get(email=email)
                    secret = user.otp_secret
                except ProfileUser.DoesNotExist:
                    return Response({'error': 'User not found'}, status=404)

                if not secret:
                    return Response({'error': 'OTP expired or not found'}, status=400)

            # ✅ Verify OTP with time window allowance
            totp = pyotp.TOTP(secret)
            if not totp.verify(otp, valid_window=1):
                return Response({'error': 'Invalid OTP'}, status=400)

            try:
                user = ProfileUser.objects.get(email=email)
            except ProfileUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)

            # ✅ Mark user as verified
            user.is_verified = True
            user.save()

            # 🎟 Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            refresh["user_id"] = user.id
            refresh["role"] = user.role

            # 🔒 Clear OTP from cache
            cache.delete(f"otp_secret_{email}")

            return custom_200("Verification successful", {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'role': user.role,
                'email': user.email,
                'is_verified': user.is_verified
            })

        return custom_404(serializer.errors)


# resent otp api
class ResendOTPAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return custom_404("Email is required")

        success = send_otp_via_email(email)
        if not success:
            return custom_404("User with this email does not exist")

        return custom_200("OTP sent successfully to email")       
    

# get the login user profile details
class GetUsersProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self , request):
        user = request.user.id
        try:
         profile = ProfileUser.objects.get(id=user)
         serializer = AllUsersProfileSerializer(profile)
         return custom_200("User Profile retrived successfully",serializer.data)
        except ProfileUser.DoesNotExist:
            return custom_404("User profile not found") 
        
        
      
# search patients 
# search doctors
class SearchPatientAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unique_id = request.query_params.get('unique_id')
        first_name = request.query_params.get('first_name')
        last_name = request.query_params.get('last_name')

        filters = Q(role='Patient')
        if unique_id:
            filters &= Q(patientprofile__unique_id=unique_id)
        if first_name:
            filters &= Q(first_name__icontains=first_name)
        if last_name:
            filters &= Q(last_name__icontains=last_name)

        if not (unique_id or first_name or last_name):
            return custom_404("At least one search parameter (unique_id, first_name, last_name) is required")

        patients = ProfileUser.objects.select_related('patientprofile').filter(filters)
        if not patients.exists():
            return custom_404("No patients found matching the criteria")

        response_data = []
        for patient in patients:
            # patient is a ProfileUser instance, not a dict
            patient_profile = getattr(patient, 'patientprofile', None)
            formatted_patient = {
                "id": patient.id,
                "user_id": patient.id,  # ProfileUser is the user
                "unique_id": patient_profile.unique_id if patient_profile else None,
                "email": patient.email,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "role": patient.role,
                "date_of_birth": patient_profile.date_of_birth if patient_profile else None,
                "gender": patient_profile.gender if patient_profile else None,
                "address": patient_profile.address if patient_profile else None,
                "age": patient_profile.age if patient_profile and hasattr(patient_profile, 'age') else None
            }
            response_data.append(formatted_patient)

        return custom_200("Patients retrieved successfully", response_data)


class SearchDoctorAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        first_name = request.query_params.get('first_name')
        last_name = request.query_params.get('last_name')
        specialization = request.query_params.get('specialization')

        filters = Q(role='Cardiologist')
        if first_name:
            filters &= Q(first_name__icontains=first_name)
        if last_name:
            filters &= Q(last_name__icontains=last_name)
        if specialization:
            filters &= Q(doctor_profile__specialization__icontains=specialization)

        if not (first_name or last_name or specialization):
            return custom_404("At least one search parameter (first_name, last_name, specialization) is required")

        doctors = ProfileUser.objects.filter(filters)
        if not doctors.exists():
            return custom_404("No doctors found matching the criteria")

        serializer = ListallDcotorsSerializer(doctors, many=True)
        response_data = []
        for doctor in serializer.data:
                formatted_doctor = {
                    "id": doctor["id"],
                    "user_id":doctor["user"]["id"],
                    "email": doctor["user"]["email"],
                    "first_name": doctor["user"]["first_name"],
                    "last_name": doctor["user"]["last_name"],
                    "role": doctor["user"]["role"],
                    "is_verified": doctor["user"]["is_verified"],
                    "specialization": doctor["specialization"],
                    "experience": doctor["experience"],
                    "availability": doctor["availability"],
                    "fees": doctor["fees"],
                    "is_available": doctor["is_available"],
                    "date_of_birth": doctor["date_of_birth"],
                    "gender": doctor["gender"],
                    "address": doctor["address"],
                    "emergency_contact": doctor["emergency_contact"]
                }
                response_data.append(formatted_doctor)

        return custom_200("Doctors found", response_data)
