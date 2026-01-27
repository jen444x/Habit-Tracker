from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from zoneinfo import ZoneInfo
from datetime import datetime, timedelta 

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

def get_user_local_date():
    tz = ZoneInfo(g.user['timezone'])
    return datetime.now(tz).date()

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')

    db = get_db()
    cur = db.cursor()

    # Get query params
    challenge_filter = request.args.get('challenge', type=int)
    date_str = request.args.get('date')

    # Parse date or default to today
    today = get_user_local_date()
    if date_str:
        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = today
    else:
        selected_date = today

    # Calculate prev/next dates
    prev_date = selected_date - timedelta(days=1)
    next_date = selected_date + timedelta(days=1)
    is_today = selected_date == today

    # Get all challenges for the filter dropdown
    cur.execute(
        'SELECT id, title FROM challenges WHERE creator_id = %s ORDER BY id',
        (g.user['id'],)
    )
    all_challenges = cur.fetchall()

    # Build challenge filter clause
    if challenge_filter:
        challenge_clause = ' AND h.challenge_id = %s'
        challenge_param = (challenge_filter,)
    else:
        challenge_clause = ''
        challenge_param = ()

    # Get current week (Mon-Sun)
    monday = today - timedelta(days=today.weekday())

    # Get incomplete habits
    cur.execute(
        'SELECT h.id, h.title, h.body, h.created_at'
        ' FROM habits h'
        ' LEFT JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s'
        ' AND hl.habit_id IS NULL'
        + challenge_clause +
        ' ORDER BY display_order DESC',
        (selected_date, g.user['id']) + challenge_param
    )
    habits = [dict(row) for row in cur.fetchall()]

    # Get completed habits
    cur.execute(
        'SELECT h.id, title, body, h.created_at'
        ' FROM habits h'
        ' INNER JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s'
        + challenge_clause,
        (selected_date, g.user['id']) + challenge_param
    )
    habits_done = [dict(row) for row in cur.fetchall()]

    # Get all habit IDs
    all_habit_ids = [h['id'] for h in habits] + [h['id'] for h in habits_done]

    # Get week's completion logs for all habits
    week_logs = {}
    if all_habit_ids:
        cur.execute(
            'SELECT habit_id, log_date FROM habit_logs '
            'WHERE habit_id = ANY(%s) AND log_date >= %s AND log_date <= %s',
            (all_habit_ids, monday, monday + timedelta(days=6))
        )
        for log in cur.fetchall():
            if log['habit_id'] not in week_logs:
                week_logs[log['habit_id']] = set()
            week_logs[log['habit_id']].add(log['log_date'])

    # Add week data to each habit
    def add_week_data(habit_list):
        for habit in habit_list:
            habit_created = habit['created_at'].date() if habit['created_at'] else monday
            completed_dates = week_logs.get(habit['id'], set())
            habit['week'] = []
            for i in range(7):
                date = monday + timedelta(days=i)
                habit['week'].append({
                    'date': date,
                    'completed': date in completed_dates,
                    'in_future': date > today,
                    'before_habit': date < habit_created
                })

    add_week_data(habits)
    add_week_data(habits_done)

    cur.close()

    return render_template(
        'dashboard/index.jinja',
        habits=habits,
        habits_done=habits_done,
        all_challenges=all_challenges,
        challenge_filter=challenge_filter,
        selected_date=selected_date,
        prev_date=prev_date,
        next_date=next_date,
        is_today=is_today
    )


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

