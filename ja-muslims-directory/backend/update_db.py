from sqlalchemy import text
from app.db.base import engine, Base
from app.models import Business  # Import to ensure table is created

# Create all tables
Base.metadata.create_all(bind=engine)

# Add salary_period column to members table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE members ADD COLUMN salary_period VARCHAR"))
        conn.commit()
        print("Successfully added salary_period column to members table")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("salary_period column already exists")
        else:
            print(f"Error adding column: {e}")

print("Database update complete!")