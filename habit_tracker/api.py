"""
JSON API endpoints for React frontend.
All routes return JSON instead of HTML templates.
"""
import functools
from flask import Blueprint, jsonify, request, g, session
from psycopg2 import errors
from werkzeug.security import check_password_hash, generate_password_hash
from zoneinfo import ZoneInfo
from datetime import datetime, timedelta

from habit_tracker.db import get_db

bp = Blueprint('api', __name__, url_prefix='/api')


# ============ Auth Helpers ============

def login_required(view):
    """API version - returns JSON error instead of redirect."""
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return view(**kwargs)
    return wrapped_view


def get_user_local_date():
    tz = ZoneInfo(g.user['timezone'])
    return datetime.now(tz).date()


# ============ Auth Routes ============

@bp.route('/auth/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    username = data.get('username', '').lower().strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Both username and password are required'}), 400

    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
            (username, generate_password_hash(password))
        )
        user_id = cur.fetchone()['id']
        db.commit()
        cur.close()

        # Auto-login after registration
        session.clear()
        session['user_id'] = user_id

        return jsonify({
            'success': True,
            'user': {'id': user_id, 'username': username}
        }), 201

    except errors.UniqueViolation:
        db.rollback()
        cur.close()
        return jsonify({'error': f'Username "{username}" is already taken'}), 409


@bp.route('/auth/login', methods=['POST'])
def login():
    """Log in an existing user."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    username = data.get('username', '').lower().strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Both username and password are required'}), 400

    db = get_db()
    cur = db.cursor()

    cur.execute('SELECT * FROM users WHERE username = %s', (username,))
    user = cur.fetchone()
    cur.close()

    if user is None or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid username or password'}), 401

    session.clear()
    session['user_id'] = user['id']

    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'timezone': user['timezone']
        }
    })


@bp.route('/auth/logout', methods=['POST'])
def logout():
    """Log out the current user."""
    session.clear()
    return jsonify({'success': True})


@bp.route('/auth/me', methods=['GET'])
def get_current_user():
    """Get the currently logged-in user."""
    if g.user is None:
        return jsonify({'user': None})

    return jsonify({
        'user': {
            'id': g.user['id'],
            'username': g.user['username'],
            'timezone': g.user['timezone']
        }
    })


# ============ Habits Routes ============

@bp.route('/habits', methods=['GET'])
@login_required
def get_habits():
    """Get all habits for the current user with completion status."""
    db = get_db()
    cur = db.cursor()

    # Get query params
    date_str = request.args.get('date')
    challenge_id = request.args.get('challenge_id', type=int)

    # Parse date or default to today
    today = get_user_local_date()
    if date_str:
        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = today
    else:
        selected_date = today

    # Build query
    query = '''
        SELECT h.id, h.title, h.body, h.created_at, h.challenge_id, h.display_order,
               CASE WHEN hl.habit_id IS NOT NULL THEN true ELSE false END as completed
        FROM habits h
        LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.log_date = %s
        WHERE h.creator_id = %s
    '''
    params = [selected_date, g.user['id']]

    if challenge_id:
        query += ' AND h.challenge_id = %s'
        params.append(challenge_id)

    query += ' ORDER BY h.display_order DESC'

    cur.execute(query, params)
    habits = cur.fetchall()

    # Get week data for each habit
    monday = today - timedelta(days=today.weekday())
    habit_ids = [h['id'] for h in habits]

    week_logs = {}
    if habit_ids:
        cur.execute(
            'SELECT habit_id, log_date FROM habit_logs '
            'WHERE habit_id = ANY(%s) AND log_date >= %s AND log_date <= %s',
            (habit_ids, monday, monday + timedelta(days=6))
        )
        for log in cur.fetchall():
            if log['habit_id'] not in week_logs:
                week_logs[log['habit_id']] = []
            week_logs[log['habit_id']].append(log['log_date'].isoformat())

    cur.close()

    # Format response
    result = []
    for habit in habits:
        habit_created = habit['created_at'].date() if habit['created_at'] else monday
        result.append({
            'id': habit['id'],
            'title': habit['title'],
            'body': habit['body'],
            'challenge_id': habit['challenge_id'],
            'display_order': habit['display_order'],
            'completed': habit['completed'],
            'created_at': habit['created_at'].isoformat() if habit['created_at'] else None,
            'week_logs': week_logs.get(habit['id'], []),
            'habit_created_date': habit_created.isoformat()
        })

    return jsonify({
        'habits': result,
        'selected_date': selected_date.isoformat(),
        'today': today.isoformat()
    })


@bp.route('/habits', methods=['POST'])
@login_required
def create_habit():
    """Create a new habit."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    title = data.get('title', '').strip()
    body = data.get('body', '').strip()
    challenge_id = data.get('challenge_id')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    db = get_db()
    cur = db.cursor()

    cur.execute(
        '''INSERT INTO habits (title, body, creator_id, challenge_id, display_order)
           VALUES (%s, %s, %s, %s, (
               SELECT COALESCE(MAX(display_order), 0) + 1
               FROM habits WHERE creator_id = %s
           ))
           RETURNING id, title, body, created_at, challenge_id, display_order''',
        (title, body, g.user['id'], challenge_id, g.user['id'])
    )
    habit = cur.fetchone()
    db.commit()
    cur.close()

    return jsonify({
        'habit': {
            'id': habit['id'],
            'title': habit['title'],
            'body': habit['body'],
            'challenge_id': habit['challenge_id'],
            'display_order': habit['display_order'],
            'created_at': habit['created_at'].isoformat() if habit['created_at'] else None,
            'completed': False
        }
    }), 201


