from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from models import db, User
from datetime import datetime, timedelta
import json

def init_auth_routes(app):

    # 🟢 LOGIN ROUTE
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json(force=True)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return jsonify({'error': 'Username and password required'}), 400

            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                user.last_login = datetime.utcnow()
                db.session.commit()

                access_token = create_access_token(
                    identity=str(user.id),
                    additional_claims={
                        'username': user.username,
                        'role': user.role
                    },
                    expires_delta=timedelta(hours=24)
                )

                return jsonify({
                    'access_token': access_token,
                    'user': user.to_dict(),
                    'username': user.username
                }), 200

            return jsonify({'error': 'Invalid credentials'}), 401

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
                role=role,
                created_at=datetime.utcnow()
            )
            user.set_password(password)
            db.session.add(user)
            db.session.commit()

            return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

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
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            if not user:
                return jsonify({'error': 'User not found'}), 404

            claims = get_jwt()
            return jsonify({'valid': True, 'user': user.to_dict(), 'claims': claims}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500


    # 🟢 LOGOUT
    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_required()
    def logout():
        return jsonify({'message': 'Logged out successfully'}), 200


    # 🟢 PROFILE
    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        try:
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({'user': user.to_dict()}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
