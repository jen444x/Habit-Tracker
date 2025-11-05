# create new task
def add_task(tasks, task):
    """ Add task to set of tasks """
    # lowercase version is key, user formatted is value
    task_lower = task.lower()
    tasks[task_lower] = task

    # Make sure it was succesfuly added
    if task_lower in tasks and tasks[task_lower] == task:
        return True
    else:
        return False

# delete task
def delete_task(tasks, task):
    """ Delete task """
    removed_task = tasks.pop(task, None)

    if removed_task:
        return True
    else:
        return False
    


# edit task
def edit_task(tasks, task):
    """ Edit task """
    
    # Remove task 
    task_lower = task.lower()
    deleted = delete_task(tasks, task_lower)

    if not deleted:
        print("\nTask '{task}' was not found.")
        return False

    # Add new task    
    new_task_name = input("\nPlease enter new task name: ")
    added = add_task(tasks, new_task_name)

    if not added:
        print("\nTask was not successfully edited.")
        return False

    print(f"\n'{task}' was successfully changed to '{new_task_name}'.")


# print tasks
def show_tasks(tasks):
    """ Show all tasks """
    print("\nCurrent tasks:")
    for i, task in enumerate(tasks.values()):
        print(f"{i+1}. {task}")
