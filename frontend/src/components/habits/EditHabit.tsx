import { useState, useEffect } from "react";

interface EditHabitProps {
  id: string | undefined;
  habitName: string;
  habitDesc: string;
  habitLevel: number;
  habitTimeOfDay: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function EditHabit({
  id,
  habitName,
  habitDesc,
  habitLevel,
  habitTimeOfDay,
  isOpen,
  onClose,
  onSave,
}: EditHabitProps) {
  const [name, setName] = useState(habitName);
  const [desc, setDesc] = useState(habitDesc);
  const [level, setLevel] = useState(habitLevel);
  const [timeOfDay, setTimeOfDay] = useState(habitTimeOfDay);
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
        body: JSON.stringify({
          name: name,
          notes: desc,
          tier: level,
          time_of_day: timeOfDay,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      onSave();
      onClose();
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
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-2xl text-calm-900 mb-4">Edit Habit</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-calm-700 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-calm-700 text-sm mb-2">
              Description
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
            />
          </div>
          <div></div>

          {/* Level */}
          <div>
            <label className="block text-calm-700 text-sm mb-2">Level</label>
            <select
              value={level ?? ""}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
            >
              <option value={level}>{level}</option>
              {[1, 2, 3]
                .filter((num) => num !== level)
                .map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
            </select>
          </div>

          {/* Time of day */}
          <div>
            <label className="block text-calm-700 text-sm mb-2">
              Time of Day
              {typeof timeOfDay}
            </label>
            <select
              value={timeOfDay ?? ""}
              onChange={(e) =>
                setTimeOfDay(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-4 py-3 border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
            >
              <option value="">Any time</option>
              <option value={1}>Morning</option>
              <option value={2}>Afternoon</option>
              <option value={3}>Evening</option>
              <option value={4}>Night</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-calm-600 border border-calm-200 rounded-xl hover:bg-calm-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-calm-600 text-white rounded-xl hover:bg-calm-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditHabit;
