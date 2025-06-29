from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(DiagnosticTest)
admin.site.register(DiagnosticAppointment)
admin.site.register(DiagnosticTestResult)