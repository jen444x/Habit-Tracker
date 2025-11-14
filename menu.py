from habit_tracker import HabitsTracker
from date import get_user_due_date, get_date_obj
# Intro
linesplit = "--------------------------------"
intro = "Welcome to your habit tracker"
print(f"\n{linesplit}\n{intro.upper()}\n{linesplit}")

# Initialize habit tracker
habits = HabitsTracker('user_habits.json')
dict = habits.habits_dict

# Show habits due today
habits_due_today = habits.due_today()
if habits_due_today:
    print(f"Habits due today:")
    habits.show_habits(habits_due_today)
else:
    print("You have no habits due today!\n")

# Loop until user exits
while True:
    print(f"Options:\n"
        "\ta - Add habit\n"
        "\tc - Mark habit as completed\n"
        "\tu - Undo habit completion\n"
        "\te - Edit habit\n"
        "\td - Delete habit\n"
        "\ts - Show habit(s)\n\n"
        "\tq - Quit\n"
    )
    user_input = input("Choice: ").lower().strip()
    
    if user_input == "a":   
        name = input("\nPlease enter new habit: ")

        description = ""
        due_date = ""

        # Option to add aditional information
        print("\nOptional information:\n" \
        "\ta - Description\n" \
        "\tb - Due date\n" \
        "\tc - Description and due date\n" \
        "\td - None\n")

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

        habits.add_habit(name, description, due_date)
        print(f"\nHabit '{name}' has been successfully added.")

    elif user_input == 'c':
        # Get name of habit they want to complete
        h_name = input("\nPlease enter the name of the habit you would like to" \
        " complete: ")

        # check it exists 
        try:
            target_habit = habits.lookup(h_name)
        except KeyError:
            print("\nHabit was not found.")
            continue

        habits.complete_habit(target_habit)
        print("Habit has been marked as completed.")

    elif user_input == "e":
        # Get name of habit they want to edit
        h_name = input("\nPlease enter the name of the habit you would like to" \
        " edit: ")

        # check it exists 
        try:
            target_habit = habits.lookup(h_name)
        except KeyError:
            print("\nHabit was not found.")
            continue

        edit_input = ""
        while edit_input != 'q':
            # See what they want to edit
            options = ("\nOptions:\n" \
            "\ta - Name\n" \
            "\tb - Description\n" \
            "\tc - Due date\n\n" \
            "\tq - Return\n" \
                )
            print(options)
            edit_input = input("What would you like to edit: ").lower().strip()

            # Check if its a valid input
            valid_inputs = {'a', 'b', 'c'}
            if edit_input not in valid_inputs:
                print("ERROR: Invalid input\n")
                continue
        
            # if it does exist, ask user what to edit
            if edit_input == "a":
                # Get new habit name
                new_name = input("\nPlease enter new habit name: ").lower().strip()
                habits.edit_habit_name(target_habit, new_name)
            elif edit_input == "b":
                # Get new habit description
                new_desc = input("\nPlease enter new habit description: ") 
                habits.edit_habit_description(target_habit, new_desc)
            elif edit_input == "c":
                new_due_date = get_user_due_date()
                habits.edit_habit_due_date(target_habit, new_due_date)

            # Print habit after update
            print("Habit:")
            habits.show_habit(target_habit)
            
            # Ask user if they want to edit more
            ask_again = input("\nDid you want to make any more changes? (y/n): ").lower().strip()
            if ask_again != 'y':
                break
            

    elif user_input == "d":
        to_delete = input("\nPlease enter the name of the habit you would like to" \
        " delete: ")
        habits.delete_habit(to_delete)

    elif user_input == "s":
        # Ask user how to list habits
        print(f"\nOptions:\n"
        "\ta - Show all habits\n"
        "\ts - Show single habit\n"
        "\tt - Show habits due today\n"
        "\to - Show overdue habits\n\n"
        "\tq - Return \n"
        )

        view = input("How would you like your habits listed: ").lower().strip()
        if view == 'a':
            habits.show_all_habits()
        elif view == 's':
            h_name = input("\nPlease enter the name of the habit you would like to" \
            " see: ")

            # check it exists 
            try:
                target_habit = habits.lookup(h_name)
            except KeyError:
                print("\nHabit was not found.")
                continue
            
            habits.show_habit(target_habit)
        elif view == 't':
            habits.show_habits(habits.due_today(), "You don't have any more habits to do today")
        elif view == 'o':
            habits.show_habits(habits.overdue(), "Congrats, you have no overdue tasks!")
        elif view == 'q':
            pass
        else:
            print("Invalid input")

    elif user_input == "q":
        # Store habits when program ends
        habits.save_data()
        break
        
    else:
        print("Invalid response. Please try again")
    print(f"\n{linesplit}\n")

