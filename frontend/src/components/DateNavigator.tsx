import { useNavigate } from "react-router-dom";

interface DateNavigatorProps {
  prevDate: string;
  nextDate: string;
  selectedDate: string | null;
}

function DateNavigator({ prevDate, nextDate, selectedDate }: DateNavigatorProps) {
  const navigate = useNavigate();

  // Format date for display (e.g., "Sat, Mar 22")
  function formatDate(dateStr: string | null): string {
    if (!dateStr) {
      return "Today";
    }
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  // Check if we're viewing today
  const today = new Date().toISOString().split("T")[0];
  const isToday = !selectedDate || selectedDate === today;

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <button
        onClick={() => navigate(`?date=${prevDate}`)}
        className="text-calm-400 hover:text-calm-600 transition-colors text-lg"
      >
        &larr;
      </button>

      <button
        onClick={() => !isToday && navigate("/dashboard")}
        className={`text-calm-700 font-medium ${!isToday ? "hover:text-calm-900 cursor-pointer" : ""}`}
      >
        {formatDate(selectedDate)}
      </button>

      <button
        onClick={() => navigate(`?date=${nextDate}`)}
        className="text-calm-400 hover:text-calm-600 transition-colors text-lg"
      >
        &rarr;
      </button>
    </div>
  );
}

export default DateNavigator;
