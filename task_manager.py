from db import get_tasks, store_tasks

class TaskManager:
    """ Models task manager """

    def __init__(self):
        """ Initializes list and adds stored tasks """

        self.task_list = []

        # Add stored tasks if any
        get_tasks(self.task_list)

    def save_data(self):
        """ Saves data in file """
        
        store_tasks(self.task_list)