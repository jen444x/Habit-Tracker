import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app
)
import jwt

from psycopg2 import errors 

from werkzeug.security import check_password_hash, generate_password_hash

from habit_tracker.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def register():
    # Make sure data is available
    data = request.get_json()
    
    username = data.get('username') # 'get' returns none if key not available
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "missing field(s)"}), 400
    
    username = username.lower().strip()

    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
            (username, generate_password_hash(password))
        )

        user_id = cur.fetchone()

        db.commit()
        cur.close()

        secret_key = current_app.config['SECRET_KEY'] 

        # Create token
        token = jwt.encode({"user_id": user_id['id']}, secret_key, algorithm="HS256")   

        return jsonify({"token": token}), 201
    except errors.UniqueViolation:
        return jsonify({"error": "username is taken"}), 409


@bp.route('/login', methods=('GET', 'POST'))
def login():
    """
    Logs user in: Checks information is correct
    if it is, saves id in session and redirects to index
    if not, shows error and stays on login
    """
    if request.method == 'POST':
        # Get data
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "missing field(s)"}), 400

        username = username.lower()

        db = get_db()
        cur = db.cursor()

        # Get row data
        cur.execute(
            'SELECT * FROM users WHERE username = %s', (username,)
        )

        user = cur.fetchone()
        cur.close()
        
        # Check if user exists or password is inccorect
        if (user is None) or (not check_password_hash(user['password'], password)):
            return jsonify({"error":"One or more fields are incorrect."}), 401

        # create token
        secret_key = current_app.config['SECRET_KEY']
        token = jwt.encode({"user_id": user['id']}, secret_key, algorithm="HS256")   
        return jsonify({"token": token}), 200


@bp.before_app_request
def load_logged_in_user():
    """ 
    Runs before every request, not only those handled by bp
    checks is userid is in session,
    if it is, saves user data in g.user,
    which lasts for the length of the request 
    """
    # Get the Authorization header                                                                                            
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        g.user = None
        return
    
    # remove bearer
    bearer, encoded_token = auth_header.split()
    secret_key = current_app.config['SECRET_KEY'] 

    print(auth_header)
    # decode token
    token = jwt.decode(encoded_token, secret_key, algorithms=["HS256"])

    # get userid
    user_id = token['user_id']

    if not user_id:
        g.user = None
        return

    # fetch user from db
    db = get_db()
    cur = db.cursor()
    cur.execute(
        'SELECT * FROM users WHERE id = %s', (user_id,)
    )
    user = cur.fetchone()
    cur.close()

    # store user data in global var
    g.user = user


@bp.route('/logout')
def logout():
    """
    Log user out
    Clears sesion and redirects to index
    """
    session.clear()
    return redirect(url_for('index'))

def login_required(view):
    """
    Wrapper that checks if user is logged in
    checks if g.user exists
    if it doesnt redirects to login
    if it does proceeds as normal
    """
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({"error": "Authentication required"}), 401  
 
        
        return view(**kwargs)
    
    return wrapped_view

