class Task:
    """ Models a single task"""

    def __init__(self, name, description=""):
        self.name = name
        self.name_lowered = name.lower()
        self.description = description