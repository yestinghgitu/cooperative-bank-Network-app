from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime, timedelta
import json

def init_auth_routes(app):

    # 🟢 LOGIN ROUTE
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            # Try to parse JSON safely
            if request.is_json:
                data = request.get_json()
            else:
                # Handle raw JSON string cases
                raw_data = request.data.decode('utf-8')
                data = json.loads(raw_data) if raw_data else {}

            if not isinstance(data, dict):
                return jsonify({'error': 'Invalid request format (expected JSON object)'}), 400

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

        except json.JSONDecodeError:
            return jsonify({'error': 'Malformed JSON in request body'}), 400
        except Exception as e:
            print("🔥 Login error:", e)
            return jsonify({'error': str(e)}), 500


    # 🟢 REGISTER ROUTE
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json(force=True)
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
                'user': user.to_dict()
            }), 201

        except json.JSONDecodeError:
            return jsonify({'error': 'Malformed JSON in request body'}), 400
        except Exception as e:
            print("🔥 Register error:", e)
            return jsonify({'error': str(e)}), 500


    # 🟢 VERIFY TOKEN
    @app.route('/api/auth/verify', methods=['GET'])
    @jwt_required()
    def verify_token():
        try:
            current_user = get_jwt_identity()
            user = User.query.get(current_user['id'])

            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({'valid': True, 'user': user.to_dict()}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500


    # 🟢 LOGOUT
    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_required()
    def logout():
        # JWT logout is handled client-side by deleting the token
        return jsonify({'message': 'Logged out successfully'}), 200


    # 🟢 PROFILE
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
