from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(ProfileUser)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
admin.site.register(Appointment)
admin.site.register(Notification)
admin.site.register(AdministrativeStaffProfile)
admin.site.register(Medication)
admin.site.register(DrugInteraction)
admin.site.register(Allergy)
admin.site.register(PrescriptionItem)
admin.site.register(Prescription)
