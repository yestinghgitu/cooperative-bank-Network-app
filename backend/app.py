from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from models import db, User, LoanApplication, BankService, Transaction
from auth import init_auth_routes
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///instance/database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'vaibhavanidhi-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Initialize extensions
jwt = JWTManager(app)
db.init_app(app)

# Initialize auth routes
init_auth_routes(app)

# Utility functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def format_date_for_backend(date_string):
    try:
        return datetime.strptime(date_string, '%Y-%m-%d')
    except ValueError:
        try:
            return datetime.strptime(date_string, '%d-%m-%Y')
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY')

def create_tables_and_data():
    """Create database tables and initial data"""
    try:
        # Create directories
        os.makedirs('instance', exist_ok=True)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Create all tables
        db.create_all()
        print("Database tables created successfully")
        
        # Create admin user if it doesn't exist
        try:
            existing_admin = User.query.filter_by(username='3921').first()
            if not existing_admin:
                admin = User(
                    username='3921',
                    role='admin',
                    full_name='Admin User',
                    email='admin@bank.com',
                    branch='Head Office'
                )
                admin.set_password('3921')
                db.session.add(admin)
                db.session.commit()
                print("Default admin user (3921/3921) created successfully")
            else:
                print("Admin user already exists")
                
        except Exception as e:
            print(f"Note: {e}")
            print("If you see schema errors, delete the database file and restart")
            db.session.rollback()
            
        # Create default services if they don't exist
        try:
            existing_services = BankService.query.count()
            if existing_services == 0:
                default_services = [
                    BankService(
                        service_type='Loans',
                        name='Personal Loan',
                        description='Quick and easy personal loans for your immediate needs',
                        interest_rate_min=8.5,
                        interest_rate_max=15.0,
                        processing_time='2-3 business days',
                        features='No collateral required\nFlexible repayment terms\nQuick approval process'
                    ),
                    BankService(
                        service_type='Loans',
                        name='Home Loan',
                        description='Affordable home loans with competitive interest rates',
                        interest_rate_min=6.5,
                        interest_rate_max=9.0,
                        processing_time='7-10 business days',
                        features='Up to 80% of property value\n30 year repayment tenure\nNo prepayment charges'
                    ),
                    BankService(
                        service_type='Loans',
                        name='Vehicle Loan',
                        description='Finance your dream car or bike with our vehicle loans',
                        interest_rate_min=7.0,
                        interest_rate_max=12.0,
                        processing_time='3-5 business days',
                        features='Up to 100% financing\nCompetitive interest rates\nQuick processing'
                    ),
                    BankService(
                        service_type='Education',
                        name='Education Loan',
                        description='Invest in your future with our education loan schemes',
                        interest_rate_min=6.0,
                        interest_rate_max=10.0,
                        processing_time='5-7 business days',
                        features='Cover full course fees\nNo collateral for loans up to 10L\nFlexible repayment options'
                    )
                ]
                
                for service in default_services:
                    db.session.add(service)
                db.session.commit()
                print("Default bank services created successfully")
        except Exception as e:
            print(f"Error creating default services: {e}")
            db.session.rollback()
            
    except Exception as e:
        print(f"Database initialization error: {e}")

