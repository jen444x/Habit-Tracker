from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from zoneinfo import ZoneInfo
from datetime import datetime, timedelta 

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

bp = Blueprint('habits', __name__)

# create habit
@bp.route('/habits', methods=('POST',))
@login_required
def create_habit():
    # Get data
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
     
    name = data.get('name')
    notes = data.get('notes')
    tier = data.get('tier')

    # Validate data
    if not name:
        return jsonify({"error": "Name is required"}), 400
    if not isinstance(name, str):
        return jsonify({"error": "Name must be a string"}), 400
    if name.isspace():
        return jsonify({"error": "Name cannot be empty"}), 400  
    if len(name) > 100:
        return jsonify({"error": "Name must be 100 or less characters"}), 400
    
    if notes and not isinstance(notes, str):                                                                                   
      return jsonify({"error": "Notes must be a string"}), 400   

    # make sure tier is in [1,3]
    if tier not in [1, 2, 3]:
        return jsonify({"error": "Tier must be 1, 2, or 3"}), 400
    
    # create habit
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'INSERT INTO habits(name, notes, tier, creator_id)' \
        ' VALUES (%s, %s, %s, %s)'
        ' RETURNING id',
        (name, notes, tier, g.user['id'])
    )
    new_id = cur.fetchone()['id']
    db.commit()
    cur.close()

    return jsonify({"id": new_id}), 201



def get_user_local_date():
    tz = ZoneInfo(g.user['timezone'])
    return datetime.now(tz).date()

# merge habits by family id
@bp.route('/habits/<int:family_id>/merge', methods=('POST',))
@login_required
def merge_habits(family_id):
    # set merged to true on all habits in habit
    db = get_db()
    cur = db.cursor()
    
    cur.execute(
        'UPDATE habits' \
        ' SET merged = %s'
        ' WHERE family_id = %s'
        ' AND merged = %s'
        ' AND creator_id = %s',
        (True, family_id, False, g.user['id'])
    )
    db.commit()

    cur.execute(
        'SELECT id, merged'
        ' FROM habits' 
        ' WHERE family_id = %s'
        ' AND creator_id = %s',
        (family_id, g.user['id'])
    )
    habits = cur.fetchall()
    print(habits)
    cur.close()
    return jsonify({}), 200