@bp.route('/habits/<int:id>', methods=['GET'])
@login_required
def get_habit(id):
    """Get a single habit with stats."""
    db = get_db()
    cur = db.cursor()

    cur.execute(
        '''SELECT h.id, h.title, h.body, h.created_at, h.challenge_id, h.display_order, h.creator_id
           FROM habits h WHERE h.id = %s''',
        (id,)
    )
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    habit_created_date = habit['created_at'].date()
    today = get_user_local_date()

    # Get all completion dates
    cur.execute(
        'SELECT log_date FROM habit_logs WHERE habit_id = %s ORDER BY log_date',
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

    # Get challenge info
    challenge = None
    if habit['challenge_id']:
        cur.execute(
            'SELECT id, title FROM challenges WHERE id = %s',
            (habit['challenge_id'],)
        )
        c = cur.fetchone()
        if c:
            challenge = {'id': c['id'], 'title': c['title']}

    cur.close()

    return jsonify({
        'habit': {
            'id': habit['id'],
            'title': habit['title'],
            'body': habit['body'],
            'challenge_id': habit['challenge_id'],
            'display_order': habit['display_order'],
            'created_at': habit['created_at'].isoformat() if habit['created_at'] else None
        },
        'stats': {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_completions': len(all_completed_dates),
            'completion_dates': [d.isoformat() for d in sorted(all_completed_dates)]
        },
        'challenge': challenge
    })


@bp.route('/habits/<int:id>', methods=['PUT'])
@login_required
def update_habit(id):
    """Update a habit."""
    db = get_db()
    cur = db.cursor()

    # Check ownership
    cur.execute('SELECT creator_id FROM habits WHERE id = %s', (id,))
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()
    if not data:
        cur.close()
        return jsonify({'error': 'JSON body required'}), 400

    title = data.get('title', '').strip()
    body = data.get('body', '').strip()
    challenge_id = data.get('challenge_id')

    if not title:
        cur.close()
        return jsonify({'error': 'Title is required'}), 400

    cur.execute(
        '''UPDATE habits SET title = %s, body = %s, challenge_id = %s
           WHERE id = %s
           RETURNING id, title, body, created_at, challenge_id, display_order''',
        (title, body, challenge_id, id)
    )
    updated = cur.fetchone()
    db.commit()
    cur.close()

    return jsonify({
        'habit': {
            'id': updated['id'],
            'title': updated['title'],
            'body': updated['body'],
            'challenge_id': updated['challenge_id'],
            'display_order': updated['display_order'],
            'created_at': updated['created_at'].isoformat() if updated['created_at'] else None
        }
    })


@bp.route('/habits/<int:id>', methods=['DELETE'])
@login_required
def delete_habit(id):
    """Delete a habit."""
    db = get_db()
    cur = db.cursor()

    cur.execute('SELECT creator_id FROM habits WHERE id = %s', (id,))
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    cur.execute('DELETE FROM habits WHERE id = %s', (id,))
    db.commit()
    cur.close()

    return jsonify({'success': True})


@bp.route('/habits/<int:id>/complete', methods=['POST'])
@login_required
def complete_habit(id):
    """Mark a habit as complete for a given date."""
    db = get_db()
    cur = db.cursor()

    # Check ownership
    cur.execute('SELECT creator_id FROM habits WHERE id = %s', (id,))
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json() or {}
    date_str = data.get('date')

    if date_str:
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = get_user_local_date()
    else:
        log_date = get_user_local_date()

    try:
        cur.execute(
            "INSERT INTO habit_logs (log_date, habit_id) VALUES (%s, %s)",
            (log_date, id)
        )
        db.commit()
    except errors.UniqueViolation:
        db.rollback()
        # Already completed, that's fine

    cur.close()

    return jsonify({'success': True, 'date': log_date.isoformat()})


@bp.route('/habits/<int:id>/undo', methods=['POST'])
@login_required
def undo_complete_habit(id):
    """Remove completion for a habit on a given date."""
    db = get_db()
    cur = db.cursor()

    # Check ownership
    cur.execute('SELECT creator_id FROM habits WHERE id = %s', (id,))
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json() or {}
    date_str = data.get('date')

    if date_str:
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = get_user_local_date()
    else:
        log_date = get_user_local_date()

    cur.execute(
        'DELETE FROM habit_logs WHERE habit_id = %s AND log_date = %s',
        (id, log_date)
    )
    db.commit()
    cur.close()

    return jsonify({'success': True, 'date': log_date.isoformat()})


@bp.route('/habits/<int:id>/move', methods=['POST'])
@login_required
def move_habit(id):
    """Move a habit up or down in the list."""
    db = get_db()
    cur = db.cursor()

    # Check ownership and get current order
    cur.execute(
        'SELECT creator_id, display_order FROM habits WHERE id = %s',
        (id,)
    )
    habit = cur.fetchone()

    if habit is None:
        cur.close()
        return jsonify({'error': 'Habit not found'}), 404

    if habit['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json() or {}
    direction = data.get('direction', 'up')

    current_order = habit['display_order'] or 0

    if direction == 'up':
        cur.execute(
            '''SELECT id, display_order FROM habits
               WHERE creator_id = %s AND display_order > %s
               ORDER BY display_order ASC LIMIT 1''',
            (g.user['id'], current_order)
        )
    else:
        cur.execute(
            '''SELECT id, display_order FROM habits
               WHERE creator_id = %s AND display_order < %s
               ORDER BY display_order DESC LIMIT 1''',
            (g.user['id'], current_order)
        )

    swap_habit = cur.fetchone()

    if swap_habit:
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

    return jsonify({'success': True})


# ============ Challenges Routes ============

@bp.route('/challenges', methods=['GET'])
@login_required
def get_challenges():
    """Get all challenges for the current user."""
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT id, title, created_at FROM challenges WHERE creator_id = %s ORDER BY id',
        (g.user['id'],)
    )
    challenges = cur.fetchall()
    cur.close()

    return jsonify({
        'challenges': [
            {
                'id': c['id'],
                'title': c['title'],
                'created_at': c['created_at'].isoformat() if c['created_at'] else None
            }
            for c in challenges
        ]
    })


@bp.route('/challenges', methods=['POST'])
@login_required
def create_challenge():
    """Create a new challenge."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    title = data.get('title', '').strip()

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    db = get_db()
    cur = db.cursor()

    cur.execute(
        'INSERT INTO challenges (title, creator_id) VALUES (%s, %s) RETURNING id, title, created_at',
        (title, g.user['id'])
    )
    challenge = cur.fetchone()
    db.commit()
    cur.close()

    return jsonify({
        'challenge': {
            'id': challenge['id'],
            'title': challenge['title'],
            'created_at': challenge['created_at'].isoformat() if challenge['created_at'] else None
        }
    }), 201


@bp.route('/challenges/<int:id>', methods=['DELETE'])
@login_required
def delete_challenge(id):
    """Delete a challenge."""
    db = get_db()
    cur = db.cursor()

    cur.execute('SELECT creator_id FROM challenges WHERE id = %s', (id,))
    challenge = cur.fetchone()

    if challenge is None:
        cur.close()
        return jsonify({'error': 'Challenge not found'}), 404

    if challenge['creator_id'] != g.user['id']:
        cur.close()
        return jsonify({'error': 'Forbidden'}), 403

    # Remove challenge from habits first
    cur.execute(
        'UPDATE habits SET challenge_id = NULL WHERE challenge_id = %s',
        (id,)
    )
    cur.execute('DELETE FROM challenges WHERE id = %s', (id,))
    db.commit()
    cur.close()

    return jsonify({'success': True})
