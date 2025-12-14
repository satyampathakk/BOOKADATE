from sqlalchemy import Column, String, Boolean, Float, DateTime
from datetime import datetime
from database import Base

class FaceValidation(Base):
    __tablename__ = "face_validation"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    is_validated = Column(Boolean, default=False)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
