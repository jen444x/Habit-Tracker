from task import Task

def valid_day(day, month, year):
    """ Check if day is valid """

    # Used basic date check, will improve later with timetdate library
    
    """
    1. January (31 days)
    2. February (28 days in a common year and 29 days in leap years)
    3. March (31 days)
    4. April (30 days)
    5. May (31 days)
    6. June (30 days)
    7. July (31 days)
    8. August (31 days)
    9. September (30 days)
    10. October (31 days)
    11. November (30 days)
    12. December (31 days)
    """

    days_in_month = {
        1:31,
        2:28,
        3:31,
        4:30,
        5:31,
        6:30,
        7:31,
        8:31,
        9:30,
        10:31,
        11:3,
        12:31
    }

    # Check if day is not in valid range
    if day > 0 and day < days_in_month[month]:
        return True

    """
    General rule: A year is a leap year if it is divisible by 4.
    Century year exception: A year divisible by 100 is not a leap year.
    Century year exception to the exception: A year divisible by 400 is a leap year. 
    """
    # check if it is a leap year for February
    if month == 2 and day == 29:
        if year % 4 == 0 and year % 100 != 0:
            return True
        if year % 400 == 0:
            return True
    
    # If none were true, not valid day
    return False

# Check if valid date format
def is_valid_date(date):
    date_list = date.split('/')

    # didnt use 2 / 
    if len(date_list) != 3:
        return False
    
    # Check vals are numbers
    for s in date_list:
        # make sure field is not empty
        if len(s) == 0:
            return False
        for c in s:
            if not c.isdigit():
                return False

    # turn each field into an int
    month, day, year = map(int, date_list)

    # Check month
    if month < 1 or month > 12:
        return False
    
    # Check day
    if not valid_day(day, month, year):
        return False
    
    # Check year
    if year < 2025:
        return False
    
    return True


# get due date
def get_user_due_date():
    """ Prompt user for due date"""

    due_date = input("Please enter due date (MM/DD/YYYY): ")

    valid_date = is_valid_date(due_date)

    while not valid_date:
        due_date = input("Due date was invalid. " \
        "Make sure to use the following format MM/DD/YY: ")

        valid_date = is_valid_date(due_date)
    
    return due_date

# create new task
def add_task(tasks, task):
    """ Add task to set of tasks """

    description = ""
    due_date = ""

    # Option to add aditional information
    user_input = input("\nWould you like to include any of the information to your task?\n\n" \
    "a - Add description\n" \
    "b - Add due date\n" \
    "c - Add description and due date\n" \
    "d - Do not include any additional information.\n").lower().strip()
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
    tasks.append(new_task)

    return True

# Find task
def lookup(tasks, task):
    """ Find Task """
    # check it exists and save map
    task_lowered = task.lower()
    for task_instance in tasks:       
        if task_instance.name_lowered == task_lowered:
            return task_instance

    return None

# delete task
def delete_task(tasks, task):
    """ Delete task """

    # check it exists and save dict
    target_task = lookup(tasks, task)

    if not target_task:
        return False
    
    # Remove if it was found
    tasks.remove(target_task)   
    return True 

# edit name
def edit_name(task):
    """Edit task name"""
    old_name = task.name
    # Get new task name
    new_task_name = input("\nPlease enter new task name: ")
    
    # Edit data
    task.name = new_task_name
    task.name_lowered = new_task_name.lower()  

    # notify user
    print(f"\nTask name was changed from '{old_name}' to '{new_task_name}'.")  

# edit description
def edit_description(task):
    """Edit task description"""
    old_description = task.description
    # Get new task description
    new_description = input("\nPlease enter new task description: ")
    
    # Edit data
    task.description = new_description 

    # notify user
    print(f"\nTask description was changed from '{old_description}' to '{new_description}'.")  

# edit due date
def edit_due_date(task):
    """Edit task due_date"""
    old_due_date = task.due_date

    new_due_date = input("Please enter new due date (MM/DD/YYYY): ")

    valid_date = is_valid_date(new_due_date)

    while not valid_date:
        new_due_date = input("Due date was invalid. " \
        "Make sure to use the following format MM/DD/YY: ")

        valid_date = is_valid_date(new_due_date)
    
    # Edit data
    task.due_date = new_due_date 

    # notify user
    print(f"\nTask due date was changed from '{old_due_date}' to '{new_due_date}'.")  

# edit task
def edit_task(tasks, task):
    """ Edit task """
    # See what they want to edit
    attribute_to_edit = input("\nPlease chose what you would like to edit:\n\n" \
    "a - Name\n" \
    "b - Description\n" \
    "c - Due date\n\n" \
    "d - Return\n\n" \
        ).lower().strip()

    if attribute_to_edit == "d":
        return False
    
    # check it exists, if not notify user
    target_task = lookup(tasks, task)
    if not target_task:
        print("\nTask was not found.")
        return False
    
    # if it does exist, ask user what to edit
    if attribute_to_edit == "a":
        edit_name(target_task)
    elif attribute_to_edit == "b":
        edit_description(target_task)
    elif attribute_to_edit == "c":
        edit_due_date(target_task)

    return True

# print tasks
def show_tasks(tasks):
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

