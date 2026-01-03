# Habit Tracker

A web-based habit tracking application built with Flask that helps users build and maintain habits by tracking daily progress.

## Project Evolution

This is **v2** of my progressive Python learning series:

- **v1:** [Task Manager](https://github.com/jen444x/task-manager) - Python fundamentals and basic CRUD operations
- **v2:** Habit Tracker (this project) - Web app with Flask, authentication, and database
- **v3:** Mood & Habit Correlations _(planned)_ - Mood tracking to analyze how habits affect wellbeing

## Features

- User registration and authentication
- Create, update, and delete habits
- Mark habits as complete with daily logging
- User-specific habit management
- Responsive web interface

## Tech Stack

**Backend**
- Python 3.13
- Flask 3.1.2
- SQLite

**Frontend**
- Jinja2 templating
- Tailwind CSS
- Vanilla JavaScript

## Project Structure

```
habit-tracker/
├── habit_tracker/
│   ├── __init__.py          # Flask app factory
│   ├── auth.py              # Authentication routes
│   ├── dashboard.py         # Habit management routes
│   ├── db.py                # Database connection
│   ├── schema.sql           # Database schema
│   ├── static/              # CSS, JS assets
│   └── templates/           # Jinja2 templates
├── instance/
│   └── flaskr.sqlite        # SQLite database
└── package.json             # Node.js dev dependencies
```

## Setup

### Prerequisites

- Python 3.13+
- Node.js/npm

### Installation

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install Flask python-dotenv
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Initialize the database:
   ```bash
   flask --app habit_tracker init-db
   ```

### Running the App

Start the development server:
```bash
flask --app habit_tracker run
```

For development with live reload:
```bash
npm run dev
```

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/auth/register` | GET, POST | User registration |
| `/auth/login` | GET, POST | User login |
| `/auth/logout` | GET | User logout |
| `/` | GET | Dashboard - view all habits |
| `/create` | GET, POST | Create a new habit |
| `/<id>/update` | GET, POST | Edit a habit |
| `/<id>/complete` | POST | Mark habit complete |
| `/<id>/delete` | POST | Delete a habit |

## Database Schema

- **user** - Stores user accounts (id, username, password)
- **habit** - Stores habits (id, creator_id, created, title, body)
- **habit_log** - Tracks daily habit completion (log_date, stat, habitid)

## Development

Run Tailwind CSS in watch mode:
```bash
npm run tailwind
```

Run tests:
```bash
pytest
```

## Next Steps (v3)

- Mood tracking alongside habits
- Correlation analysis (how habits affect mood)
- More advanced visualizations
- Potential machine learning for pattern recognition
