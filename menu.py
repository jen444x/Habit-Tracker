from task_manager import TaskManager
from date import get_user_due_date, tasks_due_on
# Intro
linesplit = "--------------------------------"
intro = "Welcome to your task manager"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

# Initialize task manager
tm = TaskManager('user_tasks.json')
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
        name = input("\nPlease enter new task: ")

        description = ""
        due_date = ""

        # Option to add aditional information
        print("\nOptional information:\n" \
        "a - Description\n" \
        "b - Due date\n" \
        "c - Description and due date\n" \
        "d - None\n")

        user_input = input("\nWhat information would you like to include: ").lower().strip()
        print()

        if user_input == 'a':
            description = input("Please enter description: ")
        elif user_input == 'b':
            due_date = get_user_due_date()
        elif user_input == 'c':
            description = input("Please enter description: ")
            due_date = get_user_due_date()
        elif user_input == 'd':
            pass
        else:
            print("\nInvalid input.")
            print(f"Task '{name}' was not successfully added.")
            continue

        tm.add_task(name, description, due_date)
        print(f"\nTask '{name}' has been successfully added.")

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

