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
    let url = `${import.meta.env.VITE_API_URL}/${habit.id}`;

    if (done) {
      url = url + "/undo_complete";
    } else {
      url = url + "/complete";
    }
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      if (selectedDate) {
        formData.append("date", selectedDate);
      }
      const res = await fetch(url, {
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
    <div>
      <li
        onClick={handleClick}
        className="bg-white border border-calm-200 rounded-xl px-4 py-4 flex items-center gap-3"
      >
        <input
          type="checkbox"
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()} // prevents li click when clicking checkbox
          className="w-6 h-6 rounded-full border-2 border-calm-300 flex-shrink-0"
        />
        <span className="text-calm-900">{habit.title}</span>
      </li>
    </div>
  );
}

export default HabitListItem;
