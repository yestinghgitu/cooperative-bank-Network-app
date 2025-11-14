# init_users.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app instance
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///instance/database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Define User model directly in this file to avoid circular imports
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    branch = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'branch': self.branch,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

def init_users():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        users = [
            {
                'username': '3921',
                'password': '3921',
                'full_name': 'Admin User',
                'email': 'admin@bank.com',
                'branch': 'Head Office',
                'role': 'admin'
            },
            {
                'username': 'user1',
                'password': 'user1',
                'full_name': 'John Doe',
                'email': 'john@bank.com',
                'branch': 'Branch A',
                'role': 'officer'
            },
            {
                'username': 'user2',
                'password': 'user2',
                'full_name': 'Jane Smith',
                'email': 'jane@bank.com',
                'branch': 'Branch B',
                'role': 'officer'
            },
            {
                'username': 'user3',
                'password': 'user3',
                'full_name': 'Robert Johnson',
                'email': 'robert@bank.com',
                'branch': 'Branch C',
                'role': 'manager'
            }
        ]
        
        created_count = 0
        for user_data in users:
            if not User.query.filter_by(username=user_data['username']).first():
                user = User(
                    username=user_data['username'],
                    full_name=user_data['full_name'],
                    email=user_data['email'],
                    branch=user_data['branch'],
                    role=user_data['role']
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"Created user: {user_data['username']}")
                created_count += 1
        
        db.session.commit()
        print(f"Successfully created {created_count} users!")

if __name__ == '__main__':
    init_users()