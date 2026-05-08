from flask import Blueprint, jsonify, g

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

bp = Blueprint('insights', __name__, url_prefix='/insights')

client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))


@bp.route('/')
@login_required
def get_insights():
    db = get_db()
    cur = db.cursor()
    user_id = g.user['id']

    # Query 1: Completion rates per habit
    cur.execute('''
        SELECT
            h.name,
            COUNT(CASE WHEN hl.status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN hl.status = 'skipped' THEN 1 END) as skipped
        FROM habits h
        LEFT JOIN habit_logs hl ON h.id = hl.habit_id
            AND hl.log_date >= CURRENT_DATE - INTERVAL '30 days'
        WHERE h.creator_id = %s
        GROUP BY h.id, h.name
    ''', (user_id,))
    habit_stats = cur.fetchall()

    # Query 2: Skip reasons
    cur.execute('''
        SELECT h.name, hl.reason, hl.log_date
        FROM habit_logs hl
        JOIN habits h ON h.id = hl.habit_id
        WHERE hl.status = 'skipped'
          AND hl.reason IS NOT NULL
          AND h.creator_id = %s
          AND hl.log_date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY hl.log_date DESC
    ''', (user_id,))
    skip_reasons = cur.fetchall()

    cur.close()

    # Build the prompt with user's actual data
    prompt = "Here's my habit data for the last 30 days:\n\n"

    prompt += "## Habit Performance\n"
    for stat in habit_stats:
        total = stat['completed'] + stat['skipped']
        rate = (stat['completed'] / total * 100) if total > 0 else 0
        prompt += f"- {stat['name']}: {stat['completed']} completed, {stat['skipped']} skipped ({rate:.0f}% success)\n"

    prompt += "\n## Skip Reasons\n"
    for skip in skip_reasons:
        prompt += f"- {skip['name']} on {skip['log_date']}: \"{skip['reason']}\"\n"

    prompt += "\nBased on this data, give me 3 specific insights about my patterns and actionable suggestions. Reference my actual data, not generic advice."

    # Call OpenAI
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You're a supportive habit coach. Give brief, specific insights based only on the user's data. No generic wellness advice. Be warm but concise."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=500
    )

    insights_text = response.choices[0].message.content

    return jsonify({
        "insights": insights_text,
        "habit_stats": [dict(row) for row in habit_stats],
        "skip_count": len(skip_reasons)
    })
