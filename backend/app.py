# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity, create_access_token
)
from models import db, User, LoanApplication, BankService, Transaction, CooperativeBank, CooperativeBranch
from auth import init_auth_routes
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from functools import wraps
import os
from dotenv import load_dotenv
from math import ceil
from models import ContactMessage

from flask_mail import Message
from models import ContactMessage
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from utils import mask_sensitive_info
from flask import url_for
from datetime import timedelta
import jwt as pyjwt
from datetime import datetime, timedelta
from flask import jsonify, request
from utils import send_email

import jwt as pyjwt
from datetime import datetime, timedelta
from flask import jsonify, request
import re
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError

# ==========================
# Initialization
# ==========================
load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

CORS_URLS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://65.2.63.253:5173",
    "https://cooperativebanknetwork.com",
    "https://www.cooperativebanknetwork.com",
    "https://www.conetx.in",
    "https://conetx.in"
]
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', CORS_URLS).split(',')
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# ==========================
# MySQL Configuration
# ==========================
DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'password')
MYSQL_HOST = os.environ.get('MYSQL_HOST', '127.0.0.1')
MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
MYSQL_DB = os.environ.get('MYSQL_DB', 'conetx_db')
SQLITE_PATH = os.getenv("SQLITE_PATH", "instance/database.db")
# Database configuration (auto-switch between MySQL and SQLite)
if DB_TYPE == "mysql":
    print("Using MySQL database")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    )
else:
    print("Using SQLite database")
    basedir = os.path.abspath(os.path.dirname(__file__))
    DB_PATH = os.path.join(basedir, SQLITE_PATH)
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#db = SQLAlchemy(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', '8f0f9c3b94c8842c13e6a8f23e97f8a5bda03b58d1c456e20e8d1dbe89d71b94')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "supersecretkey123")

# config.py or inside app.config.update({...})
app.config['MAX_MANAGERS_PER_BRANCH'] = int(os.getenv('MAX_MANAGERS_PER_BRANCH', 1))
app.config['MAX_USERS_PER_BRANCH'] = int(os.getenv('MAX_USERS_PER_BRANCH', 3))

app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER','smtp.gmail.com')
app.config['MAIL_PORT'] = os.environ.get('MAIL_PORT', 587)
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', True)
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'conetx.notifications@gmail.com')  # Admin email
app.config['MAIL_PASSWORD'] =  os.environ.get('MAIL_PASSWORD', 'qtjo pkof zhcw hauf')    # Use App Password, not your login
app.config['MAIL_DEFAULT_SENDER'] = ('CoNetX',  os.environ.get('MAIL_DEFAULT_SENDER','conetx.notifications@gmail.com'))
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'conetx.notifications@gmail.com')
mail = Mail(app)

# ==========================
# Initialize extensions
# ==========================
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

init_auth_routes(app)

# ==========================
# Role Decorators
# ==========================
def role_required(*roles):
    """
    Use as @role_required('admin', 'manager') etc.
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user = User.query.get(get_jwt_identity())
            if not current_user or current_user.role not in roles:
                return jsonify({'error': 'Access denied'}), 403
            return fn(current_user, *args, **kwargs)
        return wrapper
    return decorator

def admin_required(fn):
    """Simple admin-only decorator"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = User.query.get(get_jwt_identity())
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(current_user, *args, **kwargs)
    return wrapper

