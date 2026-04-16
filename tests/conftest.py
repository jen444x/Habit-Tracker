import pytest
from habit_tracker import create_app

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
    })
    return app

@pytest.fixture                                                                                                                                                            
def client(app):              # ← asks for app fixture                                                                                                                     
    return app.test_client()