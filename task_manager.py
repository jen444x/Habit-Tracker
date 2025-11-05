from actions import add_task, edit_task, delete_task, show_tasks

# Intro
linesplit = "--------------------------------"
intro = "Welcome to your task manager"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

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
        new_task = input("\nPlease enter new task: ")
        add_task(tasks, new_task)
    elif user_input == "e":
        to_edit = input("\nPlease enter the name of the task you would like to" \
        " edit: ")
        edit_task(tasks, to_edit)
    elif user_input == "d":
        to_delete = input("\nPlease enter the name of the task you would like to" \
        " delete: ")
        delete_task(tasks, to_delete)
    elif user_input == "s":
        show_tasks(tasks)
    elif user_input == "q":
        continue_loop = False
    else:
        print("Invalid response. Please try again")
    print(linesplit)

