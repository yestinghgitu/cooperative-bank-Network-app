from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from models import db, User, LoanApplication, BankService, Transaction
from auth import init_auth_routes
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"], supports_credentials=True)

# Configuration
#app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///instance/database.db')
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "database.db")
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

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
@app.route('/v1/api/loans/applications', methods=['GET'])
def get_loan_applications():
    try:
        search_query = request.args.get('search', '')
        print("-----get_loan_applications called-----")

        if search_query and search_query.lower() != 'all':
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
@app.route('/api/loans/applications', methods=['GET'])
def get_loan_applications_new():
    try:
        # Query parameters
        search_query = request.args.get('search', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort = request.args.get('sort', 'latest')  # 'latest', 'oldest', or 'none'

        # Base query
        query = LoanApplication.query

        #  Search filters
        if search_query and search_query.lower() != 'all':
            search_filter = (
                (LoanApplication.first_name.ilike(f"%{search_query}%")) |
                (LoanApplication.last_name.ilike(f"%{search_query}%")) |
                (LoanApplication.aadhar_number.ilike(f"%{search_query}%")) |
                (LoanApplication.voter_id.ilike(f"%{search_query}%")) |
                (LoanApplication.mobile_number.ilike(f"%{search_query}%")) |
                (LoanApplication.loan_type.ilike(f"%{search_query}%")) |
                (LoanApplication.society_name.ilike(f"%{search_query}%"))
            )
            query = query.filter(search_filter)

        # Sorting
        if sort == 'oldest':
            query = query.order_by(LoanApplication.created_at.asc())
        elif sort == 'latest':
            query = query.order_by(LoanApplication.created_at.desc())

        # Pagination
        total = query.count()
        applications = query.offset((page - 1) * limit).limit(limit).all()

        # Format response
        applications_list = [
            {
                'id': app.id,
                'application_id': app.application_id,
                'first_name': app.first_name,
                'last_name': app.last_name,
                'aadhar_number': app.aadhar_number,
                'society_name': app.society_name,
                'loan_type': app.loan_type,
                'loan_amount': app.loan_amount,
                'status': app.status,
                'voter_id': app.voter_id,
                'remarks': app.remarks,
                'created_at': app.created_at.isoformat() if app.created_at else None,
                'created_by': app.created_by,
                'modified_at': app.updated_at.isoformat() if app.updated_at else None,
                'modified_by': app.modified_by,
            }
            for app in applications
        ]

        # Pagination metadata
        response = {
            'applications': applications_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }

        return jsonify(response), 200

    except Exception as e:
        print("Error in get_loan_applications_new:", e)
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
            print(result)
        return jsonify({'applications': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Private loan application search endpoint (with authentication)
@app.route('/api/private/loans/applications', methods=['GET'])
@jwt_required()
def get_private_loan_applications():
    print("In get_private_loan_applications")
    try:
        # Get search parameters
        aadhar_number = request.args.get('aadharNumber', '')
        mobile_number = request.args.get('mobileNumber', '')
        first_name = request.args.get('firstName') or request.args.get('first_name', '')
        last_name = request.args.get('lastName') or request.args.get('last_name', '')

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
                'mother_name': app.mother_name,
                'father_name': app.father_name,
                'gender': app.gender,
                'date_of_birth': app.date_of_birth.isoformat() if app.date_of_birth else None,
                'aadhar_number': app.aadhar_number,
                'pan_number': app.pan_number,
                'mobile_number': app.mobile_number,
                'email': app.email,
                'address': app.address,
                'city': app.city,
                'state': app.state,
                'pincode': app.pincode,
                'photo_url': app.photo_url,
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

@app.route('/api/debug/add-sample-loans', methods=['POST'])
def add_sample_loans():
    """Add sample loan applications for testing with updated schema"""
    try:
        sample_applications = [
            {
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'aadhar_number': '123456789012',
                'mobile_number': '9876543210',
                'loan_type': 'Personal',
                'loan_amount': 50000,
                'status': 'Pending',
                'society_name': 'Shivaji Cooperative Society',
                'voter_id': 'DLX1234567',
                'remarks': 'First time applicant',
                'created_by': 'Admin',
                'modified_by': 'Admin'
            },
            {
                'first_name': 'Priya',
                'last_name': 'Patel',
                'aadhar_number': '987654321098',
                'mobile_number': '9123456780',
                'loan_type': 'Home',
                'loan_amount': 2500000,
                'status': 'Approved',
                'society_name': 'Green Meadows Society',
                'voter_id': 'GJY7654321',
                'remarks': 'High credit score',
                'created_by': 'Admin',
                'modified_by': 'Admin'
            },
            {
                'first_name': 'Amit',
                'last_name': 'Verma',
                'aadhar_number': '456789012345',
                'mobile_number': '9988776655',
                'loan_type': 'Vehicle',
                'loan_amount': 800000,
                'status': 'Rejected',
                'society_name': 'Omkar Housing Society',
                'voter_id': 'UPZ9876543',
                'remarks': 'Low income to loan ratio',
                'created_by': 'Admin',
                'modified_by': 'Admin'
            }
        ]

        for app_data in sample_applications:
            # Avoid duplicates by Aadhaar
            existing = LoanApplication.query.filter_by(aadhar_number=app_data['aadhar_number']).first()
            if existing:
                continue

            # Generate application ID
            last_app = LoanApplication.query.order_by(LoanApplication.id.desc()).first()
            new_id = 1 if not last_app else last_app.id + 1
            application_id = f"LOAN{new_id:04d}"

            application = LoanApplication(
                application_id=application_id,
                first_name=app_data['first_name'],
                last_name=app_data['last_name'],
                aadhar_number=app_data['aadhar_number'],
                mobile_number=app_data['mobile_number'],
                loan_type=app_data['loan_type'],
                loan_amount=app_data['loan_amount'],
                status=app_data['status'],
                society_name=app_data.get('society_name', ''),
                voter_id=app_data.get('voter_id', ''),
                remarks=app_data.get('remarks', ''),
                gender='Male',
                date_of_birth=datetime(1990, 1, 1).date(),
                city='Mumbai',
                state='Maharashtra',
                pincode='400001',
                address='123 Test Street',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                created_by=app_data.get('created_by', 'System'),
                modified_by=app_data.get('modified_by', 'System')
            )

            db.session.add(application)

        db.session.commit()
        return jsonify({'message': 'Sample loans added successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print("Error in add_sample_loans:", e)
        return jsonify({'error': str(e)}), 500


# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')



# ===============================================
# Update Loan Application (Edit limited fields)
# ===============================================
@app.route('/api/loans/applications/<int:id>', methods=['PUT'])
def update_loan_application(id):
    try:
        data = request.get_json()
        print(f" Received update request for application ID {id}: {data}")

        # Fetch application
        application = LoanApplication.query.get(id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        # Editable fields only
        editable_fields = [
            'aadhar_number',
            'first_name',
            'last_name',
            'loan_amount',
            'status',
            'remarks'
        ]

        # Track which fields changed
        for field in editable_fields:
            if field in data:
                old_value = getattr(application, field)
                new_value = data[field]
                if old_value != new_value:
                    print(f" Updating {field}: {old_value} → {new_value}")
                    setattr(application, field, new_value)

        # Update timestamps
        application.updated_at = datetime.utcnow()

        # Commit changes
        db.session.commit()
        db.session.refresh(application)

        #  Prepare updated record for frontend
        updated_data = {
            'id': application.id,
            'application_id': application.application_id,
            'first_name': application.first_name,
            'last_name': application.last_name,
            'aadhar_number': application.aadhar_number,
            'loan_amount': application.loan_amount,
            'status': application.status,
            'remarks': application.remarks,
            'updated_at': application.updated_at.isoformat() if application.updated_at else None
        }

        print(" Application updated successfully:", updated_data)

        response = jsonify({
            'message': 'Application updated successfully',
            'updated_application': updated_data
        })
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return response, 200

    except Exception as e:
        db.session.rollback()
        print(" Error updating application:", e)
        return jsonify({'error': str(e)}), 500


# ===============================================
# Delete Loan Application
# ===============================================
@app.route('/api/loans/applications/<int:id>', methods=['DELETE'])
def delete_loan_application(id):
    try:
        application = LoanApplication.query.get(id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        db.session.delete(application)
        db.session.commit()
        return jsonify({'message': 'Application deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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
