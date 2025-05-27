from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class MasjidType(enum.Enum):
    MASJID = "masjid"
    MUSALLA = "musalla"


# Association table for many-to-many relationship between Masjid and Members (for Shura members)
masjid_shura_members = Table(
    'masjid_shura_members',
    Base.metadata,
    Column('masjid_id', Integer, ForeignKey('masjids.id', ondelete='CASCADE'), primary_key=True),
    Column('member_id', Integer, ForeignKey('members.id', ondelete='CASCADE'), primary_key=True)
)


class Masjid(Base):
    __tablename__ = "masjids"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(Enum(MasjidType), nullable=False, default=MasjidType.MASJID)
    
    # Address information
    address = Column(Text, nullable=False)
    city = Column(String)
    parish = Column(String, nullable=False)
    postal_code = Column(String)
    
    # Contact information
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    
    # Leadership
    imam_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    imam = relationship("Member", foreign_keys=[imam_id], backref="imam_of_masjid")
    
    # Shura members (many-to-many relationship)
    shura_members = relationship(
        "Member",
        secondary=masjid_shura_members,
        backref="shura_member_of_masjids"
    )
    
    # Additional information
    established_year = Column(Integer)
    capacity = Column(Integer)  # Approximate number of people it can accommodate
    facilities = Column(Text)  # JSON string or formatted text for available facilities
    prayer_times_info = Column(Text)  # Information about prayer times
    jummah_time = Column(String)  # Friday prayer time
    activities = Column(Text)  # Regular activities, classes, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Members affiliated with this masjid (one-to-many relationship)
    affiliated_members = relationship("Member", foreign_keys="Member.masjid_id", back_populates="masjid")