# Generated by Django 5.2.3 on 2025-06-19 06:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heart_flow_app', '0006_patientprofile_age'),
    ]

    operations = [
        migrations.AddField(
            model_name='administrativestaffprofile',
            name='department',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='administrativestaffprofile',
            name='extension_number',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='administrativestaffprofile',
            name='job_title',
            field=models.CharField(default='Front Office Staff', max_length=100),
        ),
        migrations.AddField(
            model_name='administrativestaffprofile',
            name='shift',
            field=models.CharField(blank=True, choices=[('Morning', 'Morning'), ('Evening', 'Evening'), ('Night', 'Night')], max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='administrativestaffprofile',
            name='working_hours',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='administrativestaffprofile',
            name='office_location',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
