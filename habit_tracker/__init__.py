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
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
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

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    from . import db
    db.init_app(app)        

    from . import auth
    app.register_blueprint(auth.bp)

    return app