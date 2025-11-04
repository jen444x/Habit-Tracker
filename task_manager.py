# create new task
# edit task
# delete task
# get tasks

# Intro
intro = "Welcome to your task manager"
print(f"\n{intro.upper()}\n")

# Loop until user exits
continue_loop = True
while (continue_loop):
    print(
        f"What action would you like to complete\n\n"
        "A - Add task\n"
        "E - Edit task\n"
        "D - Delete task\n"
        "S - Show all tasks\n\n"
        "Q - Quit\n"
    )
    user_input = input("Action: ").lower().strip()

    if user_input == "q":
        continue_loop = False

