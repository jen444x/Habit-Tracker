import { useState } from "react";
import { useNavigate } from "react-router";

function AddHabitPage() {
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    const url = `${import.meta.env.VITE_API_URL}/create`;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: habitName, desc: habitDesc }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="font-heading text-4xl text-calm-900 mb-2">New Habit</h1>
        <p className="text-calm-600 text-sm">Start something meaningful</p>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-calm-700 text-sm mb-2 font-medium">
              Habit name
            </label>
            <input
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              type="text"
              placeholder="e.g., Morning meditation"
              className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
            />
          </div>

          <div>
            <label className="block text-calm-700 text-sm mb-2 font-medium">
              Description
            </label>
            <input
              value={habitDesc}
              onChange={(e) => setHabitDesc(e.target.value)}
              type="text"
              placeholder="Optional: add some details"
              className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Add Habit"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-4 text-calm-500 text-sm hover:text-calm-700 transition-colors"
        >
          ← Back to habits
        </button>
      </div>
    </div>
  );
}

export default AddHabitPage;
