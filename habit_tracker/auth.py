import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from werkzeug.security import check_password_hash, generate_password_hash

from habit_tracker.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('register', methods=('GET', 'POST'))
def register():
    """ 
    Register user:
    if successful redirects to login
    if not shows error and stays on register
    """ 
    if request.method =='POST': 
        # Get data
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        # Make sure both fields were entered
        if not username or not password:
            error = "Both fields are required."

        if error is None:
            try:
                db.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password))
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} is already registered."
            else:
                return redirect(url_for("auth.login"))
            
        flash(error)

    return render_template('auth/auth_form.jinja', form_title='Sign Up', button_text='Sign Up')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    """
    Logs user in: Checks information is correct
    if it is, saves id in session and redirects to index
    if not, shows error and stays on login
    """
    if request.method == 'POST':
        # Get data
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        # Make sure fields were entered
        if not username or not password:
            error = "Both fields are required."

        # Get row data
        if error is None:
            user = db.execute(
                'SELECT * FROM user WHERE username = ?', (username,)
            ).fetchone()
            
            # Check if user exists
            if user is None:
                error = 'One or more fields are incorrect.'
        
            # Check password 
            if user and not check_password_hash(user['password'], password):
                error = 'One or more fields are incorrect.'

        if error is None:
            # session is a dict that stores data across requests
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))
        
        flash (error)

    return render_template('auth/auth_form.jinja', form_title='Welcome Back', button_text='Log In')


@bp.before_app_request
def load_logged_in_user():
    """ 
    Runs before every request, not only those handled by bp
    checks is userid is in session,
    if it is, saves user data in g.user,
    which lasts for the length of the request 
    """
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        db = get_db()
        user = db.execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()

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
            return redirect(url_for('auth.login'))
        
        return view(**kwargs)
    
    return wrapped_view

