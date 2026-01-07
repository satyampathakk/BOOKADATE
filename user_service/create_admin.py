"""
Create a default admin user
"""
from database import SessionLocal, Base, engine
from models.user import User
from passlib.hash import bcrypt
import uuid

# Create tables if needed
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if admin already exists
admin_email = "admin@bookadate.com"
existing_admin = db.query(User).filter(User.email == admin_email).first()

if existing_admin:
    print(f"Admin user already exists: {admin_email}")
else:
    # Create admin user
    admin_id = str(uuid.uuid4())
    password_hash = bcrypt.hash("admin123")  # Change this password!
    
    admin_user = User(
        id=admin_id,
        name="Admin",
        email=admin_email,
        phone="0000000000",
        gender="other",
        dob="2000-01-01",
        bio="System Administrator",
        password_hash=password_hash,
        registration_status="approved",  # Auto-approved
        verified=True,
        kyc_level="verified",
    )
    
    db.add(admin_user)
    db.commit()
    
    print(f"✓ Admin user created successfully!")
    print(f"  Email: {admin_email}")
    print(f"  Password: admin123")
    print(f"  User ID: {admin_id}")
    print(f"\n⚠️  IMPORTANT: Change the password after first login!")

db.close()
