from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

# Enums
UserRole = Literal["admin", "manager", "client"]

# Base schemas
class UserBase(BaseModel):
    phone: str
    full_name: str
    role: UserRole = "client"

class UserCreate(UserBase):
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    phone: str
    password: str

# Response schemas
class User(UserBase):
    id: int
    email: str
    active: bool
    parent_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserWithToken(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"
