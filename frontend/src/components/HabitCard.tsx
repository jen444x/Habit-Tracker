import { Link } from "react-router-dom";
import type { Habit } from "../api";

interface HabitCardProps {
  habit: Habit;
  onComplete: () => void;
  onMove?: (direction: "up" | "down") => void;
  showReorder?: boolean;
}

function HabitCard({ habit, onComplete, onMove, showReorder = true }: HabitCardProps) {
  const isCompleted = habit.completed;

  return (
    <div
      className={`rounded-xl px-4 py-3 transition-all duration-150 ${
        isCompleted
          ? "bg-gray-50 border-2 border-gray-300"
          : "bg-white shadow-lg/30 border-2 border-calm-500"
      }`}
    >
      <div className="flex flex-row items-center gap-3">
        {/* Reorder buttons - only show for incomplete habits */}
        {showReorder && !isCompleted && onMove && (
          <div className="flex flex-col">
            <button
              onClick={() => onMove("up")}
              className="text-gray-300 hover:text-calm-500 transition-colors"
              title="Move up"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              onClick={() => onMove("down")}
              className="text-gray-300 hover:text-calm-500 transition-colors"
              title="Move down"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Habit title */}
        <Link
          to={`/habit/${habit.id}`}
          className="habit flex-1 min-w-0 hover:opacity-70 transition-opacity"
        >
          <h3
            className={`font-black text-xl ${
              isCompleted
                ? "text-gray-400 line-through"
                : "text-calm-600"
            }`}
          >
            {habit.title}
          </h3>
        </Link>

        {/* Complete/Undo button */}
        <button
          onClick={onComplete}
          className={`group w-8 h-8 rounded-full cursor-pointer transition-colors duration-150 flex items-center justify-center ${
            isCompleted
              ? "bg-calm-500 hover:bg-calm-400"
              : "border-2 border-calm-500 hover:bg-calm-500"
          }`}
          title={isCompleted ? "Undo" : "Complete"}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              isCompleted
                ? "text-white"
                : "text-calm-500 group-hover:text-white"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default HabitCard;