# group habits by family id
@bp.route('/habits/tiers', methods=('GET',))
@login_required
def get_families():
    # parse date if give, else use todays date
    date_str = request.args.get('date')
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

    db = get_db()
    cur = db.cursor()

    # Get habits that haven't been completed yet
    # will only get the newest habit in habit family if they arent suppose to be merged
    cur.execute(  
        'SELECT * FROM (' \
        '   SELECT DISTINCT ON (family_id)' \
        '       h.id, h.name, h.notes, h.created_at, h.family_id, stage, tier, time_of_day, merged' \
        '   FROM habits h' \
        '   LEFT JOIN habit_logs hl' \
        '       ON h.id = hl.habit_id' \
        '       AND hl.log_date = %s'  \
        '   WHERE h.creator_id = %s' \
        '   AND merged = %s' \
        '   AND hl.habit_id IS NULL' \
        '   ORDER BY family_id, stage ASC' \
        ') AS unique_habits' \
        ' ORDER BY tier ASC',
        (selected_date, g.user['id'], False) 
    )
    habits = [dict(row) for row in cur.fetchall()]
    
    # now we will get the merged ones and add to habits
    cur.execute(
        'SELECT h.id, h.name, h.notes, h.created_at, h.family_id, stage, tier, time_of_day, merged' 
        ' FROM habits h'
        ' LEFT JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s'
        '   AND merged = %s' 
        ' AND hl.habit_id IS NULL'
        ' ORDER BY tier, family_id, stage ASC',
        (selected_date, g.user['id'], True) 
    )
    merged_habits = [dict(row) for row in cur.fetchall()]
    habits.extend(merged_habits)
    
    # get habits current streaks
    for habit in habits:
        # get all completion dates
        cur.execute(
            'SELECT log_date' \
            ' FROM habit_logs' \
            ' WHERE habit_id = %s' \
            ' AND status = %s' \
            ' ORDER BY log_date',
            (habit['id'], 'completed')
        )
        all_logs = cur.fetchall()
        all_completed_dates = set()
        for log in all_logs:
            all_completed_dates.add(log['log_date'])
        # calculate curr streak
        curr_streak = 0
        check_date = today - timedelta(days=1) # starting yesterday since it hasnt been completed td
        while check_date in all_completed_dates:
            curr_streak += 1
            check_date -= timedelta(days=1)

        # add curr streak to habit
        habit['curr_streak'] = curr_streak

    # sort them by streak
    # habits.sort(key=lambda habit: (habit['tier'], habit['time_of_day'] or 0, habit['family_id'], -habit['curr_streak'])) 
                                                                                              
    # For merged families, use the newest habit's streak for sorting                                                                                       
    # First, find the newest habit's streak for each merged family                                                                                         
    family_sort_streaks = {}                                                                                                                               
                                                                                                                                                            
    for habit in habits:                                                                                                                                   
      if habit['merged'] == True:                                                                                                                        
          family_id = habit['family_id']                                                                                                                 
          streak = habit['curr_streak']                                                                                                                  
                                                                                                                                                         
          # Check if this family is already tracked                                                                                                      
          if family_id not in family_sort_streaks:                                                                                                       
              # First habit we've seen in this family                                                                                                    
              family_sort_streaks[family_id] = streak                                                                                                    
          else:                                                                                                                                          
              # Keep the lower streak                                                                                                                    
              if streak < family_sort_streaks[family_id]:                                                                                                
                  family_sort_streaks[family_id] = streak 

    # Now assign sort_streak to each habit                                                                                                                 
    for habit in habits:                                                                                                                                   
        if habit['merged'] == True:                                                                                                                        
            family_id = habit['family_id']                                                                                                                 
            # Use the lowest streak in the family for sorting                                                                                              
            habit['sort_streak'] = family_sort_streaks[family_id]                                                                                          
        else:                                                                                                                                              
            # Non-merged habits use their own streak                                                                                                       
            habit['sort_streak'] = habit['curr_streak']                                                                                                    
                                                                                                                                                            
    # Sort using sort_streak instead of curr_streak                                                                                                        
    habits.sort(key=lambda habit: (habit['tier'], habit['time_of_day'] or 0, -habit['sort_streak'], habit['family_id'], habit['stage']))
    
    # Get completed habits
    # cur.execute(
    #     'SELECT DISTINCT ON (family_id)' \
    #     ' h.id, h.name, h.notes, h.created_at, h.family_id, stage, tier, hl.status'
    #     ' FROM habits h'
    #     ' INNER JOIN habit_logs hl'
    #     '   ON h.id = hl.habit_id'
    #     '   AND hl.log_date = %s'
    #     ' WHERE h.creator_id = %s'
    #     ' ORDER BY family_id, stage DESC, tier ASC',
    #     (selected_date, g.user['id'])
    # )
    cur.execute(
        'SELECT h.id, h.name, h.notes, h.created_at, h.family_id, stage, tier, hl.status'
        ' FROM habits h'
        ' INNER JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s'
        ' ORDER BY family_id, stage DESC, tier ASC',
        (selected_date, g.user['id'])
    )

    habits_done = [dict(row) for row in cur.fetchall()]

    # get habits current streaks
    for habit in habits_done:
        # get all completion dates
        cur.execute(
            'SELECT log_date' \
            ' FROM habit_logs' \
            ' WHERE habit_id = %s' \
            ' AND status = %s' \
            ' ORDER BY log_date',
            (habit['id'], 'completed')
        )
        all_logs = cur.fetchall()
        all_completed_dates = set()
        for log in all_logs:
            all_completed_dates.add(log['log_date'])
        
        # calculate curr streak
        curr_streak = 0
        check_date = today # starting today since it's been completed td
        while check_date in all_completed_dates:
            curr_streak += 1
            check_date -= timedelta(days=1)

        # add curr streak to habit
        habit['curr_streak'] = curr_streak

    # sort them by streak
    habits_done.sort(key=lambda habit: habit['curr_streak'], reverse=True)
    
    cur.close()

    return jsonify({                                                                                                                                                                                                                        
      "habits": habits,                                                                                                                                                                                                                   
      "habits_done": habits_done,                                                                                                                                                                                                         
      "prev_date": prev_date.isoformat(),                                                                                                                                                                                                 
      "next_date": next_date.isoformat(),                                                                                                                                                                                                 
      "today": today.isoformat()                                                                                                                                                                                                          
    })  



# get complete and incomplete habits for date
@bp.route('/habits')
def get_habits():
    print("coming in")
    # Parse date if given, else use todays date
    date_str = request.args.get('date')
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

    db = get_db()
    cur = db.cursor()

    # Get incomplete habits
    cur.execute(    
        'SELECT h.id, h.name, h.notes, h.created_at, h.family_id'
        ' FROM habits h'
        ' LEFT JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s'
        ' AND hl.habit_id IS NULL'
        ' ORDER BY display_order DESC',
        (selected_date, g.user['id']) 
    )
    habits = [dict(row) for row in cur.fetchall()]

    # get habits current streaks
    for habit in habits:
        # get all completion dates
        cur.execute('' \
        'SELECT log_date' \
        ' FROM habit_logs' \
        ' WHERE habit_id = %s' \
        ' AND status = %s' \
        ' ORDER BY log_date',
        (habit['id']), 'completed')
        all_logs = cur.fetchall()
        all_completed_dates = set()
        for log in all_logs:
            all_completed_dates.add(log['log_date'])
        
        # calculate curr streak
        curr_streak = 0
        check_date = today - timedelta(days=1) # starting yesterday since it hasnt been completed td
        while check_date in all_completed_dates:
            curr_streak += 1
            check_date -= timedelta(days=1)

        # add curr streak to habit
        habit['curr_streak'] = curr_streak
        print("hi")
        print(habit)
    

    # Get completed habits
    cur.execute(
        'SELECT h.id, h.name, h.notes, h.created_at, h.family_id'
        ' FROM habits h'
        ' INNER JOIN habit_logs hl'
        '   ON h.id = hl.habit_id'
        '   AND hl.log_date = %s'
        ' WHERE h.creator_id = %s',
        (selected_date, g.user['id'])
    )
    habits_done = [dict(row) for row in cur.fetchall()]

    # get habits current streaks
    for habit in habits_done:
        # get all completion dates
        cur.execute('' \
        'SELECT log_date' \
        ' FROM habit_logs' \
        ' WHERE habit_id = %s' \
        ' AND status = %s' \
        ' ORDER BY log_date',
        (habit['id']), 'completed')
        all_logs = cur.fetchall()
        all_completed_dates = set()
        for log in all_logs:
            all_completed_dates.add(log['log_date'])
        
        # calculate curr streak
        curr_streak = 0
        check_date = today # starting today since it's been completed td
        while check_date in all_completed_dates:
            curr_streak += 1
            check_date -= timedelta(days=1)

        # add curr streak to habit
        habit['curr_streak'] = curr_streak

    cur.close()

    return jsonify({
      "habits": habits,
      "habits_done": habits_done,
      "prev_date": prev_date.isoformat(),
      "next_date": next_date.isoformat(),
      "today": today.isoformat()
  })   


# get single habit data
@bp.route('/habits/<int:id>')
@login_required
def get_habit(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT tier' \
        ' FROM habits' \
        ' WHERE id = %s' \
        ' AND creator_id = %s',
        (id, g.user['id'])
    )

    habit = cur.fetchone()
    cur.close

    return jsonify({"habit": habit})






@bp.route('/family/<int:family_id>', methods=('GET',))
def get_family(family_id):
    db = get_db()
    cur = db.cursor()

    # Get habits from this family
    cur.execute(
        'SELECT *' \
        ' FROM habits' \
        ' WHERE family_id = %s AND creator_id = %s'
        ' ORDER BY stage DESC',
        (family_id, g.user['id'])
    )   

    habits = cur.fetchall()
    cur.close()
    return jsonify({"habits": habits}), 200


@bp.route('/upgrade', methods=('POST',))
def upgrade():
    # get data
    data = request.get_json()
    name = data.get('name')
    description = data.get('desc')
    challenge_id = data.get('challengeId')
    stage = data.get('stage')
    family = data.get('familyId')

    if not name:
        return jsonify({"error": "Name is missing"}), 400

    db = get_db()
    cur = db.cursor()

    # create habit
    # check if challenge id was included
    if not challenge_id:
        cur.execute(
            'INSERT INTO habits (name, notes, stage, family_id, creator_id, display_order)'
            ' VALUES (%s, %s, %s, %s, %s, (' \
            'SELECT COALESCE(MAX(display_order), 0) + 1 ' \
            'FROM habits WHERE creator_id = %s))',
            (name, description, stage, family, g.user['id'], g.user['id'])
        )
    else:
        cur.execute(
            'INSERT INTO habits (name, notes, stage, family_id, challenge_id, creator_id, display_order)'
            ' VALUES (%s, %s, %s, %s, %s , %s, (' \
            'SELECT COALESCE(MAX(display_order), 0) + 1 ' \
            'FROM habits WHERE creator_id = %s))',
            (name, description, stage, family, int(challenge_id), g.user['id'], g.user['id'])
        )

    db.commit()
    cur.close()

    return jsonify({}),201


