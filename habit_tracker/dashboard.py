from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
from datetime import date, timedelta


from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')

    db = get_db()

    today = date.today().isoformat()                                                                                  
    habits = db.execute(
        'SELECT h.id, title, body, created, creator_id, username, hl.stat'
        ' FROM habit h ' 
        ' JOIN user u ON h.creator_id = u.id'
        ' LEFT JOIN habit_log hl ON h.id = hl.habitid AND hl.log_date = ?' 
        ' WHERE (hl.stat IS NULL OR hl.stat = 0) AND h.creator_id = ?'
        ' ORDER BY created DESC',
        (today, g.user['id'],)   
    ).fetchall()

    habits_done = db.execute(
        'SELECT h.id, title, body, created, creator_id, username, hl.stat'
        ' FROM habit h ' 
        ' JOIN user u ON h.creator_id = u.id'
        # left join so if doesnt have a log, returns null
        ' LEFT JOIN habit_log hl on h.id = hl.habitid AND hl.log_date = ?' 
        ' WHERE hl.stat = 1 AND h.creator_id = ?'
        ' ORDER BY created DESC',
        (today, g.user['id'],)   
    ).fetchall()

    return render_template('dashboard/index.jinja', habits=habits, habits_done=habits_done)

@bp.route('/logs')
def get_logs():
    db = get_db()

    rows = db.execute("SELECT * FROM habit_log").fetchall()
    logs = [dict(row) for row in rows]

    return logs

@bp.route('/create', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            
            # create habit
            db.execute(
                'INSERT INTO habit (title, body, creator_id)'
                ' VALUES (?, ?, ?)',
                (title, body, g.user['id'])
            )
            db.commit()


            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/create.jinja')

def get_habit(id):
    habit = get_db().execute(
        'SELECT h.id, title, body, created, creator_id, username'
        ' FROM habit h JOIN user u ON h.creator_id = u.id'
        ' WHERE h.id = ?',
        (id,)
    ).fetchone()

    if habit is None:
        abort(404, f"Habit id {id} doesn't exist.")

    if habit['creator_id'] != g.user['id']:
        abort(403)

    return habit

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    habit = get_habit(id)
    print(f"habit: {habit}")

    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE habit SET title = ?, body = ?'
                ' WHERE id = ?',
                (title, body, id)
            )
            db.commit()
            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/update.jinja', habit=habit) # Here its passed like a dict reference

@bp.route('/<int:id>/complete', methods=('POST',))
@login_required
def complete(id):
    # make sure it exists
    get_habit(id)

    db=get_db() 
    today = date.today().isoformat() 


    # try create a log for today
    db.execute(
        "INSERT INTO habit_log (log_date, stat, habitid) VALUES (?, ?, ?)",
        (today, True, id)
    )
    db.commit()

    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/undo_complete', methods=('POST',))
@login_required
def undo_complete(id):
    db=get_db() 
    today = date.today().isoformat() 
    # set log to false
    db.execute(
        'DELETE FROM habit_log ' \
        'WHERE habitid = ? AND log_date = ?', 
        (id,today)
    )
    db.commit()
    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_habit(id)
    db = get_db()
    db.execute('DELETE FROM habit WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('dashboard.index'))


# WILL ADD THIS TO A NEW FILE L8R
@bp.route('/track', methods=('POST', 'GET'))
@login_required
def track():
    db = get_db()

    # Define date range
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    # Get user habits
    habits = db.execute(                                                                                          
          'SELECT id, title FROM habit WHERE creator_id = ?',                                                       
          (g.user['id'],)                                                                                           
      ).fetchall()                                                                                                  

    db.commit()
    
    # Generate all logs in the date range
    logs = db.execute(
        'SELECT * ' \
        'FROM habit_log hl ' \
        'JOIN habit h ON hl.habitid = h.id ' \
        'WHERE creator_id = ? AND ' \
        'log_date BETWEEN ? AND ?',
        (g.user['id'], start_date.isoformat(), end_date.isoformat())
    ).fetchall()


    db.commit()

    # Index logs by (habit_id, date) for fast lookup                                                           
    logs_by_key = {(row['habitid'], row['log_date']): row['stat'] for row in logs}  

    # Generate all dates                                                                                       
    all_dates = []                                                                                                
    current = start_date     
                                                                                 
    while current <= end_date:                                                                               
        all_dates.append(current)                                                                                 
        current += timedelta(days=1) 

    # Build the full grid (habit × date)                                                                       
    habit_data = []                                                                                               
    for habit in habits:                                                                                          
        days = []                                                                                                 
        for d in all_dates:                                                                                       
            stat = logs_by_key.get((habit['id'], d))  # None if missing                        
            days.append({'date': d, 'stat': stat})                                                                
        habit_data.append({'habit': habit, 'days': days})    
    return render_template('dashboard/track.jinja', habit_data=habit_data, dates=all_dates)

