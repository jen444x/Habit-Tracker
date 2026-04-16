# check that app exists
def test_app_exists(app):
    assert app is not None

def test_app_is_testing(app):
    assert app.testing == True

# test creating habit without being logged in
def test_create_habit_without_login_returns_401(client):                         
      response = client.post('/habits', json={"name": "Exercise", "tier": 1})      
      assert response.status_code == 401  

# test registering with correct data
def test_register_user_returns_201(client):
    res = client.post("/auth/register", json={"username": "test", "password": "pw123"})
    assert res.status_code == 201

# test logging in with correct data
def test_login_user_returns_200(client):
    # register user first 
    client.post("/auth/register", json={"username": "test", "password": "pw123"})

    res = client.post("/auth/login", json={"username": "test", "password": "pw123"})
    assert res.status_code == 200

def test_create_habit_with_valid_data(client, auth_token):  # will use same client
    # create habit
    res = client.post(                                                      
        '/habits',                                                               
        json={"name": "Exercise", "tier": 1},                                    
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )    
    
    assert res.status_code == 201