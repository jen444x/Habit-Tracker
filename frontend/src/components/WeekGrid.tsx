interface DayData {
  date: string;
  completed: boolean;
  inFuture: boolean;
  beforeHabit: boolean;
}

interface WeekGridProps {
  days: DayData[];
}

function WeekGrid({ days }: WeekGridProps) {
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return {
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.getDate().toString().padStart(2, "0"),
    };
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const { weekday, day: dayNum } = formatDay(day.date);
        return (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{weekday}</span>
            <div
              className={`w-8 h-8 rounded-md ${
                day.inFuture || day.beforeHabit
                  ? "bg-gray-100 border border-dashed border-gray-300"
                  : day.completed
                    ? "bg-calm-500"
                    : "bg-gray-200"
              }`}
              title={`${day.date}${day.completed ? " - Completed" : day.inFuture ? " - Future" : day.beforeHabit ? " - Before habit created" : ""}`}
            ></div>
            <span className="text-xs text-gray-400">{dayNum}</span>
          </div>
        );
      })}
    </div>
  );
}

export default WeekGrid;
