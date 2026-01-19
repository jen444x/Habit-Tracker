import psycopg2
from psycopg2.extras import RealDictCursor  

import click
from flask import current_app, g

def get_db():
    if 'db' not in g:   # if theres not a db connection create one
        g.db = psycopg2.connect(
            database=current_app.config['DB_NAME'],                                                
            user=current_app.config['DB_USER'],                                                    
            host=current_app.config['DB_HOST'],                                                    
            port=current_app.config['DB_PORT'],  
            password=current_app.config['DB_PASSWORD'], 
            cursor_factory=RealDictCursor  # converts tuples into dicts
        )

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    cur = db.cursor()                                                                      
                                                                                             
    with current_app.open_resource('schema.sql') as f:                                     
        cur.execute(f.read().decode('utf8'))                                               
                                                                                             
    db.commit()                                                                            
    cur.close()  


@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)