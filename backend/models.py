from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt
from datetime import datetime

db = SQLAlchemy()

# ================================================================
# USER MODEL
# ================================================================
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    # Login Credentials
    username = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Personal details
    full_name = db.Column(db.String(150))
    email = db.Column(db.String(150))
    role = db.Column(db.String(50), nullable=False, default='user')

    # Banking Relations
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('cooperative_branches.id'))

    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.String(100))
    modified_by = db.Column(db.String(100))

    # Relationships
    bank_rel = db.relationship('CooperativeBank', back_populates='users')
    branch_rel = db.relationship('CooperativeBranch', back_populates='users')

    # Loan Relationships
    loan_applications = db.relationship(
        'LoanApplication',
        back_populates='owner_user',
        lazy=True,
        overlaps="creator,created_loan_applications"
    )

    created_loan_applications = db.relationship(
        'LoanApplication',
        back_populates='creator',
        lazy=True,
        overlaps="loan_applications,owner_user"
    )

    # Credit consent & reports
    credit_consents = db.relationship('CreditConsent', backref='user', lazy=True)
    bureau_reports = db.relationship('BureauReport', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "email": self.email,
            "role": self.role,
            "bank_id": self.bank_id,
            "branch_id": self.branch_id,
            "bank_name": self.bank_rel.bank_name if self.bank_rel else None,
            "branch_name": self.branch_rel.branch_name if self.branch_rel else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by,
            "modified_by": self.modified_by,
        }

    __table_args__ = (
        db.UniqueConstraint('username', name='uq_user_username'),
        db.UniqueConstraint('email', name='uq_user_email'),
        db.UniqueConstraint('full_name', name='uq_user_fullname'),
    )


# ================================================================
# COOPERATIVE BANK MODEL
# ================================================================
class CooperativeBank(db.Model):
    __tablename__ = 'cooperative_banks'

    id = db.Column(db.Integer, primary_key=True)
    bank_name = db.Column(db.String(255), nullable=False)
    registration_number = db.Column(db.String(100), nullable=False)
    rbi_license_number = db.Column(db.String(100))
    ifsc_code = db.Column(db.String(20))
    micr_code = db.Column(db.String(20))
    head_office_address = db.Column(db.Text, nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), default='India')
    established_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='Active')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branches = db.relationship('CooperativeBranch', back_populates='bank_rel', lazy=True)
    contacts = db.relationship('BankContact', backref='bank_rel', lazy=True)
    users = db.relationship('User', back_populates='bank_rel', lazy=True)
    loans = db.relationship('LoanApplication', back_populates='bank', lazy=True)
    services = db.relationship('BankService', backref='bank_rel', lazy=True)
    transactions = db.relationship('Transaction', backref='bank_rel', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "bank_name": self.bank_name,
            "registration_number": self.registration_number,
            "rbi_license_number": self.rbi_license_number,
            "ifsc_code": self.ifsc_code,
            "micr_code": self.micr_code,
            "head_office_address": self.head_office_address,
            "district": self.district,
            "state": self.state,
            "country": self.country,
            "established_date": self.established_date.isoformat() if self.established_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


# ================================================================
# COOPERATIVE BRANCH
# ================================================================
class CooperativeBranch(db.Model):
    __tablename__ = 'cooperative_branches'

    id = db.Column(db.Integer, primary_key=True)
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'), nullable=False)
    branch_name = db.Column(db.String(255), nullable=False)
    branch_code = db.Column(db.String(50))
    address = db.Column(db.String(255))
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    ifsc_code = db.Column(db.String(20))
    contact_number = db.Column(db.String(15))
    manager_name = db.Column(db.String(100))
    status = db.Column(db.String(20), default="Active")

    bank_rel = db.relationship('CooperativeBank', back_populates='branches')
    users = db.relationship('User', back_populates='branch_rel', lazy=True)
    loans = db.relationship('LoanApplication', back_populates='branch', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "bank_id": self.bank_id,
            "bank_name": self.bank_rel.bank_name if self.bank_rel else None,
            "branch_name": self.branch_name,
            "branch_code": self.branch_code,
            "address": self.address,
            "district": self.district,
            "state": self.state,
            "ifsc_code": self.ifsc_code,
            "contact_number": self.contact_number,
            "manager_name": self.manager_name,
            "status": self.status,
        }


# ================================================================
# BANK CONTACT
# ================================================================
class BankContact(db.Model):
    __tablename__ = 'bank_contacts'

    id = db.Column(db.Integer, primary_key=True)
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'), nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100))
    email = db.Column(db.String(150))
    phone_number = db.Column(db.String(15))

    def to_dict(self):
        return {
            "id": self.id,
            "bank_id": self.bank_id,
            "contact_person": self.contact_person,
            "designation": self.designation,
            "email": self.email,
            "phone_number": self.phone_number,
        }


# ================================================================
# LOAN APPLICATION MODEL
# ================================================================
class LoanApplication(db.Model):
    __tablename__ = 'loan_applications'

    id = db.Column(db.Integer, primary_key=True)

    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('cooperative_branches.id'))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    bank = db.relationship('CooperativeBank', back_populates='loans')
    branch = db.relationship('CooperativeBranch', back_populates='loans')
    owner_user = db.relationship('User', back_populates='loan_applications',
                                 foreign_keys=[created_by_user_id],
                                 overlaps="creator")
    creator = db.relationship('User', back_populates='created_loan_applications',
                              foreign_keys=[created_by_user_id],
                              overlaps="owner_user")

    # Core Fields
    application_id = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    mother_name = db.Column(db.String(50))
    father_name = db.Column(db.String(50))
    gender = db.Column(db.String(10), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    aadhar_number = db.Column(db.String(12), nullable=False)
    pan_number = db.Column(db.String(10))
    mobile_number = db.Column(db.String(15))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    pincode = db.Column(db.String(6))
    photo_url = db.Column(db.String(200))

    loan_type = db.Column(db.String(50), default='Personal')
    loan_amount = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='Due')

    society_name = db.Column(db.String(150))
    branch_name = db.Column(db.String(150))

    voter_id = db.Column(db.String(50))
    remarks = db.Column(db.String(255))
    created_by = db.Column(db.String(120))
    modified_by = db.Column(db.String(120))

    password_hash = db.Column(db.String(512))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lead_status = db.Column(db.String(50), default="Pending")

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8')) if self.password_hash else False

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "mother_name": self.mother_name,
            "father_name": self.father_name,
            "gender": self.gender,
            "date_of_birth": self.date_of_birth.isoformat(),
            "aadhar_number": self.aadhar_number,
            "pan_number": self.pan_number,
            "mobile_number": self.mobile_number,
            "email": self.email,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "photo_url": self.photo_url,
            "loan_type": self.loan_type,
            "loan_amount": self.loan_amount,
            "status": self.status,
            "society_name": self.society_name,
            "bank_name": self.bank.bank_name if self.bank else None,
            "branch_name": self.branch.branch_name if self.branch else None,
            "remarks": self.remarks,
            "created_by": self.created_by,
            "created_by_user_id": self.created_by_user_id,
            "lead_status": self.lead_status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "bank_id": self.bank_id,
            "branch_id": self.branch_id,
        }


