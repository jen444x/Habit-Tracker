from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from zoneinfo import ZoneInfo                                                   
from datetime import datetime, date, timedelta 

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

def get_user_local_date():                                                      
      tz = ZoneInfo(g.user['timezone'])                                           
      return datetime.now(tz).date()  

def track():
    db = get_db()
    cur = db.cursor()

    # Define date range
    end_date = get_user_local_date()
    start_date = end_date - timedelta(days=6)

    # Get user habits
    cur.execute(                                                                                          
          'SELECT id, title ' \
          'FROM habits ' \
          'WHERE creator_id = %s '
          'ORDER BY display_order DESC',                                                       
          (g.user['id'],)                                                                                           
      )
    habits = cur.fetchall()                                                                                                      
    
    # Generate all logs in the date range
    cur.execute(
        'SELECT * ' \
        'FROM habit_logs hl ' \
        'JOIN habits h'
        ' ON hl.habit_id = h.id ' \
        'WHERE creator_id = %s AND ' \
        'log_date BETWEEN %s AND %s',
        (g.user['id'], start_date.isoformat(), end_date.isoformat())
    )
    logs = cur.fetchall()

    cur.close() 
    
    # Generate all dates                                                                                       
    all_dates = []                                                                                                
    current = start_date     
                                                                                 
    while current <= end_date:                                                                               
        all_dates.append(current)                                                                                 
        current += timedelta(days=1) 

    # Set of habit id and date
    completed_set = set()
    for log in logs:
        completed_set.add((log['habit_id'], log['log_date']))

    # Build the full grid (habit × date)                                                                       
    habit_data = []                                                                                               
    for habit in habits:                                                                                          
        days = []                                                                                                 
        for d in all_dates:       
            # check if theres a log for this habit on this date   
            if (habit['id'], d) in completed_set: 
                completed = True
            else: completed = False

            days.append({'date': d, 'completed': completed})                                            
        habit_data.append({'habit': habit, 'days': days})   
    
    return habit_data, all_dates

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')

    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT list_view' \
        ' FROM users'
        ' WHERE id = %s',
        (g.user['id'],)
    )
    view = cur.fetchone()

    # List view
    if view['list_view']:
        today = get_user_local_date()                                                                               
        cur.execute(
            'SELECT h.id, h.title, h.body'
            ' FROM habits h' 
            ' LEFT JOIN habit_logs hl'
            '   ON h.id = hl.habit_id'
            '   AND hl.log_date = %s' 
            ' WHERE h.creator_id = %s'
            ' AND hl.habit_id IS NULL'
            ' ORDER BY display_order DESC',
            (today, g.user['id'],)
        )

        habits = cur.fetchall()
        today = get_user_local_date()
        cur.execute(
            'SELECT h.id, title, body'
            ' FROM habits h' 
            ' INNER JOIN habit_logs hl'
            '   ON h.id = hl.habit_id'
            '   AND hl.log_date = %s' 
            ' WHERE h.creator_id = %s',
            (today, g.user['id'],)   
        )
        habits_done = cur.fetchall()

        cur.close()

        return render_template('dashboard/index.jinja', habits=habits, habits_done=habits_done, view=view)

    # Grid view        
    habit_data, all_dates = track()

    return render_template('dashboard/index.jinja', habit_data=habit_data, dates=all_dates, view=view)


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
            cur = db.cursor()

            # create habit
            cur.execute(
                'INSERT INTO habits (title, body, creator_id, display_order)'
                ' VALUES (%s, %s, %s, (' \
                'SELECT COALESCE(MAX(display_order), 0) + 1 ' \
                'FROM habits WHERE creator_id = %s))',
                (title, body, g.user['id'], g.user['id'])
            )
            db.commit()
            cur.close()

            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/create.jinja')

def get_habit(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT h.id, title, challenge_id, body, creator_id'
        ' FROM habits h'
        ' JOIN users u'
        ' ON h.creator_id = u.id'
        ' WHERE h.id = %s',
        (id,)
    )
    habit = cur.fetchone()
    cur.close()

    if habit is None:
        abort(404, f"Habit id {id} doesn't exist.")

    if habit['creator_id'] != g.user['id']:
        abort(403)

    return habit

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    habit = get_habit(id)

    # get challenges for drop down
    db = get_db()
    cur = db.cursor()
    print(g.user['id'])
    print(habit['challenge_id'])
    if habit['challenge_id'] is None:                                                                                                         
        cur.execute(                                                                                                                                       
            'SELECT * FROM challenges WHERE creator_id = %s',                                                                                              
            (g.user['id'],)                                                                                                                                
        )                                                                                                                                                  
    else:                                                                                                                                                  
        # Has a challenge - get all EXCEPT the currently assigned one                                                                                      
        cur.execute(                                                                                                                                       
            'SELECT * FROM challenges WHERE creator_id = %s AND id != %s',                                                                                 
            (g.user['id'], habit['challenge_id'])                                                                                                          
        ) 

    dropdown_options = cur.fetchall()
    print(dropdown_options)

    if habit['challenge_id'] == None:
        habit['challenge_id'] = 'None'
    

    if request.method == 'POST':
        title = request.form['title']
        challenge = request.form['challenge']
        body = request.form['body']
        error = None
       
        if not title:
            error = 'Title is required.'

        if challenge == 'None':
            challenge = None

        if error is not None:
            flash(error)
        else:
            db = get_db()
            cur = db.cursor()
            cur.execute(
                'UPDATE habits'
                ' SET title = %s, challenge_id = %s, body = %s'
                ' WHERE id = %s',
                (title, challenge, body, id)
            )
            db.commit()
            cur.close()
            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/update.jinja', habit=habit, dropdown_options=dropdown_options) # Here its passed like a dict reference

@bp.route('/<int:id>/complete', methods=('POST',))
@login_required
def complete(id):
    # make sure it exists
    get_habit(id)

    db = get_db() 
    cur = db.cursor()
    
    today = get_user_local_date()

    # try create a log for today
    cur.execute(
        "INSERT INTO habit_logs (log_date, habit_id) VALUES (%s, %s)",
        (today, id)
    )
    db.commit()
    cur.close()

    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/undo_complete', methods=('POST',))
@login_required
def undo_complete(id):
    db=get_db() 
    cur = db.cursor()
    today = get_user_local_date()
    # set log to false
    cur.execute(
        'DELETE FROM habit_logs ' \
        'WHERE habit_id = %s AND log_date = %s', 
        (id,today)
    )
    db.commit()
    cur.close()
    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_habit(id)
    db = get_db()
    cur = db.cursor()
    cur.execute('DELETE FROM habits WHERE id = %s', (id,))
    db.commit()
    cur.close()
    return redirect(url_for('dashboard.index'))

@bp.route('/toggle_view', methods=("POST",))
@login_required
def toggle_view():
    db = get_db()
    cur = db.cursor()
    cur.execute(
        'UPDATE users' \
        ' SET list_view = NOT list_view' \
        ' WHERE id = %s', (g.user['id'],)
    )
    db.commit()
    cur.close()
    return redirect(url_for('dashboard.index'))