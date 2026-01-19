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
    cur = db.cursor()

    # Define date range
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    # Get user habits
    cur.execute(                                                                                          
          'SELECT id, title FROM habits WHERE creator_id = %s',                                                       
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
            print(days)     
            print()                                                           
        habit_data.append({'habit': habit, 'days': days})   
    
    return render_template('dashboard/track.jinja', habit_data=habit_data, dates=all_dates)
