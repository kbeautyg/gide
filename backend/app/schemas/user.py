from typing import Optional, List
from pydantic import BaseModel

class UserBase(BaseModel):
    phone: str
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    guide_status: Optional[str] = "none"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    parent_id: Optional[int] = None
    balance_rub: float = 0.0
    balance_usd: float = 0.0
    balance_thb: float = 0.0

    class Config:
        from_attributes = True
