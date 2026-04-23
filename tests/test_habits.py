# check that app exists
def test_app_exists(app):
    assert app is not None

def test_app_is_testing(app):
    assert app.testing == True

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

"""
CREATE HABIT TESTS
"""

# test creating habit without being logged in
def test_create_habit_without_login_returns_401(client):                         
      response = client.post('/habits', json={"name": "Exercise", "tier": 1})      
      assert response.status_code == 401  

# valid data - all fields filled in
def test_create_habit_with_valid_data(client, auth_token):  # will use same client
    res = client.post(                                                      
        '/habits',                                                               
        json={"name": "Exercise", "notes": "10 pushups", "tier": 2},                                    
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )        
    assert res.status_code == 201

def test_create_habit_saves_correctly(client, auth_token):                                                                                             
    res = client.post(                                                      
        '/habits',                                                               
        json={"name": "Exercise", "notes": "10 pushups", "tier": 2},                                    
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )        

    # Assert - fetch and verify it saved                                                                                                               
    res = client.get('/habits', headers={"Authorization": f"Bearer {auth_token}"})                                                                     
                                                                                                                                          
    data = res.get_json()                                                                                                                                  
    habits = data['habits']                                                                                                                                
                                                                                                                                                            
    assert len(habits) == 1                                                                                                                                
    assert habits[0]['name'] == "Exercise"                                                                                                                 
    assert habits[0]['notes'] == "10 pushups"                                                                                                              
    assert habits[0]['tier'] == 2 

# test with empty data
def test_create_habit_with_empty_req_body(client, auth_token):
    res = client.post(                                                      
        '/habits',  
        json={},                                                                                          
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

# test with no data
def test_create_habit_with_no_req_body(client, auth_token):
    res = client.post(                                                      
        '/habits',                                                                                           
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 415

"""
Testing name being invalid
"""
# test with no name
def test_create_habit_with_name_missing(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"notes": "notess", "tier": 1},                                                                                       
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

# test with name not str
def test_create_habit_with_name_as_sing_int(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": 1, "notes": "notess", "tier": 1},                                                                                       
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400



# empty str
def test_create_habit_with_name_as_empty_str(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "", "notes": "notess", "tier": 1},                                                                                       
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

# whitespace
def test_create_habit_with_name_as_whitespace(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": " ", "notes": "notess", "tier": 1},                                                                                       
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

# str > 100 = 101
def test_create_habit_with_name_too_long(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "a" * 101, "tier": 1},         
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

# str <= 100 
def test_create_habit_with_correct_chars_len(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "a" * 100, "tier": 1}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 201

# no notes
def test_create_habit_with_no_notes(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": 1}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 201

# notes not str
def test_create_habit_with_notes_not_str(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "notes": ["cat"], "tier": 1}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

""" 
tier
"""
def test_create_habit_with_tier_too_large(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": 4}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

def test_create_habit_with_tier_too_small(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": 0}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

def test_create_habit_with_no_tier(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise"}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

def test_create_habit_with_tier_not_int(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": "cat"}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 400

def test_create_habit_with_tier_upper_range(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": 3}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 201

def test_create_habit_with_tier_lower_range(client, auth_token):
    res = client.post(                                                      
        '/habits',    
        json={"name": "Exercise", "tier": 1}, 
        headers={"Authorization": f"Bearer {auth_token}"}                             
    )     
    assert res.status_code == 201

