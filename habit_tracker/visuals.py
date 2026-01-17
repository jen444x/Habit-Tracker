import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from werkzeug.exceptions import abort

from datetime import date, timedelta

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('visuals', __name__, url_prefix='/visuals')

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
