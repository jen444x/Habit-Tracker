from date import is_valid_date, get_user_due_date
from datetime import datetime

class Task:
    """ Models a single task"""

    def __init__(self, name, description="", due_date=""):
        self.name = name
        self.description = description
        # Make sure it's a datetime object
        if due_date and type(due_date) == str:
            # Turn into date object
            due_date = datetime.fromisoformat(due_date).date()
            
        self.due_date = due_date


    def get_dict(self):
        """ Prepare dict to save into file """
        # Save date in ISO 8601 format so json can stringify it
        if self.due_date:
            self.due_date = self.due_date.isoformat()
        return self.__dict__
    
    # edit name
    def edit_name(self, new_task_name):
        """Edit task name"""
        old_name = self.name
     
        # Edit name attribute
        self.name = new_task_name

        # notify user
        print(f"\nTask name was changed from '{old_name}' to '{new_task_name}'.")  

    # edit description
    def edit_description(self):
        """Edit task description"""

        old_description = self.description
        # Get new task description
        new_description = input("\nPlease enter new task description: ").lower().strip()
        
        # Edit data
        self.description = new_description 

        # notify user
        print(f"\nTask description was changed from '{old_description}' to '{new_description}'.")  

    
    def edit_due_date(self):
        """Edit task due_date"""

        old_due_date = self.due_date
        new_due_date = get_user_due_date()
        
        # Edit data
        self.due_date = new_due_date 

        # notify user
        print(f"\nTask due date was changed from '{old_due_date}' to '{new_due_date}'.")  

