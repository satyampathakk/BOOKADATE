from pydantic import BaseModel

class PreferencesSchema(BaseModel):
    min_age: int
    max_age: int
    distance_km: int
    preferred_gender: str
