import os
import uuid
import time
import random
from flask import Blueprint, current_app, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, CreditConsent, BureauReport

# For valid PDF generation
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import pathlib

credit_bp = Blueprint("credit_bp", __name__)

# In-memory OTP store (mock only)
_MOCK_OTP_STORE = {}   # session_id -> {otp, expires_at, user_id, mobile}

def _generate_otp():
    return f"{random.randint(100000, 999999)}"


# ============================================================
#                 MOCK PDF GENERATOR (VALID PDF)
# ============================================================
def create_mock_pdf(path, score, pan, provider="cibil"):
    """Generate a REAL PDF (no corrupt bytes)."""
    c = canvas.Canvas(path, pagesize=A4)
    c.setFont("Helvetica", 14)

    c.drawString(40, 800, f"MOCK {provider.upper()} CREDIT REPORT")
    c.drawString(40, 770, f"Score: {score}")
    c.drawString(40, 740, f"PAN: {pan or 'N/A'}")
    c.drawString(40, 710, "This is a development-only mock report.")
    c.drawString(40, 680, "Replace this with real Bureau API output later.")

    c.showPage()
    c.save()


# ============================================================
#                    HEALTH CHECK
# ============================================================
@credit_bp.route("/mock/ping", methods=["GET"])
def ping():
    return jsonify({"msg": "mock-bureau alive"}), 200


# ============================================================
#                    SAVE CONSENT
# ============================================================
@credit_bp.route("/consent", methods=["POST"])
@jwt_required()
def save_consent():
    user_id = get_jwt_identity()
    data = request.json or {}

    provider = data.get("provider")
    consent_text = data.get("consent_text")

    if not provider or not consent_text:
        return jsonify({"msg": "provider and consent_text required"}), 400

    consent_id = str(uuid.uuid4())

    c = CreditConsent(
        user_id=user_id,
        provider=provider,
        consent_text=consent_text,
        consent_id=consent_id
    )

    db.session.add(c)
    db.session.commit()

    return jsonify({"consent_id": consent_id}), 201


# ============================================================
#              MOCK OTP SEND
# ============================================================
@credit_bp.route("/mock/send_otp", methods=["POST"])
@jwt_required()
def mock_send_otp():
    user_id = get_jwt_identity()
    data = request.json or {}

    mobile = data.get("mobile")
    if not mobile:
        return jsonify({"msg": "mobile required"}), 400

    session_id = str(uuid.uuid4())
    otp = _generate_otp()

    _MOCK_OTP_STORE[session_id] = {
        "otp": otp,
        "expires_at": time.time() + 300,
        "mobile": mobile,
        "user_id": user_id
    }

    current_app.logger.info(f"[MOCK OTP] session={session_id} otp={otp} mobile={mobile}")

    return jsonify({"session_id": session_id, "ttl_seconds": 300}), 200


# ============================================================
#              MOCK OTP VERIFY
# ============================================================
@credit_bp.route("/mock/verify_otp", methods=["POST"])
@jwt_required()
def mock_verify_otp():
    data = request.json or {}

    session_id = data.get("session_id")
    otp = data.get("otp")

    if not session_id or not otp:
        return jsonify({"msg": "session_id and otp required"}), 400

    entry = _MOCK_OTP_STORE.get(session_id)

    if not entry or time.time() > entry["expires_at"]:
        return jsonify({"msg": "otp_expired_or_invalid"}), 400

    if str(entry["otp"]) != str(otp):
        return jsonify({"msg": "invalid_otp"}), 400

    del _MOCK_OTP_STORE[session_id]

    return jsonify({"verified": True}), 200


# ============================================================
#              REQUEST SCORE + GENERATE REPORT
# ============================================================
@credit_bp.route("/request_score", methods=["POST"])
@jwt_required()
def request_score():
    user_id = get_jwt_identity()
    data = request.json or {}

    provider = data.get("provider")
    consent_id = data.get("consent_id")
    pan = data.get("pan")

    if not provider or not consent_id:
        return jsonify({"msg": "provider and consent_id required"}), 400

    consent = CreditConsent.query.filter_by(
        consent_id=consent_id,
        provider=provider
    ).first()

    if not consent:
        return jsonify({"msg": "consent_not_found"}), 404

    # Generate mock score
    fake_score = random.randint(450, 820)

    # File path
    folder = current_app.config.get("REPORTS_FOLDER", "reports")
    os.makedirs(folder, exist_ok=True)

    filename = f"{provider}_mock_report_{user_id}_{uuid.uuid4().hex}.pdf"
    path = os.path.join(folder, filename)

    # Create VALID PDF
    create_mock_pdf(path, fake_score, pan, provider)

    # Save DB entry
    br = BureauReport(
        user_id=user_id,
        provider=provider,
        score=fake_score,
        report_path=path,
        meta={"mock": True, "pan": pan}
    )

    db.session.add(br)
    db.session.commit()

    return jsonify({"score": fake_score, "report_id": br.id}), 200


# ============================================================
#                   DOWNLOAD REPORT
# ============================================================

@credit_bp.route("/report/<int:report_id>", methods=["GET"])
@jwt_required()
def download_report(report_id):
    user_id = get_jwt_identity()

    # Fetch report
    br = BureauReport.query.get(report_id)
    if not br:
        return jsonify({"msg": "not_found"}), 404

    # Check ownership
    if int(br.user_id) != int(user_id):
        return jsonify({"msg": "forbidden"}), 403

    # Validate file path
    report_path = pathlib.Path(br.report_path).resolve()
    if not report_path.exists():
        current_app.logger.error("Missing report file: %s", report_path)
        return jsonify({"msg": "file_missing"}), 404

    if not report_path.is_file():
        return jsonify({"msg": "invalid_file"}), 400

    # Serve file
    try:
        return send_file(
            str(report_path),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{br.provider}_report_{report_id}.pdf"
        )
    except Exception as e:
        current_app.logger.exception("File send error: %s", e)
        return jsonify({"msg": "file_send_error", "error": str(e)}), 500

# ============================================================
#                       LIST REPORTS
# ============================================================
@credit_bp.route("/reports", methods=["GET"])
@jwt_required()
def list_reports():
    user_id = get_jwt_identity()

    reports = BureauReport.query.filter_by(user_id=user_id).order_by(
        BureauReport.created_at.desc()
    ).all()

    return jsonify([r.to_dict() for r in reports]), 200
