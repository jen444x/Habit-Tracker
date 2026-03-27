import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../layout/Header";

type Challenge = {
  id: number;
  title: string;
  body: string;
};

interface AddItemFormProps {
  item: string;
}

function AddItemForm({ item }: AddItemFormProps) {
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    let url = `${import.meta.env.VITE_API_URL}`;

    if (item === "habit") {
      url = url + "/create";
    } else if (item === "challenge") {
      url = url + "/challenges/create";
    } else {
      setError("Unidentified item");
      return;
    }

    const payload: { name: string; desc: string; challengeId?: number } = {
      name: habitName,
      desc: habitDesc,
    };

    if (item === "habit" && challengeId) {
      payload.challengeId = parseInt(challengeId, 10);
    }
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

  async function fetchChallenges() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/challenges/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setChallenges(data.challenges);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    if (item === "habit") {
      fetchChallenges();
    }
  }, [item]);

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

          {item == "habit" && (
            <div>
              <label>
                Challenge
                <select
                  value={challengeId}
                  onChange={(e) => setChallengeId(e.target.value)}
                >
                  <option value="">None</option>
                  {challenges.map((challenge) => (
                    <option key={challenge.id} value={challenge.id}>
                      {challenge.title}
                    </option>
                  ))}
                </select>
              </label>
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
