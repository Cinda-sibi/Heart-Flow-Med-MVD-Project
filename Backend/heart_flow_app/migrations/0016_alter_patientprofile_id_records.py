# Generated by Django 5.2.3 on 2025-06-24 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heart_flow_app', '0015_patientprofile_id_records'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patientprofile',
            name='id_records',
            field=models.FileField(blank=True, null=True, upload_to='patient_id_records/'),
        ),
    ]
