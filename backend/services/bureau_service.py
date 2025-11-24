# services/bureau_service.py
import uuid
from datetime import datetime

def simulate_bureau_request(provider: str, pan: str):
    """
    Simulates a bureau API response.
    Replace this with real API integration later.
    """

    if pan and len(pan) != 10:
        raise ValueError("Invalid PAN format")

    # fake scores based on seed (but non-random)
    base_score = sum(ord(c) for c in provider) % 200
    score = 650 + (base_score % 250)

    pdf_bytes = b"%PDF-1.7 simulated-credit-report"

    report_meta = {
        "generated": datetime.utcnow().isoformat(),
        "provider": provider,
        "pan_used": pan[-4:] if pan else "masked",
    }

    return score, pdf_bytes, report_meta
