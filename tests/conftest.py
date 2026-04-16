import pytest
from habit_tracker import create_app
from habit_tracker.db import get_db

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
        'DB_NAME': 'habit_tracker_test',
        'SECRET_KEY': 'test-secret-key-thats-long-enough-for-jwt', 
    })
    return app

@pytest.fixture                                                                                                                                                            
def client(app):              # ← asks for app fixture                                                                                                                     
    yield app.test_client()

    # Cleanup: delete all data after each test                                   
    with app.app_context():                                                      
        db = get_db()                                                            
        cur = db.cursor()                                                        
        cur.execute("DELETE FROM habit_logs")                                    
        cur.execute("DELETE FROM habits")                                        
        cur.execute("DELETE FROM challenges")                                    
        cur.execute("DELETE FROM users")                                         
        db.commit()                                                              
        cur.close()    

