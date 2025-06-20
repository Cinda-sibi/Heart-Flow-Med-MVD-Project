from django.db import models
from heart_flow_app.models import *

# Create your models here.
class DoctorAvailability(models.Model):
    doctor = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, limit_choices_to={'role': 'Cardiologist'})
    day_of_week = models.CharField(max_length=10, choices=[('Monday','Monday'), ('Tuesday','Tuesday'), ('Wednesday','Wednesday'), ('Thursday','Thursday'), ('Friday','Friday'), ('Saturday','Saturday'), ('Sunday','Sunday')])
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor.first_name} - {self.day_of_week} ({self.start_time} to {self.end_time})"

class DoctorLeave(models.Model):
    doctor = models.ForeignKey(ProfileUser, on_delete=models.CASCADE)
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.doctor.first_name} Leave on {self.date}"
