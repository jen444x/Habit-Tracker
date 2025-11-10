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
    print(f"Options:\n"
        "a - Add task\n"
        "e - Edit task\n"
        "d - Delete task\n"
        "s - Show task(s)\n\n"
        "q - Quit\n"
    )
    user_input = input("Choice: ").lower().strip()
    
    if user_input == "a":   
        new_task = input("\nPlease enter new task: ")

        added = tm.add_task(new_task)

        if added:
            print(f"\nTask '{new_task}' has been successfully added.")
        else:
            print(f"\nTask '{new_task}' was not successfully added.")

    elif user_input == "e":
        to_edit = input("\nPlease enter the name of the task you would like to" \
        " edit: ")
        tm.edit_task(to_edit)

    elif user_input == "d":
        to_delete = input("\nPlease enter the name of the task you would like to" \
        " delete: ")
        tm.delete_task(to_delete)

    elif user_input == "s":
        # Ask user how to list tasks
        print(f"\nOptions:\n"
        "a - Show all tasks\n"
        "o - Show one task\n"
        "d - Show tasks based on date\n\n"
        "q - Return \n"
        )

        view = input("How would you like your tasks listed: ").lower().strip()
        if view == 'a':
            tm.show_all_tasks()
        elif view == 'o':
            to_show = input("\nPlease enter the name of the task you would like to" \
            " see: ")
            tm.show_task(to_show)
        elif view == 'd':
            print(f"Options:\n"
            "t - Due today\n"
            "o - Overdue\n"
            "f - Future due\n\n"
            "q - Return \n"
            )

            due = input("What tasks would you like to see: ").lower().strip()
            if due == 't':
                tm.show_tasks_on_date('today')
            elif due == 'o':
                tm.show_tasks_on_date('overdue')
            elif due == 'f':
                tm.show_tasks_on_date('future')
            elif due == 'q':
                pass
            else:
                print("Invalid input")


            
        elif view == 'q':
            pass
        else:
            print("Invalid input")

    elif user_input == "q":
        # Store tasks when program ends
        tm.save_data()
        break
        
    else:
        print("Invalid response. Please try again")
    print(f"\n{linesplit}\n")

