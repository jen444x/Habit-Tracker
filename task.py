class Task:
    """ Models a single task"""

    def __init__(self, name, description="", due_date=""):
        self.name = name
        self.name_lowered = name.lower()
        self.description = description
        self.due_date = due_date

    def get_dict(self):
        return self.__dict__