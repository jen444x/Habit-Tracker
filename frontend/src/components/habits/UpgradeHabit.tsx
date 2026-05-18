import { useState } from "react";
import { useNavigate } from "react-router";

interface UpgradeHabitProps {
  id: number;
  canGrowTaller?: boolean;
}

function UpgradeHabit({ id, canGrowTaller = true }: UpgradeHabitProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-calm-900 mb-1 text-center">
              Grow this habit
            </h2>
            <p className="text-calm-500 text-sm text-center mb-5">
              How do you want it to grow?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!canGrowTaller) return;
                  setIsOpen(false);
                  navigate(`/habits/${id}/upgrade`);
                }}
                disabled={!canGrowTaller}
                className={`w-full flex items-center gap-3 p-4 bg-white border border-calm-200 rounded-xl transition-all text-left ${
                  canGrowTaller
                    ? "hover:border-teal-400 hover:bg-teal-50/30"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-lg shrink-0">
                  <span className="text-lg">🌿</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-calm-900">
                    Grow taller
                  </p>
                  <p className="text-xs text-calm-500">
                    {canGrowTaller
                      ? "Make it harder in the same tier"
                      : "Already grown taller from here"}
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/habits/${id}/grow-horizontal`);
                }}
                className="w-full flex items-center gap-3 p-4 bg-white border border-calm-200 rounded-xl hover:border-teal-400 hover:bg-teal-50/30 transition-all text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-lg shrink-0">
                  <span className="text-lg">🌳</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-calm-900">
                    Grow wider
                  </p>
                  <p className="text-xs text-calm-500">
                    Add a linked habit in another tier
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 text-sm text-calm-500 hover:text-calm-700 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UpgradeHabit;
