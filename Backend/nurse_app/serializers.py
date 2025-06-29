from rest_framework import serializers
from admin_app.models import *

# list assigned patients list
class AssignedPatientSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    test_name = serializers.CharField(source='test.name')
    date = serializers.DateField()
    time = serializers.TimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True, required=False)
    result_summary = serializers.SerializerMethodField()
    attached_report_url = serializers.SerializerMethodField()

    class Meta:
        model = DiagnosticAppointment
        fields = ['id', 'patient_name', 'test_name', 'date', 'time', 'status', 'notes','result_summary', 'attached_report_url']

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()
    
    def get_result_summary(self, obj):
        if hasattr(obj, 'result') and obj.result:
            return obj.result.result_summary
        return None

    def get_attached_report_url(self, obj):
        if hasattr(obj, 'result') and obj.result and obj.result.attached_report:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.result.attached_report.url) if request else obj.result.attached_report.url
        return None
    

#  uploading test results
# serializers.py
class DiagnosticTestResultUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticTestResult
        fields = ['appointment', 'result_summary', 'attached_report']
        extra_kwargs = {
            'appointment': {'read_only': True}
        }

    def validate(self, data):
        user = self.context['request'].user
        appointment = self.context['appointment']

        if user.role not in ['Nurse', 'Sonographer', 'IT Staff']:
            raise serializers.ValidationError("You are not authorized to upload test results.")

        # If it's not update and result already exists, block it
        if not self.instance and DiagnosticTestResult.objects.filter(appointment=appointment).exists():
            raise serializers.ValidationError("Test result has already been uploaded for this appointment.")

        if user.role != 'IT Staff' and appointment.assigned_staff != user:
            raise serializers.ValidationError("You are not assigned to this appointment.")

        return data

    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        validated_data['appointment'] = self.context['appointment']

        appointment = validated_data['appointment']
        appointment.status = 'Completed'
        appointment.save()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.result_summary = validated_data.get('result_summary', instance.result_summary)
        if validated_data.get('attached_report'):
            instance.attached_report = validated_data['attached_report']
        instance.save()
        return instance
