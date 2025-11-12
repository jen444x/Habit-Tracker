import json

from task import Task

# Download tasks from file
def get_tasks(lst, dict, filename):
    """ Add stored tasks to list """

    try:
        with open(filename, 'r') as f:
            # Read file
            contents = f.read()
    except FileNotFoundError:
        # If file does not exist, that means we haven't saved any tasks
        return

    # Turn into py object
    try:
        tasks = json.loads(contents)
    except json.decoder.JSONDecodeError:
        # No data or similar issue. We wont load date in this case
        return

    for task in tasks:
        # Create new class instances
        task_instance = Task(**task)
        
        # Add to list
        lst.append(task_instance)
        # Add to dict
        dict[(task_instance.name).lower().strip()] = task_instance

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

get_tasks([], {}, 'test_file.json')