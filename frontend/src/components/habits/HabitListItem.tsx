import { useNavigate } from "react-router";

interface Habit {
  id: number;
  title: string;
}

interface DoneProps {
  habit: Habit;
  onComplete: () => void;
  done: boolean;
  selectedDate: string | null;
}

function HabitListItem({ habit, onComplete, done, selectedDate }: DoneProps) {
  const navigate = useNavigate();
  async function handleClick() {
    // go to single habit page
    navigate(`/${habit.id}`);
  }

  async function handleChange() {
    const url = `${import.meta.env.VITE_API_URL}/${habit.id}`;
    const fetchUrl = done ? `${url}/undo_complete` : `${url}/complete`;
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      if (selectedDate) {
        formData.append("date", selectedDate);
      }
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
      }
      onComplete();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <li
      onClick={handleClick}
      className={`bg-white border rounded-xl pl-3 pr-4 py-4 flex items-center gap-3 cursor-pointer transition-colors ${
        done ? "border-calm-100" : "border-calm-200 hover:border-calm-300"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange();
        }}
        className="p-2 -m-2 shrink-0"
      >
        <span
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            done
              ? "bg-calm-500 border-calm-500 text-white"
              : "border-calm-300"
          }`}
        >
          {done && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </button>
      <span className={`${done ? "text-calm-400 line-through" : "text-calm-900"}`}>
        {habit.title}
      </span>
    </li>
  );
}

export default HabitListItem;
