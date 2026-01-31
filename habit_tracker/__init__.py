import os

from flask import Flask, send_from_directory


def create_app(test_config=None):
    # create and configure the app
    # second param tells the app that the config files are relative to the instance
    # folder The instance folder is located outside the flaskr package and can hold
    # local data that shouldn't be committed to version control, such as
    # configuration secrets and the database file.
    app = Flask(__name__, instance_relative_config=True)
    # SECRET_KEY is used by Flask and extensions to keep data safe. It's set to
    # 'dev' to provide a convenient value during development, but it should be
    # overridden with a random value when deploying.
    app.config.from_mapping(                                                                                  
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),                                                       
        DB_NAME=os.environ.get('DB_NAME', 'habit_tracker'),                                                   
        DB_USER=os.environ.get('DB_USER', 'jennifermiranda'),                                                 
        DB_HOST=os.environ.get('DB_HOST', 'localhost'),                                                                                   
        DB_PORT=os.environ.get('DB_PORT', '5432'),                                                
        DB_PASSWORD=os.environ.get('DB_PASSWORD'),                                                            
    )                                                                                                         
      

    if test_config is None:
        # load the instance config, if it exists, when not testing
        # app.config.from_pyfile() overrides the default configuration 
        # with values taken from the config.py file in the instance folder
        # if it exists. For example, when deploying, this can be used to 
        # set a real SECRET_KEY.
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        # os.makedirs() ensures that app.instance_path exists. Flask doesn’t 
        # create the instance folder automatically, but it needs to be created 
        # because your project will create the SQLite database file there.
        os.makedirs(app.instance_path)
    except OSError:
        pass


    from . import db
    db.init_app(app)        

    from . import auth
    app.register_blueprint(auth.bp)

    from . import dashboard
    app.register_blueprint(dashboard.bp)
    app.add_url_rule('/', endpoint='index')

    from . import visuals
    app.register_blueprint(visuals.bp)
    
    from . import challenges
    app.register_blueprint(challenges.bp)

    from . import chat
    app.register_blueprint(chat.bp)

    from . import api
    app.register_blueprint(api.bp)

    from . import journal
    app.register_blueprint(journal.bp)

    # Serve React build in production
    react_build_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')

    if os.path.exists(react_build_dir):
        # Serve static assets (JS, CSS, images)
        @app.route('/assets/<path:filename>')
        def serve_assets(filename):
            return send_from_directory(os.path.join(react_build_dir, 'assets'), filename)

        # Serve React app for all non-API routes (client-side routing)
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_react(path):
            # Don't intercept API routes or existing Flask routes
            if path.startswith('api/') or path.startswith('auth/') or path.startswith('challenges/') or path.startswith('visuals/'):
                return app.send_static_file('index.html')
            return send_from_directory(react_build_dir, 'index.html')

    return app

