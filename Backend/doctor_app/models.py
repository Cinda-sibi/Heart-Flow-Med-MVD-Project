from django.db import models
from heart_flow_app.models import *


class SonographyReferral(models.Model):
    patient = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Patient'})
    doctor = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name='referring_doctor', limit_choices_to={'role': 'Cardiologist'})
    sonographer = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name='assigned_sonographer', limit_choices_to={'role': 'Sonographer'})
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField()
    referral_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Completed', 'Completed')], default='Pending')
    notes = models.TextField(blank=True, null=True)
    report = models.FileField(upload_to='sonography_reports/', null=True, blank=True)  # optional upload

    def __str__(self):
        return f"{self.patient.get_full_name()} → {self.sonographer.get_full_name()}"
