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

# ==========================
# Initialization
# ==========================
load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://65.2.63.253:5173",
    "https://cooperativebanknetwork.com",
    "https://www.cooperativebanknetwork.com"
], supports_credentials=True)

# ==========================
# Configuration
# ==========================
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "database.db")
os.makedirs(os.path.dirname(db_path), exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'vaibhavanidhi-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'  # Admin email
app.config['MAIL_PASSWORD'] = 'your_app_password'     # Use App Password, not your login
app.config['MAIL_DEFAULT_SENDER'] = ('Cooperative Bank Network', 'your_email@gmail.com')

mail = Mail(app)


# ==========================
# Initialize extensions
# ==========================
jwt = JWTManager(app)
db.init_app(app)
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
    db.create_all()

    # create sample bank & branch
    bank = CooperativeBank.query.filter_by(bank_name='Sample Cooperative Bank').first()
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

    branch = CooperativeBranch.query.filter_by(branch_name='Main Branch', bank_id=bank.id).first()
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

    # Default superadmin
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            full_name='Administrator',
            email='admin@bank.com',
            role='admin',
            bank_id=bank.id,
            branch_id=branch.id,
            created_by='system'
        )
        admin.set_password('Admin@123')
        db.session.add(admin)
        db.session.commit()
        print("Admin created: username=admin password=Admin@123")
    else:
        print("admin already exists.")

    # Default bank services
    if BankService.query.count() == 0:
        default_services = [
            BankService(service_type='Membership', name='Member Registration',
                        description='Register new members to your cooperative bank network.',
                        processing_time='Immediate',
                        features='Create member profile\nAssign membership ID\nCapture KYC details'),
            BankService(service_type='Loans', name='Loan Repayment & Tracking',
                        description='Monitor Loan repayment and overdue notices for members.',
                        processing_time='Ongoing',
                        features='Track due payments\nSend reminders\nGenerate repayment reports'),
            BankService(service_type='Audit', name='Audit & Compliance',
                        description='Ensure all transactions and loans follow regulations.',
                        processing_time='Ongoing',
                        features='Regular audit reports\nCompliance checks\nTransaction validation')
        ]
        db.session.add_all(default_services)
        db.session.commit()
        print("✅ Default bank services added")


with app.app_context():
    create_tables_and_data()

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
        user_loans = LoanApplication.query.filter_by(id=current_user.id).count()
        user_pending = LoanApplication.query.filter_by(id=current_user.id).filter(LoanApplication.status != 'Running').count()

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
        'data': [u.to_dict() for u in users],
        'page': page,
        'limit': limit,
        'total': total,
        'pages': ceil(total / limit)
    }), 200


