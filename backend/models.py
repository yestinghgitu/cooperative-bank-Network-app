from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash  #  Added
import bcrypt
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Personal details
    full_name = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    branch = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(50), nullable=False, default='user')

    # Metadata
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=True)
    modified_by = db.Column(db.String(100), nullable=True)

    def set_password(self, password):
        """Hashes and stores password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Serialize user for API responses."""
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'branch': self.branch,
            'role': self.role,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': self.created_by,
            'modified_by': self.modified_by
        }


class LoanApplication(db.Model):
    __tablename__ = 'loan_applications'
    
    id = db.Column(db.Integer, primary_key=True)
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

    # New fields (as per your latest frontend table)
    society_name = db.Column(db.String(150))
    voter_id = db.Column(db.String(50))
    remarks = db.Column(db.String(255))
    created_by = db.Column(db.String(120))
    modified_by = db.Column(db.String(120))

    # For application login
    password_hash = db.Column(db.String(120))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lead_status = db.Column(db.String(50), default='Pending')

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
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

            'society_name': self.society_name,
            'voter_id': self.voter_id,
            'remarks': self.remarks,
            'created_by': self.created_by,
            'modified_by': self.modified_by,

            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class BankService(db.Model):
    __tablename__ = 'bank_services'
    
    id = db.Column(db.Integer, primary_key=True)
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
            'service_type': self.service_type,
            'name': self.name,
            'description': self.description,
            'interest_rate_min': self.interest_rate_min,
            'interest_rate_max': self.interest_rate_max,
            'processing_time': self.processing_time,
            'features': self.features,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    amount = db.Column(db.Float, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'amount': self.amount,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
