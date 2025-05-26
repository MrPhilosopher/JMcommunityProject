from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "JA Muslims Directory"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./ja_muslims.db"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    REDIS_URL: Optional[str] = None
    
    FIRST_SUPERUSER_EMAIL: str = "admin@jamuslims.com"
    FIRST_SUPERUSER_PASSWORD: str = "changeme"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()