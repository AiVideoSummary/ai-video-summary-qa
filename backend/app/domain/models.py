from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean,JSON
from app.infrastructure.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    university_id = Column(Integer, ForeignKey("universities.university_id"))
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    class_year = Column(Integer)
    profile_photo_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class University(Base):
    __tablename__ = "universities"
    university_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class Department(Base):
    __tablename__ = "departments"
    department_id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.university_id"))
    name = Column(String, nullable=False)

class Course(Base):
    __tablename__ = "courses"
    course_id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.user_id"))
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    thumbnail_url = Column(Text)
    is_public = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    enrollment_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Video(Base):
    __tablename__ = "videos"
    video_id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=True) # Şimdilik nullable yaptık
    title = Column(String, nullable=False)
    youtube_url = Column(Text, nullable=False)
    transcript = Column(Text, nullable=True)  # BU SATIRI EKLEDİK
    summary = Column(Text, nullable=True)

    key_points = Column(Text, nullable=True) # Madde madde önemli noktalar
    timestamps = Column(JSON, nullable=True) # [{"time": "02:30", "label": "Giriş"}] gibi...

    duration_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=True)
    processed_by_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class Category(Base):
    __tablename__ = "categories"
    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)