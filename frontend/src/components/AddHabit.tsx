import { useState } from "react";

function AddHabit({ onSuccess }) {
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

      // reset values
      setHabitName("");
      setHabitDesc("");
      setError("");

      onSuccess();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
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
    <div className="mb-8">
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

      {showSuccess && (
        <p className="text-calm-600 text-sm mt-3 text-center">
          ✓ New habit created
        </p>
      )}
    </div>
  );
}

export default AddHabit;
