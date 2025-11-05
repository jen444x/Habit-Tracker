from task_actions import add_task, edit_task, delete_task, get_tasks
# Intro
intro = "Welcome to your task manager"
print(f"\n{intro.upper()}")

# Set to hold tasks
tasks = set()

# Loop until user exits
continue_loop = True
while (continue_loop):
    print(
        f"\nWhat action would you like to complete?\n\n"
        "A - Add task\n"
        "E - Edit task\n"
        "D - Delete task\n"
        "S - Show all tasks\n\n"
        "Q - Quit\n"
    )
    user_input = input("Action: ").lower().strip()

    if user_input == "a":
        new_task = input("Please enter new task: ")
        add_task(tasks, new_task)
    elif user_input == "e":
        edit_task(tasks)
    elif user_input == "d":
        delete_task(tasks)
    elif user_input == "s":
        get_tasks(tasks)
    elif user_input == "q":
        continue_loop = False
    else:
        print("Invalid response. Please try again")

