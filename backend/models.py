from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt
from datetime import datetime

db = SQLAlchemy()

# ========================
# User Model
# ========================
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Personal details
    full_name = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='user')

    # Link to Cooperative Bank / Branch
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('cooperative_branches.id'))

    # Metadata
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=True)
    modified_by = db.Column(db.String(100), nullable=True)

    # Relationships
    bank_rel = db.relationship('CooperativeBank', foreign_keys=[bank_id])
    branch_rel = db.relationship('CooperativeBranch', foreign_keys=[branch_id])

    # reverse relationships
    loan_applications = db.relationship('LoanApplication', backref='owner_user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'bank_id': self.bank_id,
            'branch_id': self.branch_id,
            'bank_name': self.bank_rel.bank_name if self.bank_rel else None,
            'branch_name': self.branch_rel.branch_name if self.branch_rel else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': self.created_by,
            'modified_by': self.modified_by
        }


# ========================
# Cooperative Society Models
# ========================
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
    country = db.Column(db.String(100), nullable=False, default='India')
    established_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='Active')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branches = db.relationship('CooperativeBranch', backref='bank_rel', lazy=True)
    contacts = db.relationship('BankContact', backref='bank_rel', lazy=True)
    users = db.relationship('User', backref='bank_rel_users', lazy=True)
    loans = db.relationship('LoanApplication', backref='bank_rel', lazy=True)
    services = db.relationship('BankService', backref='bank_rel', lazy=True)
    transactions = db.relationship('Transaction', backref='bank_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'bank_name': self.bank_name,
            'registration_number': self.registration_number,
            'rbi_license_number': self.rbi_license_number,
            'ifsc_code': self.ifsc_code,
            'micr_code': self.micr_code,
            'head_office_address': self.head_office_address,
            'district': self.district,
            'state': self.state,
            'country': self.country,
            'established_date': self.established_date.isoformat() if self.established_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class CooperativeBranch(db.Model):
    __tablename__ = 'cooperative_branches'

    id = db.Column(db.Integer, primary_key=True)
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'), nullable=False)
    branch_name = db.Column(db.String(255), nullable=False)
    branch_code = db.Column(db.String(50))
    address = db.Column(db.String(255), nullable=True)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    ifsc_code = db.Column(db.String(20))
    contact_number = db.Column(db.String(15))
    manager_name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='Active')

    users = db.relationship('User', backref='branch_rel_users', lazy=True)
    loans = db.relationship('LoanApplication', backref='branch_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'bank_id': self.bank_id,
            'bank_name': self.bank_rel.bank_name if self.bank_rel else None,
            'branch_name': self.branch_name,
            'branch_code': self.branch_code,
            'address': self.address,
            'district': self.district,
            'state': self.state,
            'ifsc_code': self.ifsc_code,
            'contact_number': self.contact_number,
            'manager_name': self.manager_name,
            'status': self.status
        }


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
            'id': self.id,
            'bank_id': self.bank_id,
            'contact_person': self.contact_person,
            'designation': self.designation,
            'email': self.email,
            'phone_number': self.phone_number
        }

# ========================
# Loan Model (Updated for RBAC)
# ========================
class LoanApplication(db.Model):
    __tablename__ = 'loan_applications'

    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    bank_id = db.Column(db.Integer, db.ForeignKey('cooperative_banks.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('cooperative_branches.id'))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # who created the record

    # Relationships
    bank = db.relationship('CooperativeBank', backref=db.backref('loan_applications', lazy=True))
    branch = db.relationship('CooperativeBranch', backref=db.backref('loan_applications', lazy=True))
    creator = db.relationship('User', backref=db.backref('created_loan_applications', lazy=True))

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
    society_name = db.Column(db.String(150))  # This will mirror bank_name
    branch_name = db.Column(db.String(150))  # This will mirror branch_name
    voter_id = db.Column(db.String(50))
    remarks = db.Column(db.String(255))
    created_by = db.Column(db.String(120))
    modified_by = db.Column(db.String(120))
    password_hash = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lead_status = db.Column(db.String(50), default='Pending')

    # ==========================
    # Password Hashing Utilities
    # ==========================
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    # ==========================
    # Serialization Helper
    # ==========================
    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'mother_name': self.mother_name,
            'father_name': self.father_name,
            'gender': self.gender,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'aadhar_number': self.aadhar_number,
            'pan_number': self.pan_number,
            'mobile_number': self.mobile_number,
            'email': self.email,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'photo_url': self.photo_url,
            'loan_type': self.loan_type,
            'loan_amount': self.loan_amount,
            'status': self.status,
            'society_name': self.society_name or (self.bank.bank_name if self.bank else None),
            'bank_name': self.bank.bank_name if self.bank else None,
            'branch_name': self.branch.branch_name if self.branch else None,
            'remarks': self.remarks,
            'created_by': self.created_by,
            'created_by_user_id': self.created_by_user_id,
            'lead_status': self.lead_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'bank_id': self.bank_id,
            'branch_id': self.branch_id,
        }


# ========================
# Society Services
# ========================
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
            'id': self.id,
            'bank_id': self.bank_id,
            'service_type': self.service_type,
            'name': self.name,
            'description': self.description,
            'interest_rate_min': self.interest_rate_min,
            'interest_rate_max': self.interest_rate_max,
            'processing_time': self.processing_time,
            'features': self.features,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ========================
# Transactions
# ========================
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
            'id': self.id,
            'bank_id': self.bank_id,
            'type': self.type,
            'description': self.description,
            'amount': self.amount,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Unread')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
