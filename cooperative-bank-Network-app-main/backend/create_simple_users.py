from app import app, db
from models import User
import bcrypt

def create_users():
    with app.app_context():
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
                print(f"Created user: {user_data['username']}")
        
        db.session.commit()
        print("All users created successfully!")

if __name__ == '__main__':
    create_users()