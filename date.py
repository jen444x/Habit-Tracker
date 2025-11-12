from datetime import date

# Check if valid date format
def is_valid_date(date_):
    """ Check date using datetime lib"""

    date_list = date_.split('/')

    # didnt use 2 / 
    if len(date_list) != 3:
        return False
    
    # Make sure they are digits are numbers
    for s in date_list:
        # if empty
        if len(s) == 0:
            return False
        for c in s:
            if not c.isdigit():
                return False
            
    return True


def get_date_obj(date_str):
    """Turn date str into obj"""

    date_list = date_str.split('/')

    # turn each field into an int
    month, day, year = map(int, date_list)
    
    try:
        # create date object
        date_obj = date(year, month, day)
    except:
        return None
    
    return date_obj

# get due date
def get_user_due_date():
    """ Prompt user for due date"""

    due_date = input("Please enter due date (MM/DD/YYYY): ")

    is_valid = is_valid_date(due_date)

    while not is_valid:
        due_date = input("Due date was invalid. " \
        "Make sure to use the following format MM/DD/YY: ")

        is_valid = is_valid_date(due_date)

    return due_date

def tasks_due_on(tasks, due_on):
    today = date.today()
    due = []

    # Look through tasks date
    for task in tasks:
        # Skip if due date is not provided
        if not task.due_date:
            continue

        if due_on == 'today' and task.due_date == today:
            due.append(task)
        elif due_on == 'overdue' and task.due_date < today:
            due.append(task)
        elif due_on == 'future' and task.due_date > today:
            due.append(task)

    return due

        

# tasks_due_today()

