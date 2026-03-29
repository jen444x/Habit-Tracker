import { useNavigate } from "react-router";

interface UpgradeHabitProps {
  id: number;
}

function UpgradeHabit({ id }: UpgradeHabitProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/habits/${id}/upgrade`)}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-calm-200 rounded-xl hover:border-calm-300 hover:bg-calm-50 transition-all group"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
        <span className="text-base">🌱</span>
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-calm-800">Grow this habit</p>
      </div>
      <svg
        className="w-4 h-4 text-calm-400 group-hover:translate-x-0.5 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}

export default UpgradeHabit;
