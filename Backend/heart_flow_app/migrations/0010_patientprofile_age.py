# Generated by Django 5.2.3 on 2025-06-21 07:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heart_flow_app', '0009_remove_patientprofile_age_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patientprofile',
            name='age',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
