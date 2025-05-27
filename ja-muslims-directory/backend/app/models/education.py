from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class EducationType(enum.Enum):
    # Formal Education
    HIGH_SCHOOL = "high_school"
    DIPLOMA = "diploma"
    ASSOCIATE = "associate"
    BACHELORS = "bachelors"
    MASTERS = "masters"
    PHD = "phd"
    PROFESSIONAL = "professional"  # Professional certifications
    VOCATIONAL = "vocational"      # Trade/vocational training
    
    # Islamic Education
    HIFZ = "hifz"                   # Quran memorization
    AALIM = "aalim"                 # Islamic scholar program
    MUFTI = "mufti"                 # Islamic jurisprudence
    QARI = "qari"                   # Quran recitation
    ARABIC = "arabic"               # Arabic language studies
    ISLAMIC_STUDIES = "islamic_studies"  # General Islamic studies
    SHARIAH = "shariah"             # Islamic law
    HADITH = "hadith"               # Hadith studies
    TAFSEER = "tafseer"             # Quranic exegesis
    FIQH = "fiqh"                   # Islamic jurisprudence
    OTHER_ISLAMIC = "other_islamic"
    OTHER = "other"


class EducationCategory(enum.Enum):
    FORMAL = "formal"
    ISLAMIC = "islamic"


class Education(Base):
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    
    # Education details
    education_type = Column(Enum(EducationType), nullable=False)
    category = Column(Enum(EducationCategory), nullable=False)
    degree_name = Column(String, nullable=False)  # e.g., "Bachelor of Science in Computer Science"
    institution = Column(String, nullable=False)
    location = Column(String)  # City, Country
    
    # Dates
    start_year = Column(Integer)
    end_year = Column(Integer)  # NULL if ongoing
    is_ongoing = Column(Boolean, default=False)
    
    # Additional details
    field_of_study = Column(String)  # Major/specialization
    grade = Column(String)  # GPA, percentage, or grade classification
    achievements = Column(Text)  # Awards, honors, notable achievements
    
    # For Islamic education
    islamic_qualification_details = Column(Text)  # Specific details about Islamic qualifications
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    member = relationship("Member", back_populates="educations")