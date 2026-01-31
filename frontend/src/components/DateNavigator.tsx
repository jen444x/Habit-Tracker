interface DateNavigatorProps {
  selectedDate: string;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBackToToday: () => void;
}

function DateNavigator({
  selectedDate,
  isToday,
  onPrev,
  onNext,
  onBackToToday,
}: DateNavigatorProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={onPrev}
        className="p-2 text-gray-400 hover:text-calm-600 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="text-center">
        <span className="text-lg font-medium text-gray-700">
          {isToday ? "Today" : formatDate(selectedDate)}
        </span>
        {!isToday && (
          <button
            onClick={onBackToToday}
            className="block text-xs text-calm-500 hover:text-calm-600 mx-auto"
          >
            Back to today
          </button>
        )}
      </div>

      {!isToday ? (
        <button
          onClick={onNext}
          className="p-2 text-gray-400 hover:text-calm-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : (
        <div className="p-2 w-9"></div>
      )}
    </div>
  );
}

export default DateNavigator;
