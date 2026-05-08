# Crescentia

A habit tracking app with AI-powered insights that analyzes your patterns and gives personalized suggestions based on your actual data, not generic advice.

## What It Does

- Track daily habits with completion/skip logging
- When you skip, say why — the app remembers
- AI analyzes your skip patterns, completion rates, and trends
- Get personalized insights grounded in your behavior

## Project Evolution

This is **v2** of my progressive learning series:

| Version | Project                                                 | What I Learned                                             |
| ------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| v1      | [Task Manager](https://github.com/jen444x/task-manager) | Python basics, JSON storage, CLI                           |
| v2      | **Crescentia** (this)                                   | Flask API, React, PostgreSQL, JWT auth, OpenAI integration |
| v3      | _planned_                                               | Django, more ML features                                   |

## Tech Stack

**Backend**

- Python / Flask
- PostgreSQL
- JWT authentication
- OpenAI API (GPT-4o-mini)

**Frontend**

- React + TypeScript
- Vite
- Tailwind CSS

**Deployment**

- Backend: Railway
- Frontend: Vercel

## Features

### Habit Tracking

- Create habits with tiers (difficulty levels)
- Track completions and skips with reasons
- Habit families — upgrade habits over time (e.g., "Walk 10 min" → "Walk 30 min")
- Streak tracking

### Challenges

- Group related habits into challenges
- Track progress across multiple habits

### AI Insights

- Analyzes last 30 days of data
- Identifies struggling habits (low completion rates)
- Finds patterns in skip reasons
- Generates actionable suggestions based on your actual behavior
- Cached for 7 days to minimize API costs

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file)
SECRET_KEY=your-secret-key
DB_NAME=habit_tracker
DB_USER=your-db-user
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your-db-password
OPENAI_API_KEY=your-openai-key

# Initialize database
psql -d habit_tracker -f habit_tracker/schema.sql

# Run server
flask --app habit_tracker run
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable (create .env file)
VITE_API_URL=http://localhost:5000

# Run dev server
npm run dev
```

## API Routes

### Auth

| Route            | Method | Description    |
| ---------------- | ------ | -------------- |
| `/auth/register` | POST   | Create account |
| `/auth/login`    | POST   | Get JWT token  |

### Habits

| Route                   | Method | Description              |
| ----------------------- | ------ | ------------------------ |
| `/habits/`              | GET    | Get all habits           |
| `/habits/`              | POST   | Create habit             |
| `/habits/<id>`          | PUT    | Update habit             |
| `/habits/<id>`          | DELETE | Delete habit             |
| `/habits/<id>/complete` | POST   | Mark complete            |
| `/habits/<id>/skip`     | POST   | Mark skipped with reason |

### Insights

| Route        | Method | Description               |
| ------------ | ------ | ------------------------- |
| `/insights/` | GET    | Get AI-generated insights |

### Challenges

| Route              | Method | Description           |
| ------------------ | ------ | --------------------- |
| `/challenges/`     | GET    | Get all challenges    |
| `/challenges/`     | POST   | Create challenge      |
| `/challenges/<id>` | GET    | Get challenge details |

## Database Schema

- **users** — id, username, password, timezone
- **habits** — id, creator_id, name, tier, stage, family_id, time_of_day
- **habit_logs** — habit_id, log_date, status (completed/skipped), reason
- **challenges** — id, creator_id, name, description

## Running Tests

```bash
pytest
```

## What I'd Do Differently

If starting over, I'd consider:

- Django for built-in admin panel and ORM
- Better state management on frontend (React Query or Zustand)
- More structured skip reason categories for easier analysis
