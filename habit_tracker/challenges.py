from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('challenges', __name__, url_prefix='/challenges')

@bp.route('/')
def index():
    # Show landing page for logged-out users
    if g.user is None:
        return render_template('auth/landing.jinja')
    
    db = get_db()
    cur = db.cursor()

    # get habits
    cur.execute(
        'SELECT *' \
        ' FROM challenges' \
        ' WHERE creator_id = %s',
        (g.user['id'],)
    )

    challenges = cur.fetchall()
    cur.close()


    return render_template('challenges/index.jinja', challenges=challenges)

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
                'INSERT INTO challenges (title, body, creator_id)'
                ' VALUES (%s, %s, %s)',
                (title, body, g.user['id'])
            )
            db.commit()
            cur.close()

            return redirect(url_for('challenges.index'))

    return render_template('challenges/create.jinja')

def get_challenge(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT c.id, title, body, creator_id'
        ' FROM challenges c'
        ' JOIN users u'
        ' ON c.creator_id = u.id'
        ' WHERE c.id = %s',
        (id,)
    )
    challenge = cur.fetchone()
    cur.close()

    if challenge is None:
        abort(404, f"Challenge id {id} doesn't exist.")

    if challenge['creator_id'] != g.user['id']:
        abort(403)

    return challenge

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    challenge = get_challenge(id)
    print(f"challenge: {challenge}")

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
                'UPDATE challenges'
                ' SET title = %s, body = %s'
                ' WHERE id = %s',
                (title, body, id)
            )
            db.commit()
            cur.close()
            return redirect(url_for('challenges.index'))

    return render_template('challenges/update.jinja', challenge=challenge) # Here its passed like a dict reference

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_challenge(id)
    db = get_db()
    cur = db.cursor()
    cur.execute('DELETE FROM challenges WHERE id = %s', (id,))
    db.commit()
    cur.close()
    return redirect(url_for('challenges.index'))

@bp.route('/<int:id>/challenge', methods=('GET', 'POST'))
@login_required
def challenge(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT c.id, title, body, creator_id'
        ' FROM challenges c'
        ' JOIN users u'
        ' ON c.creator_id = u.id'
        ' WHERE c.id = %s',
        (id,)
    )
    challenge = cur.fetchone()

    cur.execute(
        'SELECT * ' \
        'FROM habits ' \
        'WHERE challenge_id = %s',
        (id,)
    )
    habits = cur.fetchall()

    cur.close()

    if challenge is None:
        abort(404, f"Challenge id {id} doesn't exist.")

    if challenge['creator_id'] != g.user['id']:
        abort(403)

    

    return render_template('challenges/challenge.jinja', challenge=challenge, habits=habits)

