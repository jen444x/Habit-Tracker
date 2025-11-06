from actions import add_task, edit_task, delete_task, show_tasks

# Intro
linesplit = "--------------------------------"
intro = "Welcome to your task manager"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

# Map to hold individual task
# will save task name in lower for lookup and regular as user inputted
# List to hold all tasks
tasks = []

# Loop until user exits
while True:
    print(
        f"\nWhat action would you like to complete?\n\n"
        "A - Add task\n"
        "E - Edit task\n"
        "D - Delete task\n"
        "S - Show all tasks\n\n"
        "Q - Quit\n"
    )
    user_input = input("Action: ").lower().strip()

    if user_input == "q":
        break
    
    elif user_input == "a":
        new_task = input("\nPlease enter new task: ")
        added = add_task(tasks, new_task)
        if added:
            print(f"\nTask '{new_task}' has been successfully added.")
        else:
            print(f"\nERROR: Task '{new_task}' was not successfully added.")

    elif user_input == "e":
        to_edit = input("\nPlease enter the name of the task you would like to" \
        " edit: ")
        edited = edit_task(tasks, to_edit)
        if edited:
            print(f"\nTask '{to_edit}' was successfully edited.")
        else:
            print("\nTask was not found.")

    elif user_input == "d":
        to_delete = input("\nPlease enter the name of the task you would like to" \
        " delete: ")
        deleted = delete_task(tasks, to_delete)
        if deleted:
            print(f"\nTask '{to_delete}' was successfully deleted.")
        else:
            print("\nTask was not found.")

    elif user_input == "s":
        show_tasks(tasks)
        
    else:
        print("Invalid response. Please try again")
    print(linesplit)

