from flask import Flask, render_template, request

from habit_tracker import HabitsTracker

# Initialize habit tracker
habits = HabitsTracker('user_habits.json')
finished_habits = HabitsTracker('user_finished_habits.json')

# create instance
app = Flask(__name__)

# start it
# add route that will trigger function
@app.route("/", methods=["GET", 'POST'])
def index():
    if request.method == 'POST':
        newhabit = request.form.get('newhabit')
        # Add Habit
        description = ""
        due_date = ""
        habits.add_habit(newhabit, description, due_date)
        # save to files
        habits.save_data('user_habits.json')
    
    return render_template("index.html")
# debug true so when i save changes, website changes
app.run(debug=True)