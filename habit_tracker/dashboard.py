from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('dashboard', __name__)

@bp.route('/')
def index():
    db = get_db()

    habits = db.execute(
        'SELECT h.id, title, body, created, creator_id, username'
        ' FROM habit h JOIN user u ON h.creator_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()

    return render_template('dashboard/index.jinja', habits=habits)

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

    return render_template('dashboard/update.jinja', habit=habit)