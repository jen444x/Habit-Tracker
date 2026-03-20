import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

function HabitPage() {
  const { id } = useParams();
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function fetchHabit() {
    const url = `${import.meta.env.VITE_API_URL}/${id}`;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }
      // Get habit data
      const habit = data.habit;

      setHabitName(habit.title);
      if (habit.body) {
        setHabitDesc(habit.body);
      }

      // Get streak data
      setCurrentStreak(data.current_streak);
      setLongestStreak(data.longest_streak);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    } finally {
    }
  }

  useEffect(() => {
    fetchHabit();
  }, []);

  async function handleClick() {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    const url = `${import.meta.env.VITE_API_URL}/${id}/delete`;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
        return;
      }
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="font-heading text-4xl text-calm-900 mb-2">
          {habitName}
        </h1>
        {habitDesc && <p className="text-calm-600 text-sm">{habitDesc}</p>}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      {/* Streak Stats */}
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-calm-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-heading text-calm-600 mb-1">
              {currentStreak}
            </div>
            <p className="text-calm-500 text-sm">Current Streak</p>
          </div>
          <div className="bg-white border border-calm-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-heading text-calm-600 mb-1">
              {longestStreak}
            </div>
            <p className="text-calm-500 text-sm">Longest Streak</p>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="px-4 py-2 bg-red-50 text-red-500 text-sm rounded-lg hover:bg-red-100 transition-colors mb-4"
        >
          Delete Habit
        </button>

        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-calm-500 text-sm hover:text-calm-700 transition-colors"
        >
          ← Back to habits
        </button>
      </div>
    </div>
  );
}

export default HabitPage;
