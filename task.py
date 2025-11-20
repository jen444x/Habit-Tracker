from datetime import date

class Task:
    """ Models a single task"""

    def __init__(self, name, description="", due_date="", completed = False):
        self.name = name
        self.description = description
        # Make sure it's a datetime object
        if due_date:
            # Turn into date object
            due_date = date.fromisoformat(due_date).date()
        self.due_date = due_date
        self.completed = completed

    def complete_task(self):
        """ Mark task as completed """
        self.completed = True

    def get_dict(self):
        # print(self.due_date)
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
    def edit_description(self, new_desc):
        """Edit task description"""

        old_description = self.description
    
        # Edit data
        self.description = new_desc 

        # notify user
        print(f"\nTask description was changed from '{old_description}' to '{new_desc}'.")  

    
    def edit_due_date(self, new_due_date):
        """Edit task due_date"""

        old_due_date = self.due_date
        
        # Edit data
        self.due_date = new_due_date 

        # notify user
        print(f"\nTask due date was changed from '{old_due_date}' to '{new_due_date}'.")  

