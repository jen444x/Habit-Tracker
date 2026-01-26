from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

from datetime import datetime, date, timedelta 
from zoneinfo import ZoneInfo    

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
        'SELECT c.id, c.title, c.body, c.creator_id, c.created_at'
        ' FROM challenges c'
        ' JOIN users u'
        ' ON c.creator_id = u.id'
        ' WHERE c.id = %s',
        (id,)
    )
    challenge = cur.fetchone()

    if challenge is None:
        abort(404, f"Challenge id {id} doesn't exist.")

    if challenge['creator_id'] != g.user['id']:
        abort(403)

    cur.execute(
        'SELECT * '
        'FROM habits '
        'WHERE challenge_id = %s',
        (id,)
    )
    habits = cur.fetchall()

    # Get stats data
    cur.execute(
        'SELECT COUNT(*) as count FROM habits WHERE challenge_id = %s',
        (id,)
    )
    habit_count = cur.fetchone()['count']

    tz = ZoneInfo(g.user['timezone'])
    today = datetime.now(tz).date()

    challenge_start = challenge['created_at'].astimezone(tz).date()
    start_of_week = challenge_start - timedelta(days=challenge_start.weekday())

    weeks = []
    current_week_start = start_of_week

    while current_week_start <= today:
        week_end = current_week_start + timedelta(days=6)

        cur.execute(
            'SELECT COUNT(*) as count FROM habit_logs hl '
            'JOIN habits h ON hl.habit_id = h.id '
            'WHERE h.challenge_id = %s '
            'AND hl.log_date BETWEEN %s AND %s',
            (id, current_week_start, week_end)
        )
        completions = cur.fetchone()['count']
        possible = habit_count * 7
        percentage = (completions / possible * 100) if possible > 0 else 0

        weeks.append({
            'start': current_week_start,
            'end': week_end,
            'completions': completions,
            'possible': possible,
            'percentage': percentage
        })

        current_week_start += timedelta(days=7)

    cur.close()

    return render_template('challenges/challenge.jinja', challenge=challenge, habits=habits, weeks=weeks)

@bp.route('/challenge/<int:id>/stats')
@login_required
def challenge_stats(id):
    db = get_db()
    cur = db.cursor()

    # Get the challenge (including created_at)
    cur.execute(
        'SELECT * FROM challenges WHERE id = %s AND creator_id = %s',
        (id, g.user['id'])
    )
    challenge = cur.fetchone()
    if challenge is None:
        abort(404)

    # Count habits in this challenge
    cur.execute(
        'SELECT COUNT(*) as count FROM habits WHERE challenge_id = %s',
        (id,)
    )
    habit_count = cur.fetchone()['count']

    # Get user's current date
    tz = ZoneInfo(g.user['timezone'])
    today = datetime.now(tz).date()

    # Start from the Monday of the week the challenge was created
    challenge_start = challenge['created_at'].astimezone(tz).date()
    start_of_week = challenge_start - timedelta(days=challenge_start.weekday())

    # Build weekly stats
    weeks = []
    current_week_start = start_of_week

    while current_week_start <= today:
        week_end = current_week_start + timedelta(days=6)

        cur.execute(
            'SELECT COUNT(*) as count FROM habit_logs hl '
            'JOIN habits h ON hl.habit_id = h.id '
            'WHERE h.challenge_id = %s '
            'AND hl.log_date BETWEEN %s AND %s',
            (id, current_week_start, week_end)
        )
        completions = cur.fetchone()['count']
        possible = habit_count * 7
        percentage = (completions / possible * 100) if possible > 0 else 0

        weeks.append({
            'start': current_week_start,
            'end': week_end,
            'completions': completions,
            'possible': possible,
            'percentage': percentage
        })

        current_week_start += timedelta(days=7)

    cur.close()

    return render_template(
        'challenges/challenge_stats.jinja',
        challenge=challenge,
        habit_count=habit_count,
        weeks=weeks
    )         