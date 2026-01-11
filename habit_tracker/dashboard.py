from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')

    db = get_db()

    habits = db.execute(
        'SELECT h.id, title, body, created, creator_id, username, hl.stat'
        ' FROM habit h ' 
        ' JOIN user u ON h.creator_id = u.id'
        # left join so if doesnt have a log, returns null
        ' LEFT JOIN habit_log hl on h.id = hl.habitid AND hl.log_date = DATE("now")' 
        ' WHERE (hl.stat IS NULL OR hl.stat = 0) AND h.creator_id = ?'
        ' ORDER BY created DESC',
        (g.user['id'],)   
    ).fetchall()

    habits_done = db.execute(
        'SELECT h.id, title, body, created, creator_id, username, hl.stat'
        ' FROM habit h ' 
        ' JOIN user u ON h.creator_id = u.id'
        # left join so if doesnt have a log, returns null
        ' LEFT JOIN habit_log hl on h.id = hl.habitid AND hl.log_date = DATE("now")' 
        ' WHERE hl.stat = 1 AND h.creator_id = ?'
        ' ORDER BY created DESC',
        (g.user['id'],)   
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
    # create a log for today
    db.execute(
        "INSERT INTO habit_log (log_date, stat, habitid) VALUES (DATE('now'), ?, ?)",
        (True, id)
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


