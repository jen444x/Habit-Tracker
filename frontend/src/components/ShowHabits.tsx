import Habit from "./HabitListItem";

interface Habit {
  id: number;
  title: string;
}

interface ShowHabitsProps {
  habits: Habit[];
  habitsDone: Habit[];
  onComplete: () => void;
}

function ShowHabits({ habits, habitsDone, onComplete }: ShowHabitsProps) {
  if (habits.length === 0 && habitsDone.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🌱</div>
        <p className="text-calm-500">No habits yet</p>
        <p className="text-calm-400 text-sm mt-1">Add your first habit above</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-calm-700 text-sm font-medium mb-4 uppercase tracking-wide">
        Your habits
      </h2>
      <ul className="space-y-3">
        {habits.map((habit: Habit) => (
          <Habit
            key={habit.id}
            habit={habit}
            onComplete={onComplete}
            done={false}
          />
        ))}
      </ul>
      ----
      <ul className="space-y-3">
        {habitsDone.map((habit: Habit) => (
          <Habit
            key={habit.id}
            habit={habit}
            onComplete={onComplete}
            done={true}
          />
        ))}
      </ul>
    </div>
  );
}

export default ShowHabits;
