import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ShowHabits from "../components/ShowHabits";

function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [habitsDone, setHabitsDone] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function fetchHabits() {
    const url = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      }

      setHabits(data.habits);
      setHabitsDone(data.habits_done);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  function handleClick() {
    navigate("/create");
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-heading text-4xl text-calm-900 mb-2">
          Your Habits
        </h1>
        <p className="text-calm-600 text-sm">Nurture your daily growth</p>
      </div>

      {/* Add Habit Button */}
      <div className="max-w-md mx-auto mb-8">
        <button
          onClick={handleClick}
          className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors"
        >
          + Add New Habit
        </button>
      </div>

      {isLoading && (
        <p className="text-center text-calm-500 mt-6">Loading habits...</p>
      )}

      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      <ShowHabits
        habits={habits}
        habitsDone={habitsDone}
        onComplete={fetchHabits}
      />
    </div>
  );
}

export default DashboardPage;
