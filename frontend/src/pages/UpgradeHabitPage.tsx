import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

function UpgradeHabitPage() {
  const [originalName, setOriginalName] = useState("");
  const [habitName, setHabitName] = useState("");
  const [habitBody, setHabitBody] = useState("");
  const [habitChallenge, setHabitChallenge] = useState<number | null>(null);
  const [habitStage, setHabitStage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  async function fetchHabit() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      const habitData = data.habit;
      setOriginalName(habitData.title);
      setHabitName(habitData.title);
      setHabitBody(habitData.body);
      setHabitChallenge(habitData.challenge_id);
      setHabitStage(habitData.stage ? habitData.stage + 1 : 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    fetchHabit();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: habitName,
          desc: habitBody,
          challengeId: habitChallenge,
          stage: habitStage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-calm-50 to-calm-100 px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 mb-6 text-calm-600 hover:text-calm-800 transition-colors"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🌱</div>
          <h1 className="font-heading text-3xl text-calm-900 mb-2">
            Grow Your Habit
          </h1>
          <p className="text-calm-500 text-sm max-w-xs mx-auto">
            Ready for more? Create a stronger version to keep evolving.
          </p>
        </div>

        {/* Current → New flow */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-calm-400 uppercase tracking-wide mb-1">
                Current
              </p>
              <p className="text-calm-700 text-sm">{originalName}</p>
            </div>
            <div className="text-calm-300">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-teal-500 uppercase tracking-wide mb-1">
                Next level
              </p>
              <p className="text-calm-900 text-sm font-medium">
                {habitName || "..."}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-calm-700 text-sm mb-2 font-medium">
              New version
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g., Run 3 miles instead of 2"
              className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
            />
          </div>

          <div>
            <label className="block text-calm-700 text-sm mb-2 font-medium">
              Description
              <span className="text-calm-400 font-normal"> (optional)</span>
            </label>
            <input
              type="text"
              value={habitBody}
              onChange={(e) => setHabitBody(e.target.value)}
              placeholder="What makes this version harder?"
              className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            disabled={isLoading}
            className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Habit"}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-xs text-calm-400 mb-2">Ideas for leveling up</p>
          <p className="text-xs text-calm-500">
            Increase duration • Add intensity • Remove a crutch
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpgradeHabitPage;
