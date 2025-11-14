from habit_tracker import HabitTracker
from date import get_user_due_date, get_date_obj

# Intro
linesplit = "--------------------------------"
intro = "Welcome to your habit tracker"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

# Initialize habit tracker
tm = HabitTracker('user_habits.json')
dict = tm.habits_dict

# Loop until user exits
while True:
    print(f"Options:\n"
        "a - Add new habit\n"
        "c - Mark habit as completed\n"
        "e - Edit habit\n"
        "d - Delete habit\n"
        "s - Show habit(s)\n\n"
        "q - Quit\n"
    )
    user_input = input("Choice: ").lower().strip()
    
    if user_input == "a":   
        name = input("\nPlease enter new habit: ")

        description = ""
        due_date = ""

        # Option to add aditional information
        print("\nOptional information:\n" \
        "a - Description\n" \
        "b - Due date\n" \
        "c - Description and due date\n" \
        "d - None\n")

        user_input = input("\nWhat information would you like to include: ").lower().strip()
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
            print("\nInvalid input.")
            print(f"Habit '{name}' was not successfully added.")
            continue

        tm.add_habit(name, description, due_date)
        print(f"\nTask '{name}' has been successfully added.")

#     elif user_input == 'c':
#         # Get name of task they want to edit
#         t_name = input("\nPlease enter the name of the task you would like to" \
#         " complete: ")

#         # check it exists 
#         try:
#             target_task = tm.lookup(t_name)
#         except KeyError:
#             print("\nTask was not found.")
#             continue

#         tm.complete_task(target_task)
#         print("Task has been marked as completed.")

#     elif user_input == "e":
#         # Get name of task they want to edit
#         t_name = input("\nPlease enter the name of the task you would like to" \
#         " edit: ")

#         # check it exists 
#         try:
#             target_task = tm.lookup(t_name)
#         except KeyError:
#             print("\nTask was not found.")
#             continue

#         edit_input = ""
#         while edit_input != 'q':
#             # See what they want to edit
#             options = ("\nOptions:\n" \
#             "a - Name\n" \
#             "b - Description\n" \
#             "c - Due date\n\n" \
#             "q - Return\n" \
#                 )
#             print(options)
#             edit_input = input("What would you like to edit: ").lower().strip()

#             # Check if its a valid input
#             valid_inputs = {'a', 'b', 'c'}
#             if edit_input not in valid_inputs:
#                 print("ERROR: Invalid input\n")
#                 continue
        
#             # if it does exist, ask user what to edit
#             if edit_input == "a":
#                 # Get new task name
#                 new_name = input("\nPlease enter new task name: ").lower().strip()
#                 tm.edit_task_name(target_task, new_name)
#             elif edit_input == "b":
#                 # Get new task description
#                 new_desc = input("\nPlease enter new task description: ") 
#                 tm.edit_task_description(target_task, new_desc)
#             elif edit_input == "c":
#                 new_due_date = get_user_due_date()
#                 tm.edit_task_due_date(target_task, new_due_date)

#             # Print task after update
#             print("Task:")
#             tm.show_task(target_task)
            
#             # Ask user if they want to edit more
#             ask_again = input("\nDid you want to make any more changes? (y/n): ").lower().strip()
#             if ask_again != 'y':
#                 break
            

#     elif user_input == "d":
#         to_delete = input("\nPlease enter the name of the task you would like to" \
#         " delete: ")
#         tm.delete_task(to_delete)

#     elif user_input == "s":
#         # Ask user how to list tasks
#         print(f"\nOptions:\n"
#         "a - Show all tasks\n"
#         "o - Show one task\n"
#         "d - Show tasks based on date\n\n"
#         "q - Return \n"
#         )

#         view = input("How would you like your tasks listed: ").lower().strip()
#         if view == 'a':
#             tm.show_all_tasks()
#         elif view == 'o':
#             t_name = input("\nPlease enter the name of the task you would like to" \
#             " see: ")

#             # check it exists 
#             try:
#                 target_task = tm.lookup(t_name)
#             except KeyError:
#                 print("\nTask was not found.")
#                 continue
            
#             tm.show_task(target_task)
#         elif view == 'd':
#             print(f"Options:\n"
#             "t - Due today\n"
#             "o - Overdue\n"
#             "f - Future due\n\n"
#             "q - Return \n"
#             )

#             due = input("What tasks would you like to see: ").lower().strip()
#             if due == 't':
#                 tm.show_tasks_on_date('today')
#             elif due == 'o':
#                 tm.show_tasks_on_date('overdue')
#             elif due == 'f':
#                 tm.show_tasks_on_date('future')
#             elif due == 'q':
#                 pass
#             else:
#                 print("Invalid input")


            
#         elif view == 'q':
#             pass
#         else:
#             print("Invalid input")

#     elif user_input == "q":
#         # Store tasks when program ends
#         tm.save_data()
#         break
        
#     else:
#         print("Invalid response. Please try again")
#     print(f"\n{linesplit}\n")

