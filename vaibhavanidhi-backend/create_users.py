# create_users.py
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

# Define User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

def create_users():
    with app.app_context():
        # Create all tables first
        db.create_all()
        
        # Create users if they don't exist
        users = [
            {'username': '3921', 'password': '3921', 'role': 'admin'},
            {'username': 'user1', 'password': 'user1', 'role': 'officer'},
            {'username': 'user2', 'password': 'user2', 'role': 'officer'},
            {'username': 'user3', 'password': 'user3', 'role': 'manager'}
        ]
        
        for user_data in users:
            if not User.query.filter_by(username=user_data['username']).first():
                user = User(username=user_data['username'], role=user_data['role'])
                user.set_password(user_data['password'])
                db.session.add(user)
                print("Created user: " + user_data['username'])
        
        db.session.commit()
        print("All users created successfully!")

if __name__ == '__main__':
    create_users()