from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CreditConsent, BureauReport
import uuid
import os

credit = Blueprint("credit", __name__, url_prefix="/api/credit")

# -----------------------------------------------------------
# 1. SAVE CONSENT
# -----------------------------------------------------------
@credit.route("/consent", methods=["POST"])
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
        consent_id=consent_id,
    )

    db.session.add(c)
    db.session.commit()

    return jsonify({"consent_id": consent_id}), 201


# -----------------------------------------------------------
# 2. REQUEST SCORE  (SIMULATED FOR NOW)
# -----------------------------------------------------------
@credit.route("/request_score", methods=["POST"])
@jwt_required()
def request_score():
    user_id = get_jwt_identity()
    data = request.json or {}

    provider = data.get("provider")
    consent_id = data.get("consent_id")
    pan = data.get("pan")

    if not provider or not consent_id:
        return jsonify({"msg": "provider and consent_id required"}), 400

    # Simulated bureau data
    fake_score = 720
    fake_pdf = b"%PDF-1.4 simulated pdf data"

    # Save dummy PDF
    folder = current_app.config.get("REPORTS_FOLDER", "reports")
    os.makedirs(folder, exist_ok=True)

    filename = f"{provider}_report_{user_id}_{uuid.uuid4().hex}.pdf"
    path = os.path.join(folder, filename)

    with open(path, "wb") as f:
        f.write(fake_pdf)

    br = BureauReport(
        user_id=user_id,
        provider=provider,
        score=fake_score,
        report_path=path,
        meta={"note": "simulated"},
    )

    db.session.add(br)
    db.session.commit()

    return jsonify({"score": fake_score, "report_id": br.id}), 200


# -----------------------------------------------------------
# 3. DOWNLOAD REPORT
# -----------------------------------------------------------
@credit.route("/report/<int:report_id>", methods=["GET"])
@jwt_required()
def download_report(report_id):
    user_id = get_jwt_identity()

    br = BureauReport.query.get(report_id)
    if not br or br.user_id != user_id:
        return jsonify({"msg": "not found"}), 404

    return send_file(
        br.report_path,
        as_attachment=True,
        download_name=f"{br.provider}_report_{report_id}.pdf"
    )
