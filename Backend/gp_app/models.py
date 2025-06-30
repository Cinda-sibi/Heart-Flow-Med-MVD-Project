from django.db import models
from heart_flow_app.models import ProfileUser , PatientProfile
# Create your models here.

# models.py

class PatientReferral(models.Model):
    referred_by = models.ForeignKey(ProfileUser,on_delete=models.CASCADE,limit_choices_to={'role': 'General Practitioner'}, related_name='referred_patients')
    referred_to = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name="referrals_received",null=True,blank=True) 
    # Instead of FK to PatientProfile, we store temporary patient info
    patient_first_name = models.CharField(max_length=100)
    patient_last_name = models.CharField(max_length=100)
    patient_email = models.EmailField(null=True, blank=True)
    patient_phone = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    medical_reference_no =  models.CharField(max_length=70,null=True ,blank=True)
    symptoms = models.TextField(null=True , blank=True)
    reason = models.TextField(null=True, blank=True)
    referred_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Accepted', 'Accepted'), ('Rejected', 'Rejected'),('Ongoing', 'Ongoing')],
        default='Pending'
    )

    linked_patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Link to actual PatientProfile once created"
    )
    transcription = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    audio_file = models.FileField(upload_to='patient_referral_audios/', null=True, blank=True)
    referral_pdf = models.FileField(upload_to='referral_pdf/',null=True , blank=True)
    doctor_notes = models.TextField(null=True , blank=True)
    is_accepted = models.BooleanField(default=False)
    patient_reports = models.FileField(upload_to='patients_medical_reports/',null=True, blank=True)

    def __str__(self):
        return f"{self.patient_first_name} {self.patient_last_name} referred by {self.referred_by.get_full_name()}"

