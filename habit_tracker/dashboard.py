from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from datetime import date


from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')

    db = get_db()
    cur = db.cursor()

    # today = date.today().isoformat()                                                                                  
    cur.execute(
        'SELECT h.id, h.title, h.body'
        ' FROM habits h' 
        ' LEFT JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s' 
        ' WHERE h.creator_id = %s'
        ' AND hl.habit_id IS NULL'
        ' ORDER BY created_at DESC',
        (date.today(), g.user['id'],)
    )

    habits = cur.fetchall()

    cur.execute(
        'SELECT h.id, title, body'
        ' FROM habits h' 
        ' INNER JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s' 
        ' WHERE h.creator_id = %s'
        ' ORDER BY created_at DESC',
        (date.today(), g.user['id'],)   
    )
    habits_done = cur.fetchall()

    cur.close()

    return render_template('dashboard/index.jinja', habits=habits, habits_done=habits_done)

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
                'INSERT INTO habits (title, body, creator_id)'
                ' VALUES (%s, %s, %s)',
                (title, body, g.user['id'])
            )
            db.commit()
            cur.close()

            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/create.jinja')

def get_habit(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT h.id, title, body, creator_id'
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
            cur = db.cursor()
            cur.execute(
                'UPDATE habits'
                ' SET title = %s, body = %s'
                ' WHERE id = %s',
                (title, body, id)
            )
            db.commit()
            cur.close()
            return redirect(url_for('dashboard.index'))

    return render_template('dashboard/update.jinja', habit=habit) # Here its passed like a dict reference

@bp.route('/<int:id>/complete', methods=('POST',))
@login_required
def complete(id):
    # make sure it exists
    get_habit(id)

    db = get_db() 
    cur = db.cursor()
    # today = date.today().isoformat() 

    # try create a log for today
    cur.execute(
        "INSERT INTO habit_logs (log_date, habit_id) VALUES (%s, %s)",
        (date.today(), id)
    )
    db.commit()
    cur.close()

    return redirect(url_for('dashboard.index'))

@bp.route('/<int:id>/undo_complete', methods=('POST',))
@login_required
def undo_complete(id):
    db=get_db() 
    cur = db.cursor()
    today = date.today().isoformat() 
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
