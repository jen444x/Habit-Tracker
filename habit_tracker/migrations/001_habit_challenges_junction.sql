-- Migration: Convert habits.challenge_id to many-to-many relationship
-- Run this against your Railway PostgreSQL database

-- Step 1: Create the junction table
CREATE TABLE IF NOT EXISTS habit_challenges (
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    PRIMARY KEY (habit_id, challenge_id)
);

-- Step 2: Migrate existing data from habits.challenge_id to junction table
INSERT INTO habit_challenges (habit_id, challenge_id)
SELECT id, challenge_id
FROM habits
WHERE challenge_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 3: Drop the old challenge_id column from habits
ALTER TABLE habits DROP COLUMN IF EXISTS challenge_id;
