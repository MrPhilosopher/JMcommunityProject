# JA Muslims Directory - Backend

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env if you want to change default settings
# By default, uses SQLite database (ja_muslims.db)
```

4. Initialize the database:
```bash
python -m app.db.init_db
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Start the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation: http://localhost:8000/docs

## Default Admin Credentials
- Email: admin@jamuslims.com
- Password: changeme