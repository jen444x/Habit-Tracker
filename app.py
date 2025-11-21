from flask import Flask, render_template, request, redirect, url_for

from habit_tracker import HabitsTracker

# create instance
app = Flask(__name__)

# Initialize habit tracker
habit_tracker = HabitsTracker('user_habits.json')
finished_habits = HabitsTracker('user_finished_habits.json')

""" Main page """
@app.get('/')
def index_get():
    all_habits = habit_tracker.get_all_habit_dicts()
    # enumerate them
    all_habits = list(enumerate(all_habits, start=1))
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

""" Singe habit """
@app.route('/habit/<id>') 
def habit(id):
    # get data in dictionary 
    habit_data = habit_tracker.get_habit_dict(int(id))
    print(habit_data)
    # {'name': 'adding 2', 'description': '', 'due_date': '', 'completed': False, 'created_at': '2025-11-19', 'days_completed': []}
    habit_data = {'name': 'adding 2', 'description': '', 'due_date': '', 'completed': False, 'created_at': '2025-11-19'}
    return render_template("habit.jinja", habit_data=habit_data)

# debug true so when i save changes, website changes
if __name__ == "__main__":
    app.run(debug=True)
    # app.run()




