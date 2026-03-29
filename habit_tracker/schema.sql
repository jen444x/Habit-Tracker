DROP TABLE IF EXISTS habit_logs;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS users;
DROP SEQUENCE IF EXISTS habit_family_seq;

CREATE SEQUENCE habit_family_seq;    
                                                                                                                                                                        
CREATE TABLE users (                                                                                                                                                      
    id SERIAL PRIMARY KEY,                                                                                                                                                
    username VARCHAR(50) UNIQUE NOT NULL,                                                                                                                                 
    password VARCHAR(255) NOT NULL,
    list_view BOOLEAN DEFAULT TRUE,   
    timezone VARCHAR(50) DEFAULT 'UTC'                                                                                                                         
);     

CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title VARCHAR(100) NOT NULL,     
    body TEXT NOT NULL
);

                                                                                                                                                                        
CREATE TABLE habits (                                                                                                                                                     
    id SERIAL PRIMARY KEY,                                                                                                                                                
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,   
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,                                                                                                
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),                                                                                                                        
    title VARCHAR(100) NOT NULL,                                                                                                                                          
    body TEXT NOT NULL,
    display_order INTEGER,
    stage INTEGER NOT NULL DEFAULT 1,
    family_id INTEGER NOT NULL DEFAULT nextval('habit_family_seq'),                                                     
    parent_id INTEGER REFERENCES habits(id)
);                                                                                                                                                                        
                                                                                                                                                                        
CREATE TABLE habit_logs (                                                                                                                                                 
    log_date DATE NOT NULL,                                                                                                                                                                                                                                                                    
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,                                                                                                    
    PRIMARY KEY (habit_id, log_date)                                                                                                                                      
);                                                                                                                                                                        