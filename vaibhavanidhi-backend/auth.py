from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime, timedelta

def init_auth_routes(app):
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return jsonify({'error': 'Username and password required'}), 400
            
            user = User.query.filter_by(username=username).first()
            
            if user and user.check_password(password):
                # Update last login time
                user.last_login = datetime.utcnow()
                db.session.commit()
                
                access_token = create_access_token(
                    identity={'id': user.id, 'username': user.username, 'role': user.role},
                    expires_delta=timedelta(hours=24)
                )
                return jsonify({
                    'access_token': access_token,
                    'user': user.to_dict(),
                    'username': user.username  # Frontend expects this
                }), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            full_name = data.get('full_name')
            email = data.get('email')
            branch = data.get('branch')
            role = data.get('role', 'user')
            
            if not username or not password:
                return jsonify({'error': 'Username and password required'}), 400
            
            if User.query.filter_by(username=username).first():
                return jsonify({'error': 'Username already exists'}), 400
            
            if email and User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400
            
            user = User(
                username=username,
                full_name=full_name,
                email=email,
                branch=branch,
                role=role
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            return jsonify({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'email': user.email,
                    'branch': user.branch,
                    'role': user.role
                }
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/verify', methods=['GET'])
    @jwt_required()
    def verify_token():
        try:
            current_user = get_jwt_identity()
            user = User.query.get(current_user['id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            return jsonify({
                'valid': True,
                'user': user.to_dict()
            }), 200
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_required()
    def logout():
        # In JWT, logout is handled client-side by removing the token
        return jsonify({'message': 'Logged out successfully'}), 200

    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        try:
            current_user = get_jwt_identity()
            user = User.query.get(current_user['id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            return jsonify({'user': user.to_dict()}), 200
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500