from task import Task
from db import get_tasks, store_tasks

from actions import get_user_due_date, lookup, edit_description, edit_due_date, edit_name

class TaskManager:
    """ Models task manager """

    def __init__(self):
        """ Initializes list and adds stored tasks """

        self.task_list = []

        # Add stored tasks if any
        get_tasks(self.task_list)

    def save_data(self):
        """ Saves data in file """
        
        store_tasks(self.task_list)

    def add_task(self, task):
        """ Create new task instance """

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
            print("\nInvalid input.", end="")
            return False
        
        # Create a new task object
        new_task = Task(task, description, due_date)

        # Add object to list
        self.task_list.append(new_task)

        return True


    # edit task
    def edit_task(self, task):
        """ Edit task """
        # See what they want to edit
        options = ("\nOptions:\n" \
        "a - Name\n" \
        "b - Description\n" \
        "c - Due date\n\n" \
        "q - Return\n" \
            )
        
        print(options)
        
        user_input = input("What would you like to edit: ").lower().strip()

        target_task = None
        while user_input != 'q':
            # Check if its a valid input
            valid_inputs = {'a', 'b', 'c'}
            if user_input not in valid_inputs:
                print("Invalid input")
                return False

            # check it exists, if not notify user
            if not target_task:
                target_task = lookup(self.task_list, task)
                if not target_task:
                    print("\nTask was not found.")
                    return False
        
            # if it does exist, ask user what to edit
            if user_input == "a":
                edit_name(target_task)
            elif user_input == "b":
                edit_description(target_task)
            elif user_input == "c":
                edit_due_date(target_task)

            # Ask user if they want to edit more
            ask_again = input("Did you want to make any more changes? (y/n): ").lower().strip()
            if ask_again == 'y':
                print(options)
                user_input = input("What would you like to edit: ").lower().strip()
            else:
                return True 

        return True
    
    # print tasks
    def show_tasks(self):
        """ Show all tasks """

        print("\nCurrent tasks:")
        for i, task in enumerate(self.task_list):
            # print name
            print(f"{i+1}. {task.name}", end="")
            
            # print description if any
            if task.description:
                print(f" - {task.description}")
            # if no description was added
            else:
                # if due date was added 
                if task.due_date:
                    # new line to format 
                    print()
                # if due date was not added
                else:
                    # we dont need to check the rest
                    print()
                    continue

            if task.due_date:
                print(f"   Due: {task.due_date}")

        
