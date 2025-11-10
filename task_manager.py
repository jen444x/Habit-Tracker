from task import Task
from db import get_tasks, store_tasks
from date import get_user_due_date, tasks_due_on

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
        self.tasks_dict[(task).lower().strip()] = new_task

        return True
    
    # Find task
    def lookup(self, task):
        """ Find Task """
        print(f"all: {self.tasks_dict}")

        # Find reference with dictionary
        return self.tasks_dict[task.lower().strip()]

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
                # Get new task name
                new_task_name = input("\nPlease enter new task name: ").lower().strip()
                old_name = t_name.lower().strip()

                target_task.edit_name(new_task_name)
                
                # Create new key val pair with updated name
                self.tasks_dict[new_task_name] = target_task

                # delete old one
                del self.tasks_dict[old_name]
            elif user_input == "b":
                target_task.edit_description()
            elif user_input == "c":
                target_task.edit_due_date()

            # Print task after update
            print(target_task.name)
        
            self.show_task(target_task.name)
                

            # Ask user if they want to edit more
            ask_again = input("\nDid you want to make any more changes? (y/n): ").lower().strip()
            if ask_again == 'y':
                print(options)
                user_input = input("What would you like to edit: ").lower().strip()
            else:
                return 
            
    def show_task(self, t_name):
        """ Show one task """
        print(f"t_name: {t_name}")

        try:
            task = self.lookup(t_name)
        except KeyError:
            print("Task does not exist.")
            return
        
        # Print data
        print(f"\nName: {task.name}")
        if task.description:
            print(f"Description: {task.description}")
        if task.due_date:
            print(f"Due date: {task.due_date}")
    
    def show_tasks(self, tasks):
        """ Show all tasks """

        print("\nCurrent tasks:")
        for i, task in enumerate(tasks):
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

    def show_all_tasks(self):
        """ Shows all tasks """

        self.show_tasks(self.tasks_list)

    def show_tasks_on_date(self, date):
        """ Show tasks based on date """

        if date == 'today':
            tasks = tasks_due_on(self.tasks_list, date)
        elif date == 'overdue':
            tasks = tasks_due_on(self.tasks_list, date)
        elif date == 'future':
            tasks = tasks_due_on(self.tasks_list, date)

        # Print tasks
        self.show_tasks(tasks)


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
        del self.tasks_dict[t_name.lower().strip()]

        print(f"\nTask '{t_name}' was successfully deleted.")

    def save_data(self):
        """ Saves data in file """
        
        store_tasks(self.tasks_list)