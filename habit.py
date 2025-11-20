from datetime import date
from task import Task

class Habit(Task):
    """Models a habit that will be repeated. Inherits form class task"""
    
    def __init__(self, name, description="", due_date="", completed = False, **kwargs):
        """Initialize attributes of the parent class"""
        super().__init__(name, description, due_date, completed)

        if kwargs:
            self.created_at = kwargs['created_at']
            self.days_completed = kwargs['days_completed']

            # Turn into date object
            self.created_at = date.fromisoformat(self.created_at)
        else:                  
            self.created_at = date.today()
            self.days_completed = []

    def last_done(self):
        """ Returns the date the habit was last completed """
        if self.days_completed:
            return self.days_completed[-1]
        return None

    def get_dict(self):
        """ Prepare dict to save into file """
        # Return dict
        
        return {
            "name": self.name,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else "",
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "days_completed": self.days_completed
        }

    def complete(self):
        """ Mark habit as completed """
        today = date.today()
        if today not in self.days_completed:
            self.days_completed.append(today)

