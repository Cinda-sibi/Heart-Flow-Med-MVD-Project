from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from . manager import CustomUserManager

class ProfileUser(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Cardiologist', 'Cardiologist'),
        ('Nurse', 'Nurse'),
        ('Sonographer', 'Sonographer'),
        ('Administrative Staff', 'Administrative Staff'),
        ('Patient', 'Patient'),
        ('Group Manager', 'Group Manager'),
        ('IT Staff', 'IT Staff'),
        ('General Practitioner', 'General Practitioner'),
    ]
    username = None  # Remove the username field
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    otp_secret = models.CharField(max_length=32, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    user_images = models.ImageField(upload_to='user_photos/',null=True , blank=True)
    USERNAME_FIELD = 'email'  # Important
    REQUIRED_FIELDS = []  # Since email is the only required field

    objects = CustomUserManager()


    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()

    def __str__(self):
        return self.email

class Medication(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class DrugInteraction(models.Model):
    medication_1 = models.ForeignKey(Medication, related_name='interaction_from', on_delete=models.CASCADE)
    medication_2 = models.ForeignKey(Medication, related_name='interaction_to', on_delete=models.CASCADE)
    severity = models.CharField(max_length=20, choices=[('Low', 'Low'), ('Moderate', 'Moderate'), ('High', 'High')])
    description = models.TextField()

class Allergy(models.Model):
    name = models.CharField(max_length=100)
    medications = models.ManyToManyField(Medication)
class PatientProfile(models.Model):
    user = models.OneToOneField(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Patient'})
    date_of_birth = models.DateField(null=True , blank = True)
    gender = models.CharField(max_length=10,null=True,blank=True)
    address = models.TextField(null=True,blank=True)
    emergency_contact = models.CharField(max_length=100,null=True,blank=True)
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    insurance_id = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=55,null=True,blank=True)
    unique_id = models.CharField(max_length=20 ,unique=True,null=True ,blank=True)
    age = models.IntegerField(null=True,blank=True)
    allergies = models.ManyToManyField(Allergy, blank=True)
    medical_reference_no = models.CharField(max_length=50,null=True,blank=True)
    id_records = models.FileField(upload_to='patient_id_records/',null=True,blank=True)

    def __str__(self):
        return f"{self.user.first_name}-{self.user.last_name}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Cardiologist'})
    date_of_birth = models.DateField(null=True,blank=True)
    gender = models.CharField(max_length=10,null=True,blank=True)
    address = models.TextField(null=True,blank=True)
    emergency_contact = models.CharField(max_length=100,null=True,blank=True)
    specialization = models.CharField(max_length=100,null=True,blank=True)
    experience = models.IntegerField(null=True,blank=True)
    availability = models.CharField(max_length=100,null=True,blank=True)
    fees = models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    is_available = models.BooleanField(default=True)

    

    def __str__(self):
        return f"{self.user.first_name}-{self.user.last_name}"
    


class Prescription(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    prescribed_by = models.ForeignKey(ProfileUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, related_name='items', on_delete=models.CASCADE)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)    

class NurseProfile(models.Model):
    user = models.OneToOneField(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Nurse'})
    department = models.CharField(max_length=100,null=True,blank=True)
    shift = models.CharField(max_length=50,null=True,blank=True)

    def __str__(self):
        return f"{self.user.first_name}-{self.user.last_name}"

class SonographerProfile(models.Model):
    user = models.OneToOneField(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Sonographer'})
    certification = models.CharField(max_length=100,null=True,blank=True)

    def __str__(self):
        return f"{self.user.first_name}-{self.user.last_name}"

class AdministrativeStaffProfile(models.Model):
    user = models.OneToOneField(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Administrative Staff'})
    office_location = models.CharField(max_length=100,null=True,blank=True)
    department = models.CharField(max_length=100,null=True,blank=True)  # e.g., Cardiology, Radiology
    job_title = models.CharField(max_length=100, default="Front Office Staff")
    shift = models.CharField(max_length=50, choices=[("Morning", "Morning"), ("Evening", "Evening"), ("Night", "Night")],null=True,blank=True)
    working_hours = models.CharField(max_length=50,null=True,blank=True)  # e.g., "9:00 AM - 5:00 PM"
    extension_number = models.CharField(max_length=10, blank=True, null=True)
    gender = models.CharField(max_length=50,null=True,blank=True)
    age = models.IntegerField(null=True,blank=True)
    address = models.TextField(null=True,blank=True)


    def __str__(self):
        return f"{self.user.first_name}-{self.user.last_name}"     
    
class Appointment(models.Model):
    patient = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name='patients', limit_choices_to={'role': 'Patient'})
    doctor = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name='doctors',limit_choices_to={'role': 'Cardiologist'})
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=[('Scheduled', 'Scheduled'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')])
    notes = models.TextField(blank=True)
    files = models.ImageField(upload_to='medical_files/',null=True,blank=True)
    

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.date}"



class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('appointment_created', 'Appointment Created'),
        ('appointment_updated', 'Appointment Updated'),
        ('appointment_cancelled', 'Appointment Cancelled'),
        ('appointment_reminder', 'Appointment Reminder'),
        ('referral_received' , 'referral_received')
    )

    user = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.user.first_name}"
