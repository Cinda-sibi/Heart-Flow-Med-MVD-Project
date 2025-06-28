from django.db import models
from heart_flow_app.models import *
# Create your models here.

# models.py

class DiagnosticTest(models.Model):
    TEST_CHOICES = [
        ('Blood Test', 'Blood Test'),
        ('ECG', 'ECG'),
        ('Echocardiogram', 'Echocardiogram'),
        ('TMT', 'TMT'),
        ('Holter Monitor', 'Holter Monitor'),
        # Add more test types as needed
    ]
    name = models.CharField(max_length=100, choices=TEST_CHOICES, unique=True)

    def __str__(self):
        return self.name


class DiagnosticAppointment(models.Model):
    booked_by = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name="booked_tests", limit_choices_to={'role': 'Admin'})
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='diagnostic_appointments')
    test = models.ForeignKey(DiagnosticTest, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[('Scheduled', 'Scheduled'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')],
        default='Scheduled'
    )
    assigned_staff = models.ForeignKey(ProfileUser, on_delete=models.CASCADE, related_name="test_appointments", limit_choices_to={'role__in': ['Nurse', 'Sonographer']})
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.test.name} for {self.patient.user.get_full_name()} on {self.date} {self.time}"
