import os

from flask import Flask


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

    from . import chat
    app.register_blueprint(chat.bp)


    return app

