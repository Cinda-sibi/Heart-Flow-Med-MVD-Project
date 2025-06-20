from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(ProfileUser)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
admin.site.register(Appointment)
admin.site.register(Notification)
admin.site.register(AdministrativeStaffProfile)
