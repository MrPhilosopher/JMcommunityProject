# Project JA Muslims Directory

A comprehensive community management system for tracking and analyzing Muslim community member information.

## Features

- **Member Management**: Add, edit, view, and delete community member profiles
- **Detailed Information Tracking**: 
  - Personal details (Muslim name, legal name, DOB, conversion date)
  - Contact information (phone, email, addresses)
  - Family information (parents, spouse)
  - Employment details (workplace, occupation, salary)
  - Life status (active/deceased, burial information)
- **Life Events Tracking**: Record important events like marriages, deaths, conversions, hajj, education milestones
- **Analytics Dashboard**: 
  - Member statistics (total, active, deceased)
  - Age distribution analysis
  - Marital status breakdown
  - Conversion trends
  - Recent events timeline
- **Secure Authentication**: JWT-based admin authentication system
- **Search and Filter**: Find members quickly with search functionality

## Tech Stack

### Backend
- FastAPI (Python)
- SQLite database (no setup required!)
- SQLAlchemy ORM
- Alembic for migrations
- JWT authentication

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- React Query for data fetching
- React Hook Form for forms
- Recharts for data visualization

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Initialize database:
```bash
python -m app.db.init_db
alembic upgrade head
```

6. Start the server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Default Admin Credentials
- Email: admin@jamuslims.com
- Password: changeme

## Usage

1. Access the application at http://localhost:3000
2. Login with admin credentials
3. Start managing community members through the dashboard

## API Documentation

When the backend is running, access the interactive API documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Security Notes

- Change the default admin password immediately
- Update the SECRET_KEY in production
- Use HTTPS in production
- Regularly backup the database