from pydantic import BaseModel
from datetime import datetime

class FaceValidationOut(BaseModel):
    id: str
    user_id: str
    is_validated: bool
    confidence: float
    created_at: datetime

    class Config:
        orm_mode = True
