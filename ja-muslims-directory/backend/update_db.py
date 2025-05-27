from sqlalchemy import text
from app.db.base import engine, Base
from app.models import Business, Restaurant, RestaurantMenu, Masjid, Education  # Import to ensure tables are created

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

# Add gender column to members table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE members ADD COLUMN gender VARCHAR NOT NULL DEFAULT 'male'"))
        conn.commit()
        print("Successfully added gender column to members table")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("gender column already exists")
        else:
            print(f"Error adding gender column: {e}")

# Update existing gender values to lowercase  
with engine.connect() as conn:
    try:
        # Update uppercase 'MALE' to lowercase 'male'
        result = conn.execute(text("UPDATE members SET gender = 'male' WHERE gender = 'MALE'"))
        print(f"Updated {result.rowcount} records from 'MALE' to 'male'")
        
        # Update uppercase 'FEMALE' to lowercase 'female'
        result = conn.execute(text("UPDATE members SET gender = 'female' WHERE gender = 'FEMALE'"))
        print(f"Updated {result.rowcount} records from 'FEMALE' to 'female'")
        
        conn.commit()
        print("Successfully updated existing gender values to lowercase")
    except Exception as e:
        print(f"Error updating gender values: {e}")

# Add masjid_id column to members table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE members ADD COLUMN masjid_id INTEGER"))
        conn.commit()
        print("Successfully added masjid_id column to members table")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("masjid_id column already exists")
        else:
            print(f"Error adding masjid_id column: {e}")

print("Database update complete!")