# utils/pdf_generator.py

from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from datetime import datetime


def generate_referral_pdf(referral):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    line = height - 50

    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(180, line, "Patient Referral Form")

    # Date
    line -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, line, "Date:")
    p.setFont("Helvetica", 12)
    p.drawString(150, line, datetime.now().strftime('%d/%m/%Y'))

    # Referring GP
    line -= 30
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, line, "Referring Doctor:")
    p.setFont("Helvetica", 12)
    line -= 20
    p.drawString(70, line, f"Name: Dr. {referral.referred_by.get_full_name()}")
    line -= 20
    p.drawString(70, line, f"Email: {referral.referred_by.email}")
    line -= 20
    p.drawString(70, line, f"Phone: {referral.referred_by.phone or 'N/A'}")

    # Patient Info
    line -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, line, "Patient Details:")
    p.setFont("Helvetica", 12)
    line -= 20
    p.drawString(70, line, f"Full Name: {referral.patient_first_name} {referral.patient_last_name}")
    line -= 20
    p.drawString(70, line, f"Email: {referral.patient_email or 'N/A'}")
    line -= 20
    p.drawString(70, line, f"Phone: {referral.patient_phone or 'N/A'}")
    line -= 20
    p.drawString(70, line, f"Gender: {referral.gender or 'N/A'}")

    # Reason
    line -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, line, "Reason for Referral:")
    p.setFont("Helvetica", 12)
    line -= 20
    text = p.beginText(70, line)
    for line_text in (referral.reason or "-").splitlines():
        text.textLine(line_text)
    p.drawText(text)

    # Summary
    line = text.getY() - 30
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, line, "Clinical Summary:")
    line -= 20
    p.setFont("Helvetica", 12)
    text = p.beginText(70, line)
    for line_text in (referral.summary or "-").splitlines():
        text.textLine(line_text)
    p.drawText(text)

    # Footer
    line = text.getY() - 40
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, line, "This referral was submitted through the HeartFlowMed digital system.")

    p.showPage()
    p.save()

    pdf_file = buffer.getvalue()
    buffer.close()
    return pdf_file