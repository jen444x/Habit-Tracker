interface Habit {
  id: number;
  title: string;
}

interface ToDoProps {
  habit: Habit;
}

function ToDo({ habit }: ToDoProps) {
  return (
    <div>
      <li className="bg-white border border-calm-200 rounded-xl px-4 py-4 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-calm-300 flex-shrink-0" />
        <span className="text-calm-900">{habit.title}</span>
      </li>
    </div>
  );
}

export default ToDo;
