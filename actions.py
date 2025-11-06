# create new task
def add_task(tasks, task):
    """ Add task to set of tasks """

    # Create new task dict
    new_task = {'name': task, 'name_lower': task.lower()}

    # Add dict to list
    tasks.append(new_task)

    return True

# delete task
def delete_task(tasks, task):
    """ Delete task """

    # check it exists and save map
    found = False
    for curr_task in tasks:       
        if curr_task['name_lower'] == task.lower():
            target_task = curr_task
            found = True

    # Notify if wan't found
    if found == False:
        return False

    # Remove if it was found
    tasks.remove(target_task)   
    return True         

# edit task
def edit_task(tasks, task):
    """ Edit task """
    
    # check it exists 
    for curr_task in tasks:
        if curr_task['name_lower'] == task.lower():
            # Get new task name
            new_task_name = input("\nPlease enter new task name: ")

            # Edit data
            curr_task['name'] = new_task_name
            curr_task['name_lower'] = new_task_name.lower()
            return True

   # Return false if wasn't found
    return False

# print tasks
def show_tasks(tasks):
    """ Show all tasks """

    print("\nCurrent tasks:")
    for i, task in enumerate(tasks):
        print(f"{i+1}. {task['name']}")
