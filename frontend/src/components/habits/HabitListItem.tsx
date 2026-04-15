import { useNavigate } from "react-router";
import SkipHabit from "./SkipHabit";

interface Habit {
  id: number;
  name: string;
  stage: number;
}

interface HabitListItemProps {
  habit: Habit;
  onComplete: () => void;
  status: "incomplete" | "completed" | "skipped";
  selectedDate: string | null;
}

function HabitListItem({
  habit,
  onComplete,
  status,
  selectedDate,
}: HabitListItemProps) {
  const navigate = useNavigate();
  async function handleClick() {
    // go to single habit page
    navigate(`/${habit.id}`);
  }

  async function handleChange() {
    const url = `${import.meta.env.VITE_API_URL}/${habit.id}`;
    let fetchUrl;
    if (status === "completed") {
      fetchUrl = `${url}/undo_complete`;
    } else if (status === "skipped") {
      fetchUrl = `${url}/undo_skip`;
    } else {
      fetchUrl = `${url}/complete`;
    }
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

  // Styles based on status
  const borderStyle = {
    incomplete: "border-calm-200 hover:border-calm-300",
    completed: "border-calm-100",
    skipped: "border-calm-100",
  }[status];

  const checkboxStyle = {
    incomplete: "border-calm-300",
    completed: "bg-calm-500 border-calm-500 text-white",
    skipped: "border-dashed border-calm-300",
  }[status];

  const textStyle = {
    incomplete: "text-calm-900",
    completed: "text-calm-400 line-through",
    skipped: "text-calm-400 italic",
  }[status];

  return (
    <li
      className={`bg-white border rounded-xl pl-3 pr-4 py-4 flex items-center gap-3 transition-colors ${borderStyle}`}
    >
      {/* Complete button */}
      <button onClick={handleChange} className="p-2 -m-2 shrink-0">
        <span
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checkboxStyle}`}
        >
          {status === "completed" && (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {status === "skipped" && (
            <svg
              className="w-3.5 h-3.5 text-calm-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          )}
        </span>
      </button>

      {/* Habit name */}
      <span
        onClick={handleClick}
        className={`flex-1 -my-4 py-4 cursor-pointer ${textStyle}`}
      >
        {habit.name}
      </span>

      {/* Habit Stage */}
      <span className="text-xs font-medium text-calm-500 bg-calm-100 px-2 py-0.5 rounded-full">
        Stage {habit.stage}
      </span>

      {/* Skip button - only show for incomplete */}
      {status === "incomplete" && (
        <SkipHabit
          id={habit.id}
          selectedDate={selectedDate}
          onComplete={onComplete}
        />
      )}
    </li>
  );
}

export default HabitListItem;