def loan_modify_required(fn):
    """
    Decorator used on endpoints that modify/delete a loan.
    Enforces:
      - Admin: can modify any loan
      - Manager: can modify loans belonging to their branch only
      - User: can modify loans they created (created_by_user_id)
    The view function will receive (application, current_user, *args, **kwargs)
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(id, *args, **kwargs):
        current_user = User.query.get(get_jwt_identity())
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401

        # find loan either by numeric id or application_id string
        application = None
        if str(id).isdigit():
            application = LoanApplication.query.filter_by(id=int(id)).first()
        if not application:
            application = LoanApplication.query.filter_by(application_id=str(id)).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        # Admin can modify any
        if current_user.role == 'admin':
            return fn(application, current_user, *args, **kwargs)

        # Manager can modify only if same branch
        if current_user.role == 'manager':
            if application.branch_id == current_user.branch_id:
                return fn(application, current_user, *args, **kwargs)
            return jsonify({'error': 'Managers can only modify loans of their branch'}), 403

        # User can modify only own created loans
        if current_user.role == 'user':
            if application.created_by_user_id == current_user.id:
                return fn(application, current_user, *args, **kwargs)
            return jsonify({'error': 'Users can only modify their own loans'}), 403

        return jsonify({'error': 'Access denied'}), 403

    return wrapper

# ==========================
# Utility Functions
# ==========================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def format_date_for_backend(date_string):
    """
    Accepts date string 'YYYY-MM-DD' or 'DD-MM-YYYY' and returns a datetime.date
    """
    if not date_string:
        return None
    if isinstance(date_string, (datetime,)):
        return date_string
    try:
        return datetime.strptime(date_string, '%Y-%m-%d')
    except Exception:
        try:
            return datetime.strptime(date_string, '%d-%m-%Y')
        except Exception:
            # if it's already in ISO, try parse
            try:
                return datetime.fromisoformat(date_string)
            except Exception:
                raise ValueError('Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY')

def paginate_query(query, page, limit):
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total
# ==========================
# Database Initialization
# ==========================
def create_tables_and_data():
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    with app.app_context():
        db.create_all()

        # -------------------------
        # Create default bank
        # -------------------------
        bank = CooperativeBank.query.filter_by(
            bank_name='Sample Cooperative Bank'
        ).first()

        if not bank:
            bank = CooperativeBank(
                bank_name='Sample Cooperative Bank',
                registration_number='REG123456',
                head_office_address='123 Bank Street, City, State',
                district='Sample District',
                state='Sample State'
            )
            db.session.add(bank)
            db.session.commit()
            print("Sample bank created.")

        # -------------------------
        # Create default branch
        # -------------------------
        branch = CooperativeBranch.query.filter_by(
            branch_name='Main Branch',
            bank_id=bank.id
        ).first()

        if not branch:
            branch = CooperativeBranch(
                bank_id=bank.id,
                branch_name='Main Branch',
                branch_code='MB001',
                address='456 Branch Avenue, City, State',
                district='Sample District',
                state='Sample State'
            )
            db.session.add(branch)
            db.session.commit()
            print("Sample branch created.")

        # -------------------------
        # Create default Super Admin
        # -------------------------
        admin = User.query.filter_by(username='admin').first()

        if not admin:
            admin = User(
                username='admin',
                full_name='Administrator',
                email='conetx.notifications@gmail.com',
                role='admin',
                bank_id=bank.id,
                branch_id=branch.id,
                created_by='system'
            )
            admin.set_password('2bck$@1157')
            db.session.add(admin)
            db.session.commit()
            print("Admin created: username=admin password=*******")
        else:
            print("Admin already exists.")

        # -------------------------
        # Default Bank Services
        # -------------------------
        if BankService.query.count() == 0:
            default_services = [
                # Active Service 1
                BankService(
                    service_type='Active',
                    name='Member Registration',
                    description='Register and verify new members in CoNetX.',
                    processing_time='Immediate',
                    features=(
                        'Create member profile\n'
                        'Assign membership ID\n'
                        'Capture and validate KYC\n'
                        'Aadhar & mobile number verification'
                    )
                ),

                # Active Service 2
                BankService(
                    service_type='Active',
                    name='Loan Verification System',
                    description='Internal and cross-society loan eligibility checking.',
                    processing_time='Instant',
                    features=(
                        'Internal loan status checking\n'
                        'Cross / inter-society loan duplication detection\n'
                        'Aadhar-based member verification\n'
                        'Mobile number-based tracing'
                    )
                ),

                # Active Service 3
                BankService(
                    service_type='Active',
                    name='Audit & Compliance',
                    description='Monitor and validate cooperative transactions.',
                    processing_time='Ongoing',
                    features=(
                        'Regular audit reports\n'
                        'Compliance checks\n'
                        'Transaction validation'
                    )
                ),

                # Upcoming 1
                BankService(
                    service_type='Upcoming',
                    name='Aadhar Authentication',
                    description='Instant Aadhaar-based eKYC identity verification.',
                    processing_time='Upcoming Feature',
                    features=(
                        'OTP / eKYC support\n'
                        'Instant identity validation\n'
                        'UIDAI-compliant secure workflow'
                    )
                ),

                # Upcoming 2
                BankService(
                    service_type='Upcoming',
                    name='CIBIL Integration',
                    description='Fetch member CIBIL credit scores and reports.',
                    processing_time='Coming Soon',
                    features=(
                        'Real-time score retrieval\n'
                        'Loan eligibility insights\n'
                        'Automated risk assessment'
                    )
                ),

                # Upcoming 3
                BankService(
                    service_type='Upcoming',
                    name='CoNetX Score',
                    description='AI-powered cooperative credit scoring.',
                    processing_time='Upcoming Feature',
                    features=(
                        'Behavior-based scoring\n'
                        'Repayment reliability prediction\n'
                        'Risk insight dashboard'
                    )
                ),

                # Upcoming 4
                BankService(
                    service_type='Upcoming',
                    name='Editable Legal Documents',
                    description='Create and customize legal loan and agreement documents.',
                    processing_time='In Development',
                    features=(
                        'Editable digital templates\n'
                        'Auto-filled member & loan info\n'
                        'Export for printing or e-sign'
                    )
                ),

                # Upcoming 5
                BankService(
                    service_type='Upcoming',
                    name='Smart Notifications',
                    description='Automated SMS, Email & In-app notifications.',
                    processing_time='Coming Soon',
                    features=(
                        'SMS / Email / In-app alerts\n'
                        'Loan and application reminders\n'
                        'Broadcast message system'
                    )
                ),
            ]

            db.session.add_all(default_services)
            db.session.commit()
            print("Default bank services added.")
        else:
            print("Bank services already exist.")

def sync_bank_services():
    updated_services = [
        BankService(
            service_type='Membership',
            name='Member Registration',
            description='Register new members to your CoNetX.',
            processing_time='Immediate',
            features='Create member profile\nAssign membership ID\nCapture KYC details'
        ),

        BankService(
            service_type='Upcoming',
            name='Aadhar Authentication',
            description='Instant verification of member identity using secure Aadhaar-based eKYC.',
            processing_time='Upcoming Feature',
            features=(
                'OTP/eKYC verification support\n'
                'Instant identity validation\n'
                'Secure UIDAI-compliant workflows'
            )
        ),

        BankService(
            service_type='Upcoming',
            name='CIBIL Integration',
            description='Fetch member credit scores and reports directly through CIBIL.',
            processing_time='Upcoming Feature',
            features=(
                'Real-time credit score retrieval\n'
                'Loan eligibility insights\n'
                'Automated risk assessment'
            )
        ),

        BankService(
            service_type='Upcoming',
            name='CoNetX Score',
            description='AI-based cooperative credit scoring system for better lending decisions.',
            processing_time='In Development',
            features=(
                'Behavior-based scoring\n'
                'Repayment reliability index\n'
                'Risk prediction dashboard'
            )
        ),

        BankService(
            service_type='Upcoming',
            name='Editable Legal Documents',
            description='Generate, edit, and export customizable legal and loan agreement documents.',
            processing_time='In Development',
            features=(
                'Editable digital templates\n'
                'Auto-filled member and loan info\n'
                'Support for print and e-sign workflows'
            )
        ),

        BankService(
            service_type='Upcoming',
            name='Smart Notifications',
            description='Automated alerts for members and managers to improve engagement and compliance.',
            processing_time='Coming Soon',
            features=(
                'Loan due reminders\n'
                'Application status updates\n'
                'SMS / Email / In-app notifications\n'
                'Branch-wide broadcast messages'
            )
        ),

        BankService(
            service_type='Audit',
            name='Audit & Compliance',
            description='Ensure all transactions and loans follow regulations.',
            processing_time='Ongoing',
            features='Regular audit reports\nCompliance checks\nTransaction validation'
        )
    ]

    for svc in updated_services:
        existing = BankService.query.filter_by(name=svc.name).first()
        if not existing:
            db.session.add(svc)

    db.session.commit()
    print("Bank services synced successfully.")


with app.app_context():
    create_tables_and_data()
    #sync_bank_services()

# ==========================
# Health Check
# ==========================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Server is running'}), 200

# ==========================
# Dashboard
# ==========================
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    current_user = User.query.get(get_jwt_identity())
    stats = {}

    if current_user.role == 'admin':
        # Admin: sees all banks and branches
        banks = CooperativeBank.query.all()
        stats['banks'] = []
        total_loans = 0
        total_pending = 0
        total_users = 0
        stats['partnered_banks'] = len(banks)

        for bank in banks:
            bank_loans = LoanApplication.query.filter_by(bank_id=bank.id).count()
            bank_pending = LoanApplication.query.filter_by(bank_id=bank.id).filter(LoanApplication.status != 'Running').count()
            bank_users = User.query.filter_by(bank_id=bank.id).count()

            bank_data = {
                'bank_id': bank.id,
                'bank_name': bank.bank_name,
                'total_loans': bank_loans,
                'pending_loans': bank_pending,
                'total_users': bank_users,
                'branches': []
            }

            for branch in bank.branches:
                branch_loans = LoanApplication.query.filter_by(branch_id=branch.id).count()
                branch_pending = LoanApplication.query.filter_by(branch_id=branch.id).filter(LoanApplication.status != 'Running').count()
                branch_users = User.query.filter_by(branch_id=branch.id).count()

                branch_data = {
                    'branch_id': branch.id,
                    'branch_name': branch.branch_name,
                    'total_loans': branch_loans,
                    'pending_loans': branch_pending,
                    'total_users': branch_users
                }
                bank_data['branches'].append(branch_data)

            total_loans += bank_loans
            total_pending += bank_pending
            total_users += bank_users
            stats['banks'].append(bank_data)

        stats['total_loans'] = total_loans
        stats['pending_loans'] = total_pending
        stats['total_users'] = total_users

    elif current_user.role == 'manager':
        # Manager: sees their bank and branch stats
        bank = current_user.bank_rel
        branch = current_user.branch_rel

        total_loans = LoanApplication.query.filter_by(bank_id=current_user.bank_id).count()
        pending_loans = LoanApplication.query.filter_by(bank_id=current_user.bank_id).filter(LoanApplication.status != 'Running').count()
        total_users = User.query.filter_by(bank_id=current_user.bank_id).count()

        branch_loans = LoanApplication.query.filter_by(branch_id=current_user.branch_id).count()
        branch_pending = LoanApplication.query.filter_by(branch_id=current_user.branch_id).filter(LoanApplication.status != 'Running').count()
        branch_users = User.query.filter_by(branch_id=current_user.branch_id).count()

        stats['bank'] = {
            'bank_id': bank.id if bank else None,
            'bank_name': bank.bank_name if bank else None,
            'total_loans': total_loans,
            'pending_loans': pending_loans,
            'total_users': total_users,
            'partnered_banks': 1,
            'branches': [{
                'branch_id': current_user.branch_id,
                'branch_name': branch.branch_name if branch else None,
                'total_loans': branch_loans,
                'pending_loans': branch_pending,
                'total_users': branch_users
            }]
        }

        stats['total_loans'] = total_loans
        stats['pending_loans'] = pending_loans
        stats['total_users'] = total_users
        stats['partnered_banks'] = 1

    else:
        # Regular user: show only their own loan stats
        user_loans = LoanApplication.query.filter_by(created_by_user_id = current_user.id).count()
        user_pending = LoanApplication.query.filter_by(created_by_user_id = current_user.id).filter(LoanApplication.status != 'Running').count()

        stats['user_stats'] = {
            'user_id': current_user.id,
            'user_name': current_user.full_name if hasattr(current_user, 'full_name') else current_user.username,
            'total_loans': user_loans,
            'pending_loans': user_pending
        }

    return jsonify(stats), 200

# ==========================`
# Auth, User, and Admin Routes
# ==========================
@app.route('/api/admin/users', methods=['GET'])
@role_required('admin', 'manager')
def list_users(current_user):
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search', '')

    query = User.query
    # manager sees only their branch users
    if current_user.role == 'manager':
        query = query.filter_by(branch_id=current_user.branch_id)
    if search:
        query = query.filter((User.username.contains(search)) | (User.full_name.contains(search)))
    
    users, total = paginate_query(query, page, limit)
    return jsonify({
        'data': [mask_sensitive_info(u.to_dict()) for u in users],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200

@app.route('/api/admin/users', methods=['POST'])
@role_required('admin', 'manager')
def create_user(current_user):
    data = request.get_json() or {}

    username = (data.get('username') or '').strip()
    password = data.get('password')
    email = (data.get('email') or '').strip()
    full_name = (data.get('full_name') or '').strip()
    role = (data.get('role') or 'user').lower()

    # ------------------------------
    # Required fields
    # ------------------------------
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Email format validation
    if email and not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({'error': 'Invalid email format'}), 400

    bank_id = data.get('bank_id')
    branch_id = data.get('branch_id')

    # ------------------------------
    # Restrict manager privileges
    # ------------------------------
    if current_user.role == 'manager':
        if role == 'admin':
            return jsonify({'error': 'Managers cannot create admin users'}), 403
        bank_id = current_user.bank_id
        branch_id = current_user.branch_id

    if not branch_id:
        return jsonify({'error': 'Branch is required'}), 400

    # ------------------------------
    # Configurable branch-level limits
    # ------------------------------
    max_managers = app.config.get('MAX_MANAGERS_PER_BRANCH', 1)
    max_users = app.config.get('MAX_USERS_PER_BRANCH', 3)

    manager_count = User.query.filter_by(branch_id=branch_id, role='manager').count()
    user_count = User.query.filter_by(branch_id=branch_id, role='user').count()

    if role == 'manager' and manager_count >= max_managers:
        return jsonify({'error': f'Only {max_managers} manager(s) allowed per branch'}), 400

    if role == 'user' and user_count >= max_users:
        return jsonify({'error': f'Only {max_users} user(s) allowed per branch'}), 400

    # ------------------------------
    # Create user object
    # ------------------------------
    user = User(
        username=username,
        full_name=full_name,
        email=email,
        role=role,
        bank_id=bank_id,
        branch_id=branch_id,
        created_by=current_user.username
    )
    user.set_password(password)
    db.session.add(user)

    # ------------------------------
    # Commit with field-specific unique constraint handling
    # ------------------------------
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        msg = str(e.orig).lower()
        if 'username' in msg:
            return jsonify({'error': 'Username already exists'}), 400
        elif 'email' in msg:
            return jsonify({'error': 'Email already exists'}), 400
        elif 'full_name' in msg:
            return jsonify({'error': 'Full name already exists'}), 400
        else:
            return jsonify({'error': 'A unique constraint was violated'}), 400

    # ------------------------------
    # Send credentials email (optional)
    # ------------------------------
    if email:
        try:
            msg = Message(
                subject="Your CoNetX Account Credentials",
                recipients=[email],
                body=(
                    f"Hello {user.full_name or user.username},\n\n"
                    "Your CoNetX account has been created successfully.\n\n"
                    f"Username: {user.username}\n"
                    f"Password: {password}\n"
                    f"Role: {user.role}\n\n"
                    "You can now log in at: https://www.conetx.in\n\n"
                    "Please change your password after your first login.\n\n"
                    f"Best regards,\n{current_user.full_name or current_user.username}"
                )
            )
            mail.send(msg)
        except Exception as e:
            app.logger.error(f"Failed to send user credentials email: {e}")

    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict(),
        'email_notice': f"Credentials sent to {email}" if email else "No valid email provided"
    }), 201


# ======================================
# Update User Endpoint
# ======================================
@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@role_required('admin', 'manager')
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    # ------------------------------
    # Prevent non-admins from modifying admins
    # ------------------------------
    if current_user.role == 'manager' and user.role == 'admin':
        return jsonify({'error': 'Managers cannot modify admin users'}), 403

    # ------------------------------
    # Track password change
    # ------------------------------
    old_password_hash = user.password_hash

    # ------------------------------
    # Update allowed fields
    # ------------------------------
    allowed_fields = ['full_name', 'email', 'role', 'bank_id', 'branch_id']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field].strip() if isinstance(data[field], str) else data[field])

    # Password change
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    # ------------------------------
    # Enforce branch-level limits if role changed
    # ------------------------------
    max_managers = app.config.get('MAX_MANAGERS_PER_BRANCH', 1)
    max_users = app.config.get('MAX_USERS_PER_BRANCH', 3)

    if user.role == 'manager':
        manager_count = User.query.filter(
            User.branch_id == user.branch_id,
            User.role == 'manager',
            User.id != user.id
        ).count()
        if manager_count >= max_managers:
            return jsonify({'error': f'Only {max_managers} manager(s) allowed per branch'}), 400

    if user.role == 'user':
        user_count = User.query.filter(
            User.branch_id == user.branch_id,
            User.role == 'user',
            User.id != user.id
        ).count()
        if user_count >= max_users:
            return jsonify({'error': f'Only {max_users} user(s) allowed per branch'}), 400

    # ------------------------------
    # Commit with unique constraint handling
    # ------------------------------
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        msg = str(e.orig).lower()
        if 'username' in msg:
            return jsonify({'error': 'Username already exists'}), 400
        elif 'email' in msg:
            return jsonify({'error': 'Email already exists'}), 400
        elif 'full_name' in msg:
            return jsonify({'error': 'Full name already exists'}), 400
        else:
            return jsonify({'error': 'A unique constraint was violated'}), 400

    # ------------------------------
    # Send email if password changed
    # ------------------------------
    if data.get('password') and user.password_hash != old_password_hash and user.email:
        try:
            msg = Message(
                subject="Your CoNetX Password Was Updated",
                recipients=[user.email],
                body=(
                    f"Hello {user.full_name or user.username},\n\n"
                    "This is a confirmation that your CoNetX password has been changed.\n\n"
                    "If you did NOT change your password, please contact your system administrator immediately.\n\n"
                    f"Best regards,\n{current_user.full_name or current_user.username}\nCoNetX Administration"
                )
            )
            mail.send(msg)
        except Exception as e:
            app.logger.error(f"Failed to send password update email: {e}")

    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()})

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@role_required('admin', 'manager')
def delete_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # ------------------------------
    # Prevent deleting admin users by non-admins
    # ------------------------------
    if user.role == 'admin' and current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete admin users'}), 403

    # ------------------------------
    # Managers can only delete users in their branch
    # ------------------------------
    if current_user.role == 'manager' and user.branch_id != current_user.branch_id:
        return jsonify({'error': 'Managers can only delete users in their branch'}), 403

    # ------------------------------
    # Delete user
    # ------------------------------
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200


@app.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@role_required('admin', 'manager')
def reset_password(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    new_password = data.get('password')
    if not new_password:
        return jsonify({'error': 'Password required'}), 400

    # Managers can only reset for their branch
    if current_user.role == 'manager' and user.branch_id != current_user.branch_id:
        return jsonify({'error': 'Managers can only reset passwords for users in their branch'}), 403

    # Update password
    user.set_password(new_password)
    user.modified_by = current_user.username
    db.session.commit()

    # Send notification email if possible
    if user.email and "@" in user.email:
        try:
            msg = Message(
                subject="Your CoNetX Password Has Been Reset",
                recipients=[user.email],
                body=(
                    f"Hello {user.full_name or user.username},\n\n"
                    f"Your CoNetX account password has been reset by an administrator ({current_user.full_name or current_user.username}).\n\n"
                    f"Username: {user.username}\n"
                    f"New Password: {new_password}\n\n"
                    "You can now log in at: https://www.conetx.in/login\n\n"
                    "For security, please change your password after logging in.\n\n"
                    "If you did not request this password reset, contact your administrator immediately.\n\n"
                    "Best regards,\n"
                    f"{current_user.full_name or current_user.username}\n"
                    "CoNetX Administration"
                )
            )
            mail.send(msg)
            app.logger.info(f"Password reset email sent to {user.email}")
        except Exception as e:
            app.logger.error(f"Failed to send reset password email to {user.email}: {e}")

    return jsonify({
        'message': f'Password for {user.username} reset successfully',
        'email_notice': f"Notification sent to {user.email}" if user.email else "No valid email available"
    }), 200

# ==========================
# Superadmin Banks & Branches Routes
# ==========================
@app.route('/api/admin/banks', methods=['POST'])
@role_required('admin',)
def create_bank(current_user):
    data = request.get_json() or {}

    # enforce required fields that DB schema expects (avoid NOT NULL errors)
    required_fields = ['bank_name', 'head_office_address', 'district', 'state']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    if CooperativeBank.query.filter_by(bank_name=data['bank_name']).first():
        return jsonify({'error': 'Bank already exists'}), 400

    # Create a new CooperativeBank record with all expected fields
    try:
        established_date = None
        if data.get('established_date'):
            established_date = format_date_for_backend(data.get('established_date'))

        bank = CooperativeBank(
            bank_name=data.get('bank_name'),
            registration_number=data.get('registration_number'),
            rbi_license_number=data.get('rbi_license_number'),
            ifsc_code=data.get('ifsc_code'),
            micr_code=data.get('micr_code'),
            head_office_address=data.get('head_office_address'),
            district=data.get('district'),
            state=data.get('state'),
            country=data.get('country', 'India'),
            established_date=established_date,
            status=data.get('status', 'Active')
        )

        db.session.add(bank)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error creating bank")
        return jsonify({'error': 'Failed to create bank', 'details': str(e)}), 500

    return jsonify({'message': 'Bank created successfully', 'bank': bank.to_dict()}), 201


@app.route('/api/admin/banks/<int:bank_id>', methods=['PUT'])
@role_required('admin',)
def update_bank(current_user, bank_id):
    data = request.get_json() or {}
    bank = CooperativeBank.query.get(bank_id)
    if not bank:
        return jsonify({'error': 'Bank not found'}), 404

    # Update allowed fields if present
    updatable_fields = [
        'bank_name', 'registration_number', 'rbi_license_number',
        'ifsc_code', 'micr_code', 'head_office_address',
        'district', 'state', 'country', 'status'
    ]
    try:
        for field in updatable_fields:
            if field in data:
                setattr(bank, field, data[field])

        if 'established_date' in data and data['established_date']:
            bank.established_date = format_date_for_backend(data['established_date'])

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error updating bank")
        return jsonify({'error': 'Failed to update bank', 'details': str(e)}), 500

    return jsonify({'message': 'Bank updated successfully', 'bank': bank.to_dict()}), 200


@app.route('/api/admin/banks/<int:bank_id>', methods=['DELETE'])
@role_required('admin',)
def delete_bank(current_user, bank_id):
    bank = CooperativeBank.query.get(bank_id)
    if not bank:
        return jsonify({'error': 'Bank not found'}), 404
    db.session.delete(bank)
    db.session.commit()
    return jsonify({'message': 'Bank deleted successfully'}), 200


@app.route('/api/admin/branches', methods=['POST'])
@role_required('admin',)
def create_branch(current_user):
    data = request.get_json() or {}

    required_fields = ['bank_name', 'branch_name', 'address', 'district', 'state']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    bank_name = data.get('bank_name')
    branch_name = data.get('branch_name')
    bank = CooperativeBank.query.filter_by(bank_name=bank_name).first()
    if not bank:
        return jsonify({'error': 'Bank not found'}), 404

    try:
        branch = CooperativeBranch(
            bank_id=bank.id,
            branch_name=branch_name,
            branch_code=data.get('branch_code'),
            address=data.get('address'),
            district=data.get('district'),
            state=data.get('state'),
            ifsc_code=data.get('ifsc_code'),
            contact_number=data.get('contact_number'),
            manager_name=data.get('manager_name'),
            status=data.get('status', 'Active')
        )
        db.session.add(branch)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error creating branch")
        return jsonify({'error': 'Failed to create branch', 'details': str(e)}), 500

    return jsonify({'message': 'Branch created successfully', 'branch': branch.to_dict()}), 201


@app.route('/api/admin/branches/<int:branch_id>', methods=['PUT'])
@role_required('admin',)
def update_branch(current_user, branch_id):
    data = request.get_json() or {}
    branch = CooperativeBranch.query.get(branch_id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404

    # Update allowed branch fields
    updatable = [
        'branch_name', 'branch_code', 'address', 'district', 'state',
        'ifsc_code', 'contact_number', 'manager_name', 'status'
    ]
    try:
        for field in updatable:
            if field in data:
                setattr(branch, field, data[field])
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error updating branch")
        return jsonify({'error': 'Failed to update branch', 'details': str(e)}), 500

    return jsonify({'message': 'Branch updated successfully', 'branch': branch.to_dict()}), 200


@app.route('/api/admin/branches/<int:branch_id>', methods=['DELETE'])
@role_required('admin',)
def delete_branch(current_user, branch_id):
    branch = CooperativeBranch.query.get(branch_id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    db.session.delete(branch)
    db.session.commit()
    return jsonify({'message': 'Branch deleted successfully'}), 200

# ------------------ Banks (GET) ------------------
@app.route('/api/admin/banks', methods=['GET'])
@role_required('admin', 'manager')
def list_banks(current_user):
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 1000))
    search = request.args.get('search', '')

    query = CooperativeBank.query
    if search:
        query = query.filter(CooperativeBank.bank_name.contains(search))
    banks, total = paginate_query(query, page, limit)
    return jsonify({
        'data': [b.to_dict() for b in banks],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200


# ------------------ Branches (GET) ------------------
@app.route('/api/admin/branches', methods=['GET'])
@role_required('admin', 'manager')
def list_branches(current_user):
    bank_name = request.args.get('bank_name', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 1000))
    search = request.args.get('search', '')

    query = CooperativeBranch.query.join(CooperativeBank)
    if bank_name:
        query = query.filter(CooperativeBank.bank_name == bank_name)
    if search:
        query = query.filter(CooperativeBranch.branch_name.contains(search))
    # manager sees only their branch? In list endpoints we let managers view all branches; change if you want to restrict
    branches, total = paginate_query(query, page, limit)
    return jsonify({
        'data': [b.to_dict() for b in branches],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200

# ==========================
# Loan Management
# ==========================
@app.route('/api/loans/applications/search', methods=['GET'])
@jwt_required()
def search_loan_applications():
    """
    Authenticated loan search.
    Accessible by all roles (Admin, Manager, User).
    Can search loans across all banks and branches.
    """
    try:
        # Current user info (if you need to log or enforce future restrictions)
        current_user = get_jwt_identity()
        print(f"User {current_user} performing loan search")

        # Extract query parameters
        aadhar_number = request.args.get('aadharNumber', '').strip()
        mobile_number = request.args.get('mobileNumber', '').strip()
        first_name = request.args.get('firstName') or request.args.get('first_name', '')
        last_name = request.args.get('lastName') or request.args.get('last_name', '')
        loan_type = request.args.get('loanType', '').strip()
        status = request.args.get('status', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))

        # Build base query (everyone can search all)
        query = LoanApplication.query

        # Apply filters dynamically
        if aadhar_number:
            query = query.filter(LoanApplication.aadhar_number == aadhar_number)
        if mobile_number:
            query = query.filter(LoanApplication.mobile_number == mobile_number)
        if first_name:
            query = query.filter(LoanApplication.first_name.ilike(f"%{first_name}%"))
        if last_name:
            query = query.filter(LoanApplication.last_name.ilike(f"%{last_name}%"))
        if loan_type:
            query = query.filter(LoanApplication.loan_type.ilike(f"%{loan_type}%"))
        if status:
            query = query.filter(LoanApplication.status.ilike(f"%{status}%"))

        # Pagination
        total = query.count()
        applications = query.order_by(LoanApplication.created_at.desc()) \
                            .offset((page - 1) * limit) \
                            .limit(limit) \
                            .all()

        # Build response
        # result = []
        # for app_obj in applications:
        #     result.append({
        #         "id": app_obj.id,
        #         "application_id": app_obj.application_id,
        #         "first_name": app_obj.first_name,
        #         "last_name": app_obj.last_name,
        #         "mother_name": app_obj.mother_name,
        #         "father_name": app_obj.father_name,
        #         "gender": app_obj.gender,
        #         "date_of_birth": app_obj.date_of_birth.isoformat() if app_obj.date_of_birth else None,
        #         "aadhar_number": app_obj.aadhar_number,
        #         "pan_number": app_obj.pan_number,
        #         "mobile_number": app_obj.mobile_number,
        #         "email": app_obj.email,
        #         "address": app_obj.address,
        #         "city": app_obj.city,
        #         "state": app_obj.state,
        #         "pincode": app_obj.pincode,
        #         "photo_url": app_obj.photo_url,
        #         "loan_type": app_obj.loan_type,
        #         "loan_amount": app_obj.loan_amount,
        #         "status": app_obj.status,
        #         "society_name": app_obj.society_name or (app_obj.bank.bank_name if app_obj.bank else None),
        #         "branch_name": app_obj.branch_name or (app_obj.branch.branch_name if app_obj.branch else None),
        #         "created_at": app_obj.created_at.isoformat() if app_obj.created_at else None
        #     })
        result = [mask_sensitive_info(app_obj.to_dict()) for app_obj in applications]

        return jsonify({
            "data": result,
            "page": page,
            "limit": limit,
            "total": total
        }), 200

    except Exception as e:
        print("Error searching loans:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/loans/applications', methods=['POST'])
@role_required('admin', 'manager', 'user')
def create_loan(current_user):
    data = request.get_json() or {}

    # ------------------------------
    # Generate unique application ID
    # ------------------------------
    last_app = LoanApplication.query.order_by(LoanApplication.id.desc()).first()
    new_id = 1 if not last_app else last_app.id + 1
    application_id = f"CONETXLOAN{new_id:04d}"

    # ------------------------------
    # Validate and parse date_of_birth
    # ------------------------------
    dob = None
    if data.get('date_of_birth'):
        try:
            dob = format_date_for_backend(data.get('date_of_birth'))
        except Exception:
            return jsonify({'error': 'Invalid date_of_birth format. Use YYYY-MM-DD'}), 400

    # ------------------------------
    # Required fields validation
    # ------------------------------
    required_fields = ['first_name', 'last_name', 'loan_type', 'loan_amount']
    missing_fields = [f for f in required_fields if not data.get(f)]
    if missing_fields:
        return jsonify({'error': f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # ------------------------------
    # Determine bank/branch based on role
    # ------------------------------
    bank_id = data.get('bank_id')
    branch_id = data.get('branch_id')

    if current_user.role == 'manager' or current_user.role == 'user':
        # Managers and users are restricted to their own bank/branch
        bank_id = current_user.bank_id
        branch_id = current_user.branch_id

    # ------------------------------
    # Create LoanApplication instance
    # ------------------------------
    try:
        application = LoanApplication(
            application_id=application_id,
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            mother_name=data.get('mother_name', '').strip(),
            father_name=data.get('father_name', '').strip(),
            gender=data.get('gender', 'Not Specified').strip(),
            date_of_birth=dob,
            aadhar_number=data.get('aadhar_number', '').strip(),
            pan_number=data.get('pan_number', '').strip(),
            mobile_number=data.get('mobile_number', '').strip(),
            email=data.get('email', '').strip(),
            address=data.get('address', '').strip(),
            city=data.get('city', '').strip(),
            state=data.get('state', '').strip(),
            pincode=data.get('pincode', '').strip(),
            photo_url=data.get('photo_url', '').strip(),
            loan_type=data['loan_type'].strip(),
            loan_amount=float(data['loan_amount']),
            society_name=data.get('society_name', '').strip(),
            branch_name=data.get('branch_name', '').strip(),
            voter_id=data.get('voter_id', '').strip(),
            status=data.get('status', 'Due').strip(),
            remarks=data.get('remarks', '').strip(),
            bank_id=bank_id,
            branch_id=branch_id,
            created_by=current_user.username,
            created_by_user_id=current_user.id
        )

        db.session.add(application)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        # Handle common DB integrity issues
        if 'NOT NULL constraint failed' in str(e.orig):
            return jsonify({'error': f'Missing required field in database: {str(e.orig)}'}), 400
        return jsonify({'error': 'Database integrity error', 'details': str(e.orig)}), 400
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error creating loan application")
        return jsonify({'error': 'Failed to create loan application', 'details': str(e)}), 500

    # ------------------------------
    # Success response
    # ------------------------------
    return jsonify({
        'message': 'Loan application created successfully',
        'application_id': application_id
    }), 201

@app.route('/api/loans/applications', methods=['GET'])
@jwt_required()
def list_loans():
    # All roles can search/view loans across network (read). Modifications are guarded separately.
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 1000))
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    bank_id = request.args.get('bank_id')
    branch_id = request.args.get('branch_id')

    query = LoanApplication.query

    if search:
        # simple text search across first_name, last_name, application_id, aadhar
        query = query.filter(
            (LoanApplication.first_name.contains(search)) |
            (LoanApplication.last_name.contains(search)) |
            (LoanApplication.application_id.contains(search)) |
            (LoanApplication.aadhar_number.contains(search))
        )
    if status:
        query = query.filter_by(status=status)
    if bank_id:
        query = query.filter_by(bank_id=bank_id)
    if branch_id:
        query = query.filter_by(branch_id=branch_id)

    loans, total = paginate_query(query.order_by(LoanApplication.id.desc()), page, limit)
    return jsonify({
        'data': [mask_sensitive_info(l.to_dict()) for l in loans],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200


@app.route('/api/loans/applications/<string:id>', methods=['PUT'])
@loan_modify_required
def update_loan(application, current_user):
    data = request.get_json() or {}
    editable_fields = ['aadhar_number', 'first_name', 'last_name', 'loan_amount', 'status', 'remarks', 'mobile_number', 'email', 'address']
    for field in editable_fields:
        if field in data:
            setattr(application, field, data[field])
    application.updated_at = datetime.utcnow()
    application.modified_by = current_user.username
    db.session.commit()
    return jsonify({'message': 'Application updated', 'application': application.to_dict()}), 200


@app.route('/api/loans/applications/<string:id>', methods=['DELETE'])
@loan_modify_required
def delete_loan(application, current_user):
    db.session.delete(application)
    db.session.commit()
    return jsonify({'message': 'Application deleted successfully'}), 200

# ==========================
# File Uploads
# ==========================
@app.route('/api/upload/photo', methods=['POST'])
@jwt_required()
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        # use request.host_url to build correct host path
        host = request.host_url.rstrip('/')
        photo_url = f"{host}/uploads/{unique_filename}"
        return jsonify({'message': 'File uploaded', 'photo_url': photo_url}), 200
    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ==========================
# Bank Services
# ==========================
@app.route('/api/services', methods=['GET'])
def get_bank_services():
    services = BankService.query.all()
    return jsonify([s.to_dict() for s in services]), 200

# ==========================
# React App (serve build)
# ==========================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ==========================
# Contact Us Messages
# ==========================

@app.route('/api/contact', methods=['POST'])
def create_contact_message():
    """
    Public endpoint for website visitors to send messages.
    Saves to DB, captures IP/User-Agent, and emails admin.
    """
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    phone = data.get('phone', '')
    subject = data.get('subject', 'General Inquiry')

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required.'}), 400

    ip_address = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')

    try:
        # Save message
        contact = ContactMessage(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(contact)
        db.session.commit()

        # Send email to admin
        try:
            msg = Message(
                subject=f"New Contact Message from {name}",
                recipients=[ADMIN_EMAIL],
                body=(
                    f"You have received a new contact message:\n\n"
                    f"Name: {name}\n"
                    f"Email: {email}\n"
                    f"Phone: {phone}\n"
                    f"Subject: {subject}\n"
                    f"Message:\n{message}\n\n"
                    f"IP: {ip_address}\nUser-Agent: {user_agent}\n"
                    f"— CoNetX Notification"
                )
            )
            mail.send(msg)

            # Send acknowledgment email to user
            ack = Message(
                subject="We have received your message - CoNetX",
                recipients=[email],
                body=(
                    f"Hello {name},\n\n"
                    "Thank you for contacting CoNetX. We have received your message:\n"
                    f"\"{message[:200]}...\"\n\n"
                    "Our team will reach out soon.\n\n"
                    "Best regards,\n"
                    "CoNetX Team"
                )
            )
            mail.send(ack)

        except Exception as e:
            app.logger.error(f"Email sending failed: {e}")

        return jsonify({'message': 'Message received successfully!'}), 201

    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error saving contact message")
        return jsonify({'error': 'Failed to save message', 'details': str(e)}), 500


@app.route('/api/contact', methods=['GET'])
@role_required('admin', 'manager')
def list_contact_messages(current_user):
    """
    Admin/Manager endpoint to view all contact messages.
    Supports pagination, sorting, and search.
    """
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'created_at_desc')

    query = ContactMessage.query

    if search:
        query = query.filter(
            (ContactMessage.name.ilike(f'%{search}%')) |
            (ContactMessage.email.ilike(f'%{search}%')) |
            (ContactMessage.phone.ilike(f'%{search}%')) |
            (ContactMessage.subject.ilike(f'%{search}%')) |
            (ContactMessage.message.ilike(f'%{search}%'))
        )

    if sort == 'created_at_asc':
        query = query.order_by(ContactMessage.created_at.asc())
    else:
        query = query.order_by(ContactMessage.created_at.desc())

    messages, total = paginate_query(query, page, limit)
    return jsonify({
        'data': [m.to_dict() for m in messages],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200


@app.route('/api/contact/<int:message_id>/status', methods=['PUT'])
@role_required('admin', 'manager')
def update_contact_status(current_user, message_id):
    """
    Mark message as Read or Unread
    """
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ['Read', 'Unread']:
        return jsonify({'error': 'Status must be either Read or Unread'}), 400

    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    message.status = status
    db.session.commit()
    return jsonify({'message': f'Status updated to {status}', 'data': message.to_dict()}), 200


@app.route('/api/contact/<int:message_id>', methods=['DELETE'])
@role_required('admin')
def delete_contact_message(current_user, message_id):
    """
    Admin-only: delete contact messages
    """
    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    db.session.delete(message)
    db.session.commit()
    return jsonify({'message': 'Message deleted successfully'}), 200

# ------------------------------
# ✅ Forgot Password Endpoint
# ------------------------------
@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email.strip()).first()
    if not user:
        return jsonify({'error': 'No account found with that email'}), 404

    token = pyjwt.encode(
        {
            "email": email.strip(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        },
        str(app.config['SECRET_KEY']),
        algorithm='HS256'
    )

    # Dynamically get frontend base URL from current request
    frontend_base_url = request.host_url.rstrip('/')  # removes trailing slash
    reset_link = f"{frontend_base_url}/reset-password/{token}"
    send_email(
        to_email=email,
        subject="Password Reset Request",
        body=f"Click the link below to reset your password:\n\n{reset_link}\n\nThis link will expire in 1 hour.",
    )

    return jsonify({'message': 'Password reset link sent to your email.'}), 200


# ------------------------------
# ✅ Reset Password Endpoint (with token)
# ------------------------------
@app.route('/api/auth/reset-password/<token>', methods=['POST'])
def reset_password_with_token(token):
    try:
        data = request.get_json()
        password = data.get('password')

        if not password:
            return jsonify({'error': 'Password is required'}), 400

        decoded = pyjwt.decode(token, str(app.config['SECRET_KEY']), algorithms=['HS256'])
        email = decoded.get('email')

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.set_password(password)
        db.session.commit()

        return jsonify({'message': 'Password reset successful'}), 200

    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 400
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 400


    return jsonify({'message': 'Password reset link sent to your email'}), 200


def generate_reset_token(email):
    payload = {'email': email, 'exp': datetime.utcnow() + timedelta(minutes=15)}
    return pyjwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def verify_reset_token(token):
    try:
        decoded = pyjwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded.get('email')
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None

# ==========================
# Run Server
# ==========================
if __name__ == '__main__':
    print("="*60)
    print("CoNetX - BACKEND SERVER")
    print("="*60)
    print("Server starting at: http://localhost:5000")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)
