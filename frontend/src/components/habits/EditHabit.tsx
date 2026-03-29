import { useState, useEffect } from "react";

type Challenge = {
  id: number;
  title: string;
};

interface EditHabitProps {
  id: string | undefined;
  habitName: string;
  habitDesc: string;
  habitChallenge: null | number;
  onSave: () => void;
}

function EditHabit({
  id,
  habitName,
  habitDesc,
  habitChallenge,
  onSave,
}: EditHabitProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(habitName);
  const [desc, setDesc] = useState(habitDesc);
  const [challenge, setChallenge] = useState(habitChallenge);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState("");

  async function handleSave() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: name, body: desc, challenge: challenge }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      onSave();
      console.log("Saving:", name, desc);
      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  async function fetchChallenges() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/challenges/`, {
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
      setChallenges(data.challenges);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Edit Habit</button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-2xl text-calm-900 mb-4">
              Edit Habit
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-calm-700 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
                />
              </div>
              <div>
                <label className="block text-calm-700 text-sm mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
                />
              </div>
            </div>
            <div>
              <label>Challenge</label>
              <select
                value={challenge ?? ""}
                onChange={(e) =>
                  setChallenge(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">No challenge</option>
                {challenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </option>
                ))}
              </select>
            </div>

            {error && <p>{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 text-calm-500 hover:text-calm-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-calm-600 text-white rounded-lg hover:bg-calm-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditHabit;
