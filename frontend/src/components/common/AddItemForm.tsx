import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../layout/Header";

interface AddItemFormProps {
  item: string;
}

function AddItemForm({ item }: AddItemFormProps) {
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [habitTier, setHabitTier] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    let url = `${import.meta.env.VITE_API_URL}`;

    if (item === "habit") {
      url = url + "/habits";
    } else if (item === "challenge") {
      url = url + "/challenges/create";
    } else {
      setError("Unidentified item");
      return;
    }

    const payload: { name: string; notes: string; tier: number } = {
      name: habitName,
      notes: habitDesc,
      tier: habitTier,
    };

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      navigate(-1);
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
      <Header title={`New ${item}`} body="Start something meaningful" />

      {/* Form */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-calm-700 text-sm mb-2 font-medium capitalize">
              {item} name
            </label>
            <input
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              type="text"
              placeholder="Title"
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

          {item === "habit" && (
            <div>
              <label className="block text-calm-700 text-sm mb-2 font-medium">
                Tier
              </label>
              <select
                value={habitTier}
                onChange={(e) => setHabitTier(Number(e.target.value))}
                className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
              >
                <option value={habitTier}>{habitTier}</option>
                {[1, 2, 3]
                  .filter((num) => num !== habitTier)
                  .map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button
            disabled={isLoading}
            className="w-full bg-calm-600 text-white capitalize py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : `Add ${item}`}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 text-calm-500 text-sm hover:text-calm-700 transition-colors"
        >
          ← Back to {item}s
        </button>
      </div>
    </div>
  );
}

export default AddItemForm;
