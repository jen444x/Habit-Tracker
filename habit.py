from datetime import datetime

class Habit:
    """ Models a single habit"""

    def __init__(self, name, completed = False, description="", due_date=""):
        self.name = name
        self.completed = completed
        self.description = description
        # Make sure it's a datetime object
        if due_date and type(due_date) == str:
            # Turn into date object
            due_date = datetime.fromisoformat(due_date).date()
        self.due_date = due_date
        # Will keep track of how many days this habit has been up
        self.created_at = datetime.date.today()
        self.days_completed = []
        # This would be days it wasnt completed
        # self.days_incompleted = []

    def complete_habit(self):
        """ Mark habit as completed """
        self.completed = True


    def get_dict(self):
        """ Prepare dict to save into file """
        # Save date in ISO 8601 format so json can stringify it
        if self.due_date:
            self.due_date = self.due_date.isoformat()
        return self.__dict__
    
    # edit name
    def edit_name(self, new_habit_name):
        """Edit habit name"""
        old_name = self.name
     
        # Edit name attribute
        self.name = new_habit_name

        # notify user
        print(f"\nHabit name was changed from '{old_name}' to '{new_habit_name}'.")  

    # edit description
    def edit_description(self, new_desc):
        """Edit habit description"""

        old_description = self.description
    
        # Edit data
        self.description = new_desc 

        # notify user
        print(f"\nHabit description was changed from '{old_description}' to '{new_desc}'.")  

    
    def edit_due_date(self, new_due_date):
        """Edit habit due_date"""

        old_due_date = self.due_date
        
        # Edit data
        self.due_date = new_due_date 

        # notify user
        print(f"\nHabit due date was changed from '{old_due_date}' to '{new_due_date}'.")