# ================================================================
# BANK SERVICE
# ================================================================
class BankService(db.Model):
    __tablename__ = 'bank_services'

    id = db.Column(db.Integer, primary_key=True)
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    service_type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    interest_rate_min = db.Column(db.Float)
    interest_rate_max = db.Column(db.Float)
    processing_time = db.Column(db.String(50))
    features = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "bank_id": self.bank_id,
            "service_type": self.service_type,
            "name": self.name,
            "description": self.description,
            "interest_rate_min": self.interest_rate_min,
            "interest_rate_max": self.interest_rate_max,
            "processing_time": self.processing_time,
            "features": self.features,
            "created_at": self.created_at.isoformat(),
        }


# ================================================================
# TRANSACTION
# ================================================================
class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    amount = db.Column(db.Float, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "bank_id": self.bank_id,
            "type": self.type,
            "description": self.description,
            "amount": self.amount,
            "timestamp": self.timestamp.isoformat(),
        }


# ================================================================
# CONTACT MESSAGE
# ================================================================
class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20))
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='General Inquiry')
    status = db.Column(db.String(50), default='Unread')
    admin_notes = db.Column(db.Text)
    assigned_to = db.Column(db.String(150))
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "subject": self.subject,
            "category": self.category,
            "message": self.message,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "assigned_to": self.assigned_to,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at,
        }


# ================================================================
# CREDIT CONSENT MODEL
# ================================================================
class CreditConsent(db.Model):
    __tablename__ = "credit_consents"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    provider = db.Column(db.String(80), nullable=False)  # e.g.: 'cibil'
    consent_text = db.Column(db.Text, nullable=False)
    consent_id = db.Column(db.String(128), nullable=False, unique=True)  # UUID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ================================================================
# BUREAU REPORT MODEL
# ================================================================
class BureauReport(db.Model):
    __tablename__ = "bureau_reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    provider = db.Column(db.String(80), nullable=False)
    score = db.Column(db.Integer)
    reference_id = db.Column(db.String(256))  # Provider reference
    report_path = db.Column(db.String(512))  # Secure encrypted file
    meta = db.Column(db.JSON)  # Summary JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)