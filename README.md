# Task Manager

A command-line task manager built to practice Python fundamentals. Supports creating, editing, completing, and organizing tasks with optional descriptions and due dates.

## Project Evolution

This is **v1** of my progressive Python learning series. Each version builds on the previous one with increased complexity:

- **v2:** *(coming soon)*

## Features

- **Add tasks** with optional descriptions and due dates
- **Edit tasks** - modify name, description, or due date
- **Mark tasks as complete**
- **Delete tasks**
- **View tasks** - see all tasks, individual tasks, or filter by date (today/overdue/future)
- **Persistent storage** - tasks are saved to JSON file between sessions

## What I Learned

This project helped me practice:
- Python classes and object-oriented programming
- File I/O with JSON
- Data structures (lists and dictionaries for efficient lookup)
- Date/time handling with `datetime`
- User input validation
- Error handling 
- Unit testing with pytest

## Project Structure

```
task-manager/
├── main.py              # Main program loop and user interface
├── task_manager.py      # TaskManager class - manages all tasks
├── task.py              # Task class - individual task model
├── db.py                # Database functions (JSON read/write)
├── date.py              # Date validation and utilities
├── test_task.py         # Unit tests for Task class
├── test_task_manager.py # Unit tests for TaskManager class
└── user_tasks.json      # Stored tasks (auto-generated)
```

## Design Decisions

- **Dual storage with list + dictionary:** List maintains task order while dictionary enables O(1) lookup by task name
- **Date objects vs strings:** Dates are stored as datetime objects internally for comparison, converted to ISO format for JSON serialization
- **Separate concerns:** Split into multiple files (Task model, TaskManager logic, database operations, date utilities) for better organization
