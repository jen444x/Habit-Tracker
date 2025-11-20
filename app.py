from flask import Flask, render_template, request, redirect, url_for

from habit_tracker import HabitsTracker

# create instance
app = Flask(__name__)

# Initialize habit tracker
habit_tracker = HabitsTracker('user_habits.json')
finished_habits = HabitsTracker('user_finished_habits.json')

# start it
# add route that will trigger function
@app.get('/')
def index_get():
    all_habits = habit_tracker.get_all_habit_dicts()
    return render_template("index.jinja", habits=all_habits)

@app.post('/')
def index_post():
    # get data
    newhabit = request.form['newhabit']

    # Add Habit
    description = ""
    due_date = ""
    habit_tracker.add_habit(newhabit, description, due_date)
    
    # save to files
    habit_tracker.save_data('user_habits.json')
    
    # redirect to get index
    return redirect(url_for("index_get"))

# debug true so when i save changes, website changes
if __name__ == "__main__":
    app.run(debug=True)
    # app.run()




