import json

from task import Task

# Download tasks from file
def get_tasks(tasks):
    """ Add stored tasks to list """

    filename = 'user_tasks.json'
    try:
        with open(filename, 'r') as f:
            # Read file
            contents = f.read()
    except FileNotFoundError:
        # If file does not exist, that means we haven't saved any tasks
        return

    # Turn into py object
    dicts = json.loads(contents)
        
    for dict in dicts:
        # Create new class instances
        task = Task(dict['name'], dict['description'], dict['due_date'])
        # Add to list
        tasks.append(task)

# Upload tasks to file
def store_tasks(tasks):
    """ Save tasks to file """

    # Get list of dicts
    tasks_dict = list(map(Task.get_dict, tasks))

    # turn into json
    tasks_json = json.dumps(tasks_dict, indent=4)

    with open('user_tasks.json', 'w') as f:
        # write to file
        f.write(tasks_json)
