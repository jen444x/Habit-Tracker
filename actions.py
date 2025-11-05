# create new task
def add_task(tasks, task):
    """ Add task to set of tasks """
    tasks.add(task)
    print(f"\nTask '{task}' has been successfully added.")

# edit task
def edit_task(tasks, task):
    """ Edit task """
    if task in tasks:
        new_task_name = input("\nPlease enter new task name: ")
        tasks.remove(task)
        tasks.add(new_task_name)
        print(f"\n'{task}' was successfully changed to '{new_task_name}'.")
    else: 
        print("\nTask name was not found.")


# delete task
def delete_task(tasks, task):
    """ Delete task """
    if task in tasks:
        tasks.remove(task)
        print(f"\nTask '{task}' has been successfully deleted.")

    else: 
        print("Task name was not found.")

# print tasks
def show_tasks(tasks):
    """ Show all tasks """
    print("\nCurrent tasks:")
    for i, task in enumerate(tasks):
        print(f"{i+1}. {task}")
