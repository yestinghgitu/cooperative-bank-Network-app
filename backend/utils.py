# utils.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def mask_sensitive_info(data: dict) -> dict:
    """
    Masks sensitive fields like aadhar, pan, mobile, email.
    """
    masked = data.copy()

    if 'aadhar_number' in masked and masked['aadhar_number']:
        masked['aadhar_number'] = masked['aadhar_number'][:4] + "XXXX" + masked['aadhar_number'][-4:]
    
    if 'pan_number' in masked and masked['pan_number']:
        masked['pan_number'] = masked['pan_number'][:3] + "XXXX" + masked['pan_number'][-2:]
    
    if 'mobile_number' in masked and masked['mobile_number']:
        masked['mobile_number'] = masked['mobile_number'][:2] + "XXXXX" + masked['mobile_number'][-2:]
    
    if 'email' in masked and masked['email']:
        parts = masked['email'].split('@')
        if len(parts) == 2:
            name = parts[0]
            domain = parts[1]
            masked_name = name[0] + "****" + name[-1] if len(name) > 2 else "****"
            masked['email'] = f"{masked_name}@{domain}"

    return masked

def send_email(to_email, subject, body):
    sender_email = os.getenv("MAIL_USERNAME", "your_email@example.com")
    sender_password = os.getenv("MAIL_PASSWORD", "yourpassword")
    smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("MAIL_PORT", 587))

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email: {e}")
