import pyotp
import base64
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
from . models import *
import uuid


def generate_otp_secret(email):
    return pyotp.random_base32()

def send_otp_via_email(email):
    try:
        user = ProfileUser.objects.get(email=email)
    except ProfileUser.DoesNotExist:
        return False

    secret = generate_otp_secret(email)

    # Save secret to user model
    user.otp_secret = secret
    user.save()

    # Optionally cache the secret for 10 minutes
    cache.set(f"otp_secret_{email}", secret, timeout=600)

    totp = pyotp.TOTP(secret)
    otp = totp.now()

    send_mail(
        subject="Your OTP for Login",
        message=f"Your OTP is {otp}. It will expire in 10 minutes.",
        from_email=settings.EMAIL_HOST_USER,  # use DEFAULT_FROM_EMAIL from settings
        recipient_list=[email],
    )
    return True


# generate unique id for patients and save them
def generate_patient_id():
    return f"PT-{uuid.uuid4().hex[:8].upper()}"  # Example: PT-3F5A1D2B



# send email notifications while appointment 
def send_email_notification(subject, message, recipient_list):
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_list,
        fail_silently=False,
    )    