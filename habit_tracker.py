from datetime import date
from habit import Habit
from db import get_habits, store_habits
from date import get_date_obj

class HabitsTracker:
    """ Models habit tracker """

    def __init__(self, habits_file):
        """ Initializes list and adds stored habits """

        # List to hold order
        self.habits_list = []
        # Dictionary for fast lookup
        self.habits_dict = {}
        
        # Add stored habits in list and dict, if any
        get_habits(self.habits_list, self.habits_dict, habits_file)

    """ Get dict of habit info """
    def get_habit_dict(self, i):
        return self.habits_list[i].get_dict()

    def move_finished_habits(self, finished_class):
        """ Store habits whose due dates have passed in seperate class """

        today = date.today()

        for habit in self.habits_list:
            print(habit.due_date)
            if not habit.due_date:
                continue
            
            if habit.due_date < today:
                # Add to other class
                finished_class.habits_list.append(habit)
                finished_class.habits_dict[habit.name.lower().strip()] = habit

                # Remove from this habit tracker
                self.delete_habit(habit)

    def add_habit(self, name, description="", due_date=""):
        """ Create new habit instance """
        # Turn date into date obj if it's a str
        if due_date and type(due_date) == str:
            # Turn into date object
            due_date = get_date_obj(due_date)

        # Create a new habit object
        new_habit = Habit(name, description, due_date)

        # Add object to list and dict
        self.habits_list.append(new_habit)
        self.habits_dict[name.lower().strip()] = new_habit

    def get_all_habit_dicts(self):
        dict_list = []
        for habit in self.habits_list:
            dict_list.append(habit.get_dict())

        return dict_list
    
    def due_today(self, if_empty_str=""):
        """ Returns habits that are due today """
        habits_due_today = []
        for habit in self.habits_list:
            if habit.last_done():
                last_date = date.fromisoformat(last_date).date()
                if last_date == date.today():
                    continue
            # if it hasnt been done at all or the last date is not today
            habits_due_today.append(habit)

        if not habits_due_today and if_empty_str:
            print(if_empty_str)
            
        return habits_due_today
    
    def overdue(self, if_empty_str):
        """ Returns overdue habits """
        habits_overdue = []
        for habit in self.habits_list:
            if habit.last_done():
                last_date = date.fromisoformat(last_date).date()
                print(f"last_date: {last_date}")
                print(f"date.today(): {date.today()}")
                # Hasn't been done in 1 or more days
                if last_date < date.today():
                    habits_overdue.append(habit)

        if not habits_overdue and if_empty_str:
            print(if_empty_str)
            
        return habits_overdue

    # Find habit
    def lookup(self, habit):
        """ Find Habit """

        # Find reference with dictionary
        return self.habits_dict[habit.lower().strip()]

    def edit_habit_name(self, target_habit, new_habit_name):
        """ Update habit name"""
        original_name = target_habit.name

        target_habit.edit_name(new_habit_name)

        # Create new key val pair with updated name
        self.habits_dict[new_habit_name] = target_habit

        # delete old one
        del self.habits_dict[original_name]

    def edit_habit_description(self, target_habit, new_habit_desc):
        """ Update habit name"""
        target_habit.edit_description(new_habit_desc)

    def edit_habit_due_date(self, target_habit, new_habit_date):
        """ Update habit name"""
        # Turn date into date obj if it's a str
        if type(new_habit_date) == str:
            # Turn into date object
            new_habit_date = get_date_obj(new_habit_date)

        target_habit.edit_due_date(new_habit_date)
        
    def show_habit(self, habit):
        """ Show one habit """
        # Print name
        print(f"\nName: {habit.name}")
        # Description
        if habit.description:
            print(f"Description: {habit.description}")
        # Due date
        if habit.due_date:
            print(f"Due date: {habit.due_date}")
        # Complete status
        print(f"Status: ", end="")
        if habit.completed:
            print("Complete")
        else:
            print("Incomplete")

    def sort_by_due_date(self, habits):
        pass

    
    def show_habits(self, habits):
        """ Show all habits """

        for i, habit in enumerate(habits):
            # print name
            print(f"\t{i+1}. {habit.name}", end="")
            
            # print description if any
            if habit.description:
                print(f" - {habit.description}")
            # if no description was added
            else:
                # if due date was added 
                if habit.due_date:
                    # new line to format 
                    print()
                # if due date was not added
                else:
                    # we dont need to check the rest
                    print()
                    continue

            if habit.due_date:
                print(f"\t   Due: {habit.due_date}")

    def show_all_habits(self):
        """ Shows all habits """

        self.show_habits(self.habits_list)


    def delete_habit(self, habit):
        """ Delete habit """
        # Remove from list and map
        name = habit.name
        self.habits_list.remove(habit)  
        del self.habits_dict[name.lower().strip()]

    def save_data(self, file):
        """ Saves data in file """
        store_habits(self.habits_list, file)

    def complete_habit(self, habit):
        """ Mark habit as completed """
        habit.complete_habit()

    def uncomplete_habit(self, habit):
        """ Mark habit as completed """
        habit.uncomplete_habit()
