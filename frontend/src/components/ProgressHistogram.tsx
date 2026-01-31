interface WeekData {
  percentage: number;
  label: string;
}

interface ProgressHistogramProps {
  weeks: WeekData[];
}

function ProgressHistogram({ weeks }: ProgressHistogramProps) {
  return (
    <div className="flex items-end gap-3 h-32 overflow-x-auto">
      {weeks.map((week, index) => (
        <div key={index} className="flex flex-col items-center min-w-[3rem]">
          <span className="text-sm font-bold text-calm-600 mb-2">
            {Math.round(week.percentage)}%
          </span>
          <div
            className="w-full bg-calm-500 rounded-lg transition-all"
            style={{ height: `${Math.max(week.percentage * 1.0, 6)}px` }}
          ></div>
          <span className="text-xs text-gray-400 mt-2">{week.label}</span>
        </div>
      ))}
    </div>
  );
}

export default ProgressHistogram;