# Initialize database within app context
with app.app_context():
    create_tables_and_data()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Server is running'}), 200

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        total_loans = LoanApplication.query.count()
        pending_applications = LoanApplication.query.filter_by(status='Pending').count()
        
        return jsonify({
            'total_loans': total_loans,
            'active_accounts': 5892,
            'total_deposits': 45.2,
            'pending_applications': pending_applications
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Loan application endpoints
@app.route('/api/loans/applications', methods=['GET'])
def get_loan_applications():
    try:
        search_query = request.args.get('search', '')
        
        if search_query:
            applications = LoanApplication.query.filter(
                (LoanApplication.first_name.ilike(f'%{search_query}%')) |
                (LoanApplication.last_name.ilike(f'%{search_query}%')) |
                (LoanApplication.aadhar_number.ilike(f'%{search_query}%')) |
                (LoanApplication.mobile_number.ilike(f'%{search_query}%')) |
                (LoanApplication.loan_type.ilike(f'%{search_query}%'))
            ).all()
        else:
            applications = []
            
        applications_list = []
        for app in applications:
            applications_list.append({
                'id': app.id,
                'application_id': app.application_id,
                'first_name': app.first_name,
                'last_name': app.last_name,
                'mobile_number': app.mobile_number,
                'email': app.email,
                'city': app.city,
                'loan_type': app.loan_type,
                'loan_amount': app.loan_amount,
                'status': app.status,
                'created_at': app.created_at.isoformat() if app.created_at else None
            })
            
        return jsonify({
            'applications': applications_list,
            'total': len(applications_list)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/applications', methods=['POST'])
@jwt_required()
def create_loan_application():
    try:
        data = request.get_json()
        
        # Generate application ID
        last_app = LoanApplication.query.order_by(LoanApplication.id.desc()).first()
        new_id = 1 if not last_app else last_app.id + 1
        application_id = f"LOAN{new_id:04d}"
        
        # Handle date formatting
        dob = format_date_for_backend(data['date_of_birth'])
        
        application = LoanApplication(
            application_id=application_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            mother_name=data.get('mother_name', ''),
            father_name=data.get('father_name', ''),
            gender=data['gender'],
            date_of_birth=dob,
            aadhar_number=data['aadhar_number'],
            pan_number=data.get('pan_number', ''),
            mobile_number=data.get('mobile_number', ''),
            email=data.get('email', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            photo_url=data.get('photo_url', ''),
            loan_type=data.get('loan_type', 'Personal'),
            loan_amount=float(data.get('loan_amount', 0)),
            status='Pending'
        )
        
        # Set password if provided
        if 'password' in data and data['password']:
            application.set_password(data['password'])
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'message': 'Loan application created successfully',
            'application_id': application_id,
            'data': {'application_id': application_id}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Public loan application search endpoint (no authentication required)
@app.route('/api/public/loans/applications', methods=['GET'])
def get_public_loan_applications():
    try:
        # Get search parameters
        aadhar_number = request.args.get('aadharNumber', '')
        mobile_number = request.args.get('mobileNumber', '')
        first_name = request.args.get('firstName', '')
        last_name = request.args.get('lastName', '')
        
        # Build query
        query = LoanApplication.query
        
        if aadhar_number:
            query = query.filter(LoanApplication.aadhar_number == aadhar_number)
        if mobile_number:
            query = query.filter(LoanApplication.mobile_number == mobile_number)
        if first_name:
            query = query.filter(LoanApplication.first_name.ilike(f'%{first_name}%'))
        if last_name:
            query = query.filter(LoanApplication.last_name.ilike(f'%{last_name}%'))
        
        applications = query.all()
        
        result = []
        for app in applications:
            result.append({
                'id': app.id,
                'application_id': app.application_id,
                'first_name': app.first_name,
                'last_name': app.last_name,
                'mobile_number': app.mobile_number,
                'loan_type': app.loan_type,
                'loan_amount': app.loan_amount,
                'status': app.status,
                'created_at': app.created_at.isoformat() if app.created_at else None
            })
        
        return jsonify({'applications': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Photo upload endpoint
@app.route('/api/upload/photo', methods=['POST'])
@jwt_required()
def upload_photo():
    try:
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
            photo_url = f"http://localhost:5000/uploads/{unique_filename}"
            
            return jsonify({
                'message': 'File uploaded successfully',
                'photo_url': photo_url,
                'data': {'photo_url': photo_url}
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Bank services endpoints
@app.route('/api/services', methods=['GET'])
def get_bank_services():
    try:
        services = BankService.query.all()
        
        services_list = []
        for service in services:
            services_list.append({
                'id': service.id,
                'service_type': service.service_type,
                'name': service.name,
                'description': service.description,
                'interest_rate_min': service.interest_rate_min,
                'interest_rate_max': service.interest_rate_max,
                'processing_time': service.processing_time,
                'features': service.features
            })
            
        return jsonify(services_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Debug endpoints
@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    try:
        users = User.query.all()
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'full_name': getattr(user, 'full_name', 'N/A'),
                'email': getattr(user, 'email', 'N/A'),
                'branch': getattr(user, 'branch', 'N/A'),
                'role': user.role
            })
        return jsonify(users_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/reset-db', methods=['POST'])
def reset_database():
    """Reset database - use only in development"""
    try:
        db.drop_all()
        db.create_all()
        
        # Recreate admin user
        admin = User(
            username='3921',
            role='admin',
            full_name='Admin User',
            email='admin@bank.com',
            branch='Head Office'
        )
        admin.set_password('3921')
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({'message': 'Database reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("=" * 60)
    print("COOPERATIVE BANK NETWORK - BACKEND SERVER")
    print("=" * 60)
    print("Server starting at: http://localhost:5000")
    print("Demo Login Credentials:")
    print("   Username: 3921")
    print("   Password: 3921")
    print()
    print("If you see database schema errors:")
    print("   1. Stop the server (Ctrl+C)")
    print("   2. Delete: instance/database.db")
    print("   3. Restart: python app.py")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)