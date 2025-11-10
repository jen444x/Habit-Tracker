from task_manager import TaskManager

# Intro
linesplit = "--------------------------------"
intro = "Welcome to your task manager"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

# Initialize task manager
tm = TaskManager()
dict = tm.tasks_dict

# Loop until user exits
while True:
    print(
        f"Options:\n"
        "A - Add task\n"
        "E - Edit task\n"
        "D - Delete task\n"
        "S - Show all tasks\n\n"
        "Q - Quit\n"
    )
    user_input = input("Please make a selection: ").lower().strip()

    if user_input == "q":
        # Store tasks when program ends
        tm.save_data()
        break
    
    elif user_input == "a":   
        new_task = input("\nPlease enter new task: ")

        added = tm.add_task(new_task)

        if added:
            print(f"\nTask '{new_task}' has been successfully added.")
        else:
            print(f"\nTask '{new_task}' was not successfully added.")

    elif user_input == "e":
        to_edit = input("\nPlease enter the name of the task you would like to" \
        " edit: \n")
        tm.edit_task(to_edit)

    elif user_input == "d":
        to_delete = input("\nPlease enter the name of the task you would like to" \
        " delete: ")
        tm.delete_task(to_delete)

    elif user_input == "s":
        tm.show_tasks()
        
    else:
        print("Invalid response. Please try again")
    print(f"\n{linesplit}\n")

