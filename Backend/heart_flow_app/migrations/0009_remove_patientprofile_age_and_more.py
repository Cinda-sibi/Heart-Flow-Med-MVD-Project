# Generated by Django 5.2.3 on 2025-06-21 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('heart_flow_app', '0008_administrativestaffprofile_address_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patientprofile',
            name='age',
        ),
        migrations.AlterField(
            model_name='doctorprofile',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='doctorprofile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='doctorprofile',
            name='emergency_contact',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='doctorprofile',
            name='gender',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='nurseprofile',
            name='department',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='nurseprofile',
            name='shift',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='country',
            field=models.CharField(blank=True, max_length=55, null=True),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='emergency_contact',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='patientprofile',
            name='gender',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='sonographerprofile',
            name='certification',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