@bp.route('/<int:id>')
@login_required
def view(id):
    habit = get_habit(id)
    db = get_db()
    cur = db.cursor()

    # Get habit created_at date
    cur.execute(
        'SELECT created_at FROM habits WHERE id = %s',
        (id,)
    )
    habit_row = cur.fetchone()
    habit_created_date = habit_row['created_at'].date()

    today = get_user_local_date()

    # Week navigation
    week_offset = request.args.get('week', 0, type=int)
    current_monday = today - timedelta(days=today.weekday())
    selected_week_monday = current_monday + timedelta(weeks=week_offset)
    selected_week_sunday = selected_week_monday + timedelta(days=6)
    is_current_week = week_offset == 0

    # Can go prev if habit existed before this week
    habit_created_monday = habit_created_date - timedelta(days=habit_created_date.weekday())
    can_go_prev = selected_week_monday > habit_created_monday
    # Can go next if not already at current week
    can_go_next = week_offset < 0

    # Get completion logs for selected week
    cur.execute(
        'SELECT log_date FROM habit_logs '
        'WHERE habit_id = %s AND log_date >= %s AND log_date <= %s '
        'ORDER BY log_date DESC',
        (id, selected_week_monday, selected_week_sunday)
    )
    logs = cur.fetchall()
    completed_dates = {log['log_date'] for log in logs}

    # Build week data (Mon-Sun)
    days_data = []
    for i in range(7):
        date = selected_week_monday + timedelta(days=i)
        days_data.append({
            'date': date,
            'completed': date in completed_dates,
            'in_future': date > today,
            'before_habit': date < habit_created_date
        })

    # Get all completion dates for streak calculations
    cur.execute(
        'SELECT log_date FROM habit_logs '
        'WHERE habit_id = %s ORDER BY log_date',
        (id,)
    )
    all_logs = cur.fetchall()
    all_completed_dates = {log['log_date'] for log in all_logs}

    # Current streak
    current_streak = 0
    check_date = today
    while check_date in all_completed_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    # If not completed today, check if yesterday started a streak
    if current_streak == 0:
        check_date = today - timedelta(days=1)
        while check_date in all_completed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

    # Longest streak
    longest_streak = 0
    if all_logs:
        sorted_dates = sorted(all_completed_dates)
        streak = 1
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak)

    # Calculate weekly progress (last 8 weeks)
    weeks = []
    for w in range(7, -1, -1):
        week_start = current_monday - timedelta(weeks=w)
        week_end = week_start + timedelta(days=6)

        # Count days that are valid (not before habit created, not in future)
        valid_days = 0
        completed_days = 0
        for d in range(7):
            day = week_start + timedelta(days=d)
            if day >= habit_created_date and day <= today:
                valid_days += 1
                if day in all_completed_dates:
                    completed_days += 1

        if valid_days > 0:
            percentage = (completed_days / valid_days) * 100
        else:
            percentage = 0

        weeks.append({
            'start': week_start,
            'end': week_end,
            'completed': completed_days,
            'valid_days': valid_days,
            'percentage': percentage
        })

    # Get challenge info if assigned
    challenge = None
    if habit['challenge_id']:
        cur.execute(
            'SELECT id, title FROM challenges WHERE id = %s',
            (habit['challenge_id'],)
        )
        challenge = cur.fetchone()

    cur.close()

    return render_template(
        'dashboard/view.jinja',
        habit=habit,
        days_data=days_data,
        current_streak=current_streak,
        longest_streak=longest_streak,
        weeks=weeks,
        challenge=challenge,
        week_offset=week_offset,
        is_current_week=is_current_week,
        can_go_prev=can_go_prev,
        can_go_next=can_go_next,
        selected_week_monday=selected_week_monday,
        selected_week_sunday=selected_week_sunday
    )


@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    habit = get_habit(id)

    # get challenges for drop down
    db = get_db()
    cur = db.cursor()
    
    if habit['challenge_id'] is None:                                                                                                         
        cur.execute(                                                                                                                                       
            'SELECT * ' \
            'FROM challenges ' \
            'WHERE creator_id = %s',                                                                                              
            (g.user['id'],)                                                                                                                                
        )  
        habit['challenge_title'] = 'None'                                                                                                                                              
    else:    
        # get project name of challenge
        cur.execute(
            'SELECT title ' \
            'FROM challenges ' \
            'WHERE id = %s',
            (habit['challenge_id'], )
        )   
        c_title = cur.fetchone()
        habit['challenge_title'] = c_title['title'] 

        cur.execute(                                                                                                                                       
            'SELECT * FROM challenges WHERE creator_id = %s AND id != %s',                                                                                 
            (g.user['id'], habit['challenge_id'])                                                                                                          
        ) 

    dropdown_options = cur.fetchall()

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

    # Get the date from form (for logging past days)
    date_str = request.form.get('date')
    if date_str:
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = get_user_local_date()
    else:
        log_date = get_user_local_date()

    db = get_db()
    cur = db.cursor()

    cur.execute(
        "INSERT INTO habit_logs (log_date, habit_id) VALUES (%s, %s)",
        (log_date, id)
    )
    db.commit()
    cur.close()

    # Redirect back to same date view
    if date_str:
        return redirect(url_for('dashboard.index', date=date_str))
    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/undo_complete', methods=('POST',))
@login_required
def undo_complete(id):
    # Get the date from form
    date_str = request.form.get('date')
    if date_str:
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = get_user_local_date()
    else:
        log_date = get_user_local_date()

    db = get_db()
    cur = db.cursor()
    cur.execute(
        'DELETE FROM habit_logs '
        'WHERE habit_id = %s AND log_date = %s',
        (id, log_date)
    )
    db.commit()
    cur.close()

    # Redirect back to same date view
    if date_str:
        return redirect(url_for('dashboard.index', date=date_str))
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

@bp.route('/<int:id>/move/<direction>', methods=('POST',))
@login_required
def move(id, direction):
    habit = get_habit(id)
    db = get_db()
    cur = db.cursor()

    current_order = habit['display_order'] if habit['display_order'] else 0

    if direction == 'up':
        # Find habit with next higher display_order
        cur.execute(
            'SELECT id, display_order FROM habits '
            'WHERE creator_id = %s AND display_order > %s '
            'ORDER BY display_order ASC LIMIT 1',
            (g.user['id'], current_order)
        )
    else:
        # Find habit with next lower display_order
        cur.execute(
            'SELECT id, display_order FROM habits '
            'WHERE creator_id = %s AND display_order < %s '
            'ORDER BY display_order DESC LIMIT 1',
            (g.user['id'], current_order)
        )

    swap_habit = cur.fetchone()

    if swap_habit:
        # Swap the display_order values
        cur.execute(
            'UPDATE habits SET display_order = %s WHERE id = %s',
            (swap_habit['display_order'], id)
        )
        cur.execute(
            'UPDATE habits SET display_order = %s WHERE id = %s',
            (current_order, swap_habit['id'])
        )
        db.commit()

    cur.close()
    return redirect(url_for('dashboard.index'))