@bp.route('/create', methods=('GET', 'POST'))
def create():
    if request.method == 'POST':
        # get data
        data = request.get_json()
        name = data.get('name')
        description = data.get('desc')
        tier = data.get('tier')
   
        if not name:
            return jsonify({"error": "Name is missing"}), 400

        db = get_db()
        cur = db.cursor()

        # create habit
        cur.execute(
            'INSERT INTO habits (name, notes, tier, creator_id, display_order)'
            ' VALUES (%s, %s, %s, %s, (' \
            'SELECT COALESCE(MAX(display_order), 0) + 1 ' \
            'FROM habits WHERE creator_id = %s))',
            (name, description, tier, g.user['id'], g.user['id'])
        )

        db.commit()
        cur.close()

        return jsonify({}),201

    return render_template('dashboard/create.jinja')

def get_habit_(id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT h.id, h.name, h.notes, creator_id, challenge_id, stage, family_id, tier, time_of_day'
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


@bp.route('/habits/<int:id>/skip', methods=('POST',))
@login_required
def skip_habit(id):
    # make sure it exists
    get_habit_(id)

    # get date of habit being skipped
    date_str = request.form.get('date')
    if date_str:
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = get_user_local_date()
    else:
        log_date = get_user_local_date()

    # check if reason was included
    reason = request.form.get('reason')

    db = get_db()
    cur = db.cursor()

    # get family id and stage of habit
    cur.execute(
        "SELECT family_id, stage" \
        " FROM habits" \
        " WHERE id = %s", 
        (id,)
    )
    habit = cur.fetchone()
    print(habit)
    family_id = habit['family_id']
    habit_stage = habit['stage']

    # get all the habits in the same family
    cur.execute(
        "SELECT id FROM habits" \
        " WHERE family_id = %s"
        " AND stage >= %s",
        (family_id, habit_stage)
    )
    habits = cur.fetchall()
   
    for habit in habits:
        habit_id = habit['id']
        
        cur.execute(
            "INSERT INTO habit_logs (log_date, habit_id, status, reason) VALUES (%s, %s, %s, %s)",
            (log_date, habit_id, 'skipped', reason)
        )

    db.commit()
    cur.close()

    return jsonify({}), 200
    

@bp.route('/<int:id>/complete', methods=('POST',))
@login_required
def complete(id):
    # make sure it exists
    get_habit_(id)

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

    return jsonify({}), 200



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
    return jsonify({}), 200

@bp.route('/<int:id>/undo_skip', methods=('POST',))
@login_required
def undo_skip(id):
    # make sure it exists
    get_habit_(id)

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

    # get family id and stage of habit to unskip prev
    cur.execute(
        "SELECT family_id, stage" \
        " FROM habits" \
        " WHERE id = %s", 
        (id,)
    )
    habit = cur.fetchone()
    family_id = habit['family_id']
    habit_stage = habit['stage']

    # get all the habits in the same family
    cur.execute(
        "SELECT id FROM habit_logs hl" \
        " LEFT JOIN habits h" \
        " ON h.id = hl.habit_id" \
        " WHERE hl.status = %s"
        " AND family_id = %s"
        " AND hl.log_date = %s"
        " AND stage <= %s",
        ('skipped', family_id, log_date, habit_stage)
    )
    habits = cur.fetchall()
    
    for habit in habits:
        habit_id = habit['id']
        cur.execute(
            'DELETE FROM habit_logs '
            'WHERE habit_id = %s AND log_date = %s',
            (habit_id, log_date)
        )

    db.commit()
    cur.close()
    return jsonify({}), 200





@bp.route('/<int:id>')
@login_required
def view(id):
    habit = get_habit_(id)
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

    # # Get challenge info if assigned
    # challenge = None
    # if habit['challenge_id']:
    #     cur.execute(
    #         'SELECT id, title FROM challenges WHERE id = %s',
    #         (habit['challenge_id'],)
    #     )
    #     challenge = cur.fetchone()

    # Get all challenges for dropdown
    cur = db.cursor()
    cur.execute(
        'SELECT id, title FROM challenges WHERE creator_id = %s ORDER BY title',
        (g.user['id'],)
    )
    challenges = cur.fetchall()
    cur.close()

    # Get challenge title if habit belongs to one
    challenge_title = None
    if habit['challenge_id']:
        for c in challenges:
            if c['id'] == habit['challenge_id']:
                challenge_title = c['title']
                break

    return jsonify({
        "habit": habit,
        "challenge_title": challenge_title,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "challenges": challenges
    }), 200

    # return render_template(
    #     'dashboard/view.jinja',
    #     habit=habit,
    #     days_data=days_data,
    #     current_streak=current_streak,
    #     longest_streak=longest_streak,
    #     weeks=weeks,
    #     challenge=challenge,
    #     week_offset=week_offset,
    #     is_current_week=is_current_week,
    #     can_go_prev=can_go_prev,
    #     can_go_next=can_go_next,
    #     selected_week_monday=selected_week_monday,
    #     selected_week_sunday=selected_week_sunday
    # )



@bp.route('/<int:id>', methods=('PUT',))
@login_required
def update(id):
    # make sure it exists
    get_habit_(id)

    data = request.get_json()
    name = data.get('name')
    tier = data.get('tier')
    notes = data.get('notes')
    time_of_day = data.get('time_of_day')

    if not name:
        return jsonify({"error": "Name is required."}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute(
        'UPDATE habits'
        ' SET name = %s, tier = %s, notes = %s, time_of_day = %s'
        ' WHERE id = %s',
        (name, tier, notes, time_of_day, id)
    )
    db.commit()
    cur.close()
    

    return jsonify({}), 200




@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_habit_(id)
    db = get_db()
    cur = db.cursor()
    cur.execute('DELETE FROM habits WHERE id = %s', (id,))
    db.commit()
    cur.close()
    return jsonify({}),201










@bp.route('/<int:id>/move/<direction>', methods=('POST',))
@login_required
def move(id, direction):
    habit = get_habit_(id)
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



@bp.route('/')
def index():
    db = get_db()
    cur = db.cursor()

    # Get query params
    challenge_filter = request.args.get('challenge', type=int)
    # print(f"challenge_filter: {challenge_filter}")
    date_str = request.args.get('date')
    # print(f"date_str: {date_str}")
    

    # Parse date or default to today
    today = get_user_local_date()
    # print(f"today: {today}")
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
        'SELECT h.id, h.name, h.notes, h.created_at'
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
        'SELECT h.id, h.name, h.notes, h.created_at'
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

    return jsonify({                                                                                                                                                                                                                        
      "habits": habits,                                                                                                                                                                                                                   
      "habits_done": habits_done,                                                                                                                                                                                                         
      "prev_date": prev_date.isoformat(),                                                                                                                                                                                                 
      "next_date": next_date.isoformat(),                                                                                                                                                                                                 
      "today": today.isoformat()                                                                                                                                                                                                          
  })                                                                                                                                                                                                                                      

@bp.route('/habits/complete-multiple', methods=('POST',))                                                                  
@login_required                                                                                                            
def complete_multiple():                                                                                                   
    # Get the data                                                                                                         
    data = request.get_json()                                                                                              
                                                                                                                            
    if not data:                                                                                                           
        return jsonify({"error": "Request body is required"}), 400                                                         
                                                                                                                            
    habit_ids = data.get('habit_ids')                                                                                      
    date_str = data.get('date')                                                                                            
                                                                                                                            
    if not habit_ids:                                                                                                      
        return jsonify({"error": "habit_ids is required"}), 400                                                            
                                                                                                                            
    # Parse date or use today                                                                                              
    if date_str:                                                                                                           
        try:                                                                                                               
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()                                                      
        except ValueError:                                                                                                 
            log_date = get_user_local_date()                                                                               
    else:                                                                                                                  
        log_date = get_user_local_date()                                                                                   
                                                                                                                            
    db = get_db()                                                                                                          
    cur = db.cursor()                                                                                                      
                                                                                                                            
    # Complete each habit                                                                                                  
    for habit_id in habit_ids:                                                                                             
        # Make sure this habit belongs to the user                                                                         
        cur.execute(                                                                                                       
            'SELECT id FROM habits WHERE id = %s AND creator_id = %s',                                                     
            (habit_id, g.user['id'])                                                                                       
        )                                                                                                                  
        habit = cur.fetchone()                                                                                             
                                                                                                                            
        if habit is None:                                                                                                  
            continue  # Skip if habit doesn't exist or doesn't belong to user                                              
                                                                                                                            
        # Insert completion log                                                                                            
        cur.execute(                                                                                                       
            'INSERT INTO habit_logs (log_date, habit_id) VALUES (%s, %s)',                                                 
            (log_date, habit_id)                                                                                           
        )                                                                                                                  
                                                                                                                            
    db.commit()                                                                                                            
    cur.close()                                                                                                            
                                                                                                                            
    return jsonify({}), 200 