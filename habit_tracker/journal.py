import os
import json
from flask import Blueprint, jsonify, request, g
from openai import OpenAI

from habit_tracker.db import get_db

bp = Blueprint('journal', __name__, url_prefix='/api/journal')

client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))


def login_required(view):
    from functools import wraps
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'Authentication required'}), 401
        return view(**kwargs)
    return wrapped_view


def extract_insights(content):
    """Use OpenAI to extract structured insights from journal entry."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Extract structured insights from journal entries. Return only valid JSON."},
                {"role": "user", "content": f"""Extract from this journal entry:
- emotions: array of emotions (happy, anxious, motivated, tired, etc)
- wins: array of positive things mentioned
- struggles: array of challenges mentioned
- energy_level: one of "low", "medium", "high"

Journal entry: {content}

Return JSON only."""}
            ],
            temperature=0.3
        )

        result = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if result.startswith('```'):
            result = result.split('```')[1]
            if result.startswith('json'):
                result = result[4:]

        return json.loads(result)
    except Exception as e:
        # Fallback if OpenAI fails
        return {
            "emotions": [],
            "wins": [],
            "struggles": [],
            "energy_level": "medium",
            "error": str(e)
        }


@bp.route('', methods=['POST'])
@login_required
def create_entry():
    """Create a new journal entry with AI extraction."""
    data = request.get_json()

    if not data or not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400

    content = data['content'].strip()

    # Extract insights with OpenAI
    extracted = extract_insights(content)

    # Save to database
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'INSERT INTO journal_entries (user_id, content, extracted_data) '
        'VALUES (%s, %s, %s) RETURNING id, created_at',
        (g.user['id'], content, json.dumps(extracted))
    )
    result = cur.fetchone()
    db.commit()
    cur.close()

    return jsonify({
        'id': result['id'],
        'content': content,
        'extracted_data': extracted,
        'created_at': result['created_at'].isoformat()
    }), 201


@bp.route('', methods=['GET'])
@login_required
def get_entries():
    """Get all journal entries for current user."""
    db = get_db()
    cur = db.cursor()

    cur.execute(
        'SELECT id, content, extracted_data, created_at '
        'FROM journal_entries WHERE user_id = %s '
        'ORDER BY created_at DESC',
        (g.user['id'],)
    )
    entries = cur.fetchall()
    cur.close()

    return jsonify({
        'entries': [
            {
                'id': e['id'],
                'content': e['content'],
                'extracted_data': e['extracted_data'],
                'created_at': e['created_at'].isoformat()
            }
            for e in entries
        ]
    })
