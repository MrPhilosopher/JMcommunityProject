from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base, engine
from app.models import User

def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)
    
    user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

if __name__ == "__main__":
    from app.db.base import SessionLocal
    db = SessionLocal()
    init_db(db)
    print("Database initialized!")