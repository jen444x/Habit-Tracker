import json

from habit import Habit

# Download habits from file
def get_habits(lst, dict, filename):
    """ Add stored habits to list """

    try:
        with open(filename, 'r') as f:
            # Read file
            contents = f.read()
    except FileNotFoundError:
        # If file does not exist, that means we haven't saved any habits
        return

    # Turn into py object
    try:
        habits = json.loads(contents)
    except json.decoder.JSONDecodeError:
        # No data or similar issue. We wont load data in this case
        return

    for habit in habits:
        # Create new class instances
        habit_instance = Habit(**habit)
        
        # Add to list
        lst.append(habit_instance)
        # Add to dict
        dict[(habit_instance.name).lower().strip()] = habit_instance

# Upload habits to file
def store_habits(habits):
    """ Save habits to file """

    # Get list of dicts
    habits_dict = list(map(Habit.get_dict, habits))

    # turn into json
    habits_json = json.dumps(habits_dict, indent=4)

    with open('user_habits.json', 'w') as f:
        # write to file
        f.write(habits_json)