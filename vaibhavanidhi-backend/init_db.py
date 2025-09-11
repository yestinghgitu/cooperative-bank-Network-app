from app import app, db
from models import User, LoanApplication, BankService, Transaction
from datetime import datetime

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create default admin user if not exists
        if not User.query.filter_by(username='3921').first():
            admin = User(username='3921', role='admin')
            admin.set_password('3921')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created!")
        
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_database()