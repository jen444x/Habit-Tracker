import ToDo from "./Todo";

function ShowHabits({ habits }) {
  if (habits.length === 0) {
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
        {habits.map((habit) => (
          <ToDo key={habit.id} habit={habit} />
        ))}
      </ul>
    </div>
  );
}

export default ShowHabits;
