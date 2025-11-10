from task import Task
from db import get_tasks, store_tasks
from date import get_user_due_date

class TaskManager:
    """ Models task manager """

    def __init__(self):
        """ Initializes list and adds stored tasks """

        # List to hold order
        self.tasks_list = []
        # Dictionary for fast lookup
        self.tasks_dict = {}

        # Add stored tasks in list and dict, if any
        get_tasks(self.tasks_list, self.tasks_dict)

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

        # Add object to list and dict
        self.tasks_list.append(new_task)
        self.tasks_dict[(task).lower] = new_task

        return True
    
    # Find task
    def lookup(self, task):
        """ Find Task """

        # Find reference with dictionary
        return self.tasks_dict[task.lower()]

    # edit task
    def edit_task(self, t_name):
        """ Edit task """

        # check it exists 
        try:
            target_task = self.lookup(t_name)
        except KeyError:
            print("\nTask was not found.")
            return 

        # See what they want to edit
        options = ("\nOptions:\n" \
        "a - Name\n" \
        "b - Description\n" \
        "c - Due date\n\n" \
        "q - Return\n" \
            )
        
        print(options)
        
        user_input = input("What would you like to edit: ").lower().strip()

        while user_input != 'q':
            # Check if its a valid input
            valid_inputs = {'a', 'b', 'c'}
            if user_input not in valid_inputs:
                print("Invalid input")
                return 
        
            # if it does exist, ask user what to edit
            if user_input == "a":
                target_task.edit_name()
            elif user_input == "b":
                target_task.edit_description()
            elif user_input == "c":
                target_task.edit_due_date()
                

            # Ask user if they want to edit more
            ask_again = input("Did you want to make any more changes? (y/n): ").lower().strip()
            if ask_again == 'y':
                print(options)
                user_input = input("What would you like to edit: ").lower().strip()
            else:
                return 
    
    # print tasks
    def show_tasks(self):
        """ Show all tasks """

        print("\nCurrent tasks:")
        for i, task in enumerate(self.tasks_list):
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

    # delete task
    def delete_task(self, t_name):
        """ Delete task """

        # check it exists and save dict
        try:
            target_task = self.lookup(t_name)
        except KeyError:
            print("\nTask was not found.")
            return 
        
        # Remove from list and map
        self.tasks_list.remove(target_task)  
        del self.tasks_dict[t_name.lower()]

        print(f"\nTask '{t_name}' was successfully deleted.")

    def save_data(self):
        """ Saves data in file """
        
        store_tasks(self.tasks_list)