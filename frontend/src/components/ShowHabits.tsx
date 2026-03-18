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
    <div className="mt-8">
      <h2 className="text-calm-700 text-sm font-medium mb-4 uppercase tracking-wide">
        Your habits
      </h2>
      <ul className="space-y-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="bg-white border border-calm-200 rounded-xl px-4 py-4 flex items-center gap-3"
          >
            <div className="w-5 h-5 rounded-full border-2 border-calm-300 flex-shrink-0" />
            <span className="text-calm-900">{habit.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowHabits;