@app.route('/api/admin/users', methods=['POST'])
@role_required('admin', 'manager')
def create_user(current_user):
    data = request.get_json() or {}
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    bank_id = data.get('bank_id')
    branch_id = data.get('branch_id')
    role = data.get('role', 'user')

    # Manager cannot create admin users, and manager's bank/branch enforced
    if current_user.role == 'manager':
        if role == 'admin':
            return jsonify({'error': 'Managers cannot create admin users'}), 403
        bank_id = current_user.bank_id
        branch_id = current_user.branch_id

    # Admin can set bank/branch freely (superadmin)
    user = User(
        username=data['username'],
        full_name=data.get('full_name', ''),
        email=data.get('email', ''),
        role=role,
        bank_id=bank_id,
        branch_id=branch_id,
        created_by=current_user.username
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@role_required('admin', 'manager')
def update_user(current_user, user_id):
    data = request.get_json() or {}
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Managers can only edit users in their branch and cannot assign admin role
    if current_user.role == 'manager':
        if user.branch_id != current_user.branch_id:
            return jsonify({'error': 'Managers can only edit users in their branch'}), 403
        if 'role' in data and data['role'] == 'admin':
            return jsonify({'error': 'Managers cannot assign admin role'}), 403

    # Admin can update everything
    for field in ['full_name', 'email', 'role', 'bank_id', 'branch_id']:
        if field in data:
            setattr(user, field, data[field])
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    user.modified_by = current_user.username
    db.session.commit()
    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}), 200


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@role_required('admin', 'manager')
def delete_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # prevent deleting superadmin by mistake
    if user.role == 'admin' and current_user.role != 'admin':
        return jsonify({'error': 'Only admin can delete admin users'}), 403

    if current_user.role == 'manager':
        if user.branch_id != current_user.branch_id:
            return jsonify({'error': 'Managers can only delete users in their branch'}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200


@app.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@role_required('admin', 'manager')
def reset_password(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    new_password = request.json.get('password')
    if not new_password:
        return jsonify({'error': 'Password required'}), 400

    if current_user.role == 'manager' and user.branch_id != current_user.branch_id:
        return jsonify({'error': 'Managers can only reset passwords for users in their branch'}), 403

    user.set_password(new_password)
    user.modified_by = current_user.username
    db.session.commit()
    return jsonify({'message': f'Password for {user.username} reset successfully'}), 200

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
        result = []
        for app_obj in applications:
            result.append({
                "id": app_obj.id,
                "application_id": app_obj.application_id,
                "first_name": app_obj.first_name,
                "last_name": app_obj.last_name,
                "mother_name": app_obj.mother_name,
                "father_name": app_obj.father_name,
                "gender": app_obj.gender,
                "date_of_birth": app_obj.date_of_birth.isoformat() if app_obj.date_of_birth else None,
                "aadhar_number": app_obj.aadhar_number,
                "pan_number": app_obj.pan_number,
                "mobile_number": app_obj.mobile_number,
                "email": app_obj.email,
                "address": app_obj.address,
                "city": app_obj.city,
                "state": app_obj.state,
                "pincode": app_obj.pincode,
                "photo_url": app_obj.photo_url,
                "loan_type": app_obj.loan_type,
                "loan_amount": app_obj.loan_amount,
                "status": app_obj.status,
                "society_name": app_obj.society_name or (app_obj.bank.bank_name if app_obj.bank else None),
                "branch_name": app_obj.branch_name or (app_obj.branch.branch_name if app_obj.branch else None),
                "created_at": app_obj.created_at.isoformat() if app_obj.created_at else None
            })

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
    last_app = LoanApplication.query.order_by(LoanApplication.id.desc()).first()
    new_id = 1 if not last_app else last_app.id + 1
    application_id = f"LOAN{new_id:04d}"

    try:
        dob = format_date_for_backend(data.get('date_of_birth')) if data.get('date_of_birth') else None
    except Exception as e:
        return jsonify({'error': 'Invalid date_of_birth format'}), 400

    bank_id = data.get('bank_id')
    branch_id = data.get('branch_id')

    # enforce branch/bank for manager and user as per rules:
    if current_user.role == 'manager':
        bank_id = current_user.bank_id
        branch_id = current_user.branch_id
    elif current_user.role == 'user':
        # user must create loan under their own branch; fallback to provided or user's
        bank_id = current_user.bank_id
        branch_id = current_user.branch_id

    try:
        application = LoanApplication(
            application_id=application_id,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            mother_name=data.get('mother_name', ''),
            father_name=data.get('father_name', ''),
            gender=data.get('gender', 'Not Specified'),
            date_of_birth=dob,
            aadhar_number=data.get('aadhar_number'),
            pan_number=data.get('pan_number', ''),
            mobile_number=data.get('mobile_number', ''),
            email=data.get('email', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            photo_url=data.get('photo_url', ''),
            loan_type=data.get('loan_type', 'Personal'),
            loan_amount=float(data.get('loan_amount', 0)) if data.get('loan_amount') else 0,
            society_name=data.get('society_name', ''),
            branch_name=data.get('branch_name', ''),
            voter_id=data.get('voter_id', ''),
            status=data.get('status', 'Due'),
            remarks=data.get('remarks'),
            branch_id=branch_id,
            bank_id=bank_id,
            created_by=current_user.username,
            created_by_user_id=current_user.id
        )
        db.session.add(application)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error creating loan application")
        return jsonify({'error': 'Failed to create loan', 'details': str(e)}), 500

    return jsonify({'message': 'Loan created', 'application_id': application_id}), 201


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
        'data': [l.to_dict() for l in loans],
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
    Saves to database and emails admin.
    """
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required.'}), 400

    try:
        # Save message
        contact = ContactMessage(name=name, email=email, message=message)
        db.session.add(contact)
        db.session.commit()

        # Send email notification to admin
        try:
            admin_email = "admin@cooperativebanknetwork.com"
            msg = Message(
                subject=f"New Contact Message from {name}",
                recipients=[admin_email],
                body=(
                    f"You have received a new contact message:\n\n"
                    f"Name: {name}\n"
                    f"Email: {email}\n"
                    f"Message:\n{message}\n\n"
                    f"View all messages in your admin dashboard."
                )
            )
            mail.send(msg)
            # Send acknowledgment to user
            ack = Message(
                subject="Thank you for contacting Cooperative Bank Network",
                recipients=[email],
                body=(
                    f"Dear {name},\n\n"
                    "Thank you for reaching out to the Cooperative Bank Network. "
                    "We have received your message and will get back to you soon.\n\n"
                    "Warm regards,\n"
                    "Cooperative Bank Network Team"
                )
            )
            mail.send(ack)

            app.logger.info(f"Contact email sent to {admin_email}")
        except Exception as e:
            app.logger.error(f"Failed to send contact email: {e}")

        return jsonify({'message': 'Message received successfully.'}), 201

    except Exception as e:
        db.session.rollback()
        app.logger.exception("Error saving contact message")
        return jsonify({'error': 'Failed to save message', 'details': str(e)}), 500


@app.route('/api/contact', methods=['GET'])
@role_required('admin', 'manager')
def list_contact_messages(current_user):
    """
    Admin/Manager endpoint to view all contact messages.
    Supports pagination and search.
    """
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    search = request.args.get('search', '')

    query = ContactMessage.query
    if search:
        query = query.filter(
            (ContactMessage.name.ilike(f'%{search}%')) |
            (ContactMessage.email.ilike(f'%{search}%')) |
            (ContactMessage.message.ilike(f'%{search}%'))
        )

    messages, total = paginate_query(query.order_by(ContactMessage.created_at.desc()), page, limit)
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
    Mark message as Read or Unread (admin or manager only)
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
@role_required('admin',)
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


# ==========================
# Run Server
# ==========================
if __name__ == '__main__':
    print("="*60)
    print("COOPERATIVE BANK NETWORK - BACKEND SERVER")
    print("="*60)
    print("Server starting at: http://localhost:5000")
    print("Demo Login → admin = admin / admin@123")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)
