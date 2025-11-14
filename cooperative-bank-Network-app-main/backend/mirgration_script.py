from app import app, db
from models import LoanApplication

def add_password_hash_column():
    with app.app_context():
        # Check if the column already exists
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('loan_applications')]
        
        if 'password_hash' not in columns:
            # Add the column using raw SQL
            db.engine.execute('ALTER TABLE loan_applications ADD COLUMN password_hash VARCHAR(120)')
            print("Added password_hash column to loan_applications table")
        else:
            print("password_hash column already exists")

if __name__ == '__main__':
    add_password_hash_column()