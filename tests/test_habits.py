from flask import g

# check that app exists
def test_app_exists(app):
    assert app is not None

def test_app_is_testing(app):
    assert app.testing == True

# returns 401 if not logged in
def test_create_habit_without_login_returns_401(client):                         
      response = client.post('/habits', json={"name": "Exercise", "tier": 1})      
      assert response.status_code == 401  

def test_register_user_returns_201(client):
    res = client.post("auth/register", json={"username": "test3", "password": "pw123"})
    assert res.status_code == 201
# def test_create_habit_with_valid_data(client):
#     response = client.post('/habits', json={"name": "Exercise", "notes": "For 5 mins", "tier": 1})    
#     assert response.status_code == 201


