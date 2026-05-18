import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

interface Habit {
  id: number;
  name: string;
  tier: number;
  time_of_day: number | null;
}

const tierLabels: Record<number, string> = {
  1: "Roots",
  2: "Growth",
  3: "Flourish",
};

const timeLabels: Record<number, string> = {
  1: "Morning",
  2: "Afternoon",
  3: "Evening",
  4: "Night",
};

function GrowHorizontalPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"create" | "existing">("create");
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [tier, setTier] = useState<number | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<number | "">("");

  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCurrent() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          return;
        }
        setCurrentHabit(data.habit);
        // Default tier dropdown to the first tier above the current one
        const higherTiers = [1, 2, 3].filter((t) => t > data.habit.tier);
        setTier(higherTiers[0] ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    fetchCurrent();
  }, [id]);

  useEffect(() => {
    if (mode !== "existing") return;
    async function fetchAll() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/habits`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          return;
        }
        setAllHabits(data.habits);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    fetchAll();
  }, [mode]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentHabit || tier === null) return;

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/habits/${id}/grow-horizontal`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            notes,
            tier,
            time_of_day: timeOfDay === "" ? null : timeOfDay,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLink() {
    if (selectedExistingId === null) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/habits/${id}/link`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ other_id: selectedExistingId }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  const higherTiers = currentHabit
    ? [1, 2, 3].filter((t) => t > currentHabit.tier)
    : [];

  const eligibleExisting = currentHabit
    ? allHabits.filter(
        (h) => h.tier > currentHabit.tier && h.id !== currentHabit.id,
      )
    : [];

  return (
    <div className="min-h-screen bg-linear-to-b from-calm-50 to-calm-100 px-6 py-8">
      <div className="max-w-md mx-auto">
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

        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌳</div>
          <h1 className="font-heading text-3xl text-calm-900 mb-2">
            Grow wider
          </h1>
          <p className="text-calm-500 text-sm max-w-xs mx-auto">
            Add a linked habit in another tier. Completing the harder one will
            auto-complete the easier one.
          </p>
        </div>

        {currentHabit && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-xs text-calm-400 uppercase tracking-wide mb-1">
              Linking from
            </p>
            <p className="text-calm-900 text-sm font-medium">
              {currentHabit.name}
            </p>
            <p className="text-xs text-calm-500 mt-0.5">
              {tierLabels[currentHabit.tier]}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-6 bg-calm-100 p-1 rounded-xl">
          <button
            onClick={() => setMode("create")}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "create"
                ? "bg-white text-calm-900 shadow-sm"
                : "text-calm-500 hover:text-calm-700"
            }`}
          >
            Create new
          </button>
          <button
            onClick={() => setMode("existing")}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "existing"
                ? "bg-white text-calm-900 shadow-sm"
                : "text-calm-500 hover:text-calm-700"
            }`}
          >
            Use existing
          </button>
        </div>

        {currentHabit && higherTiers.length === 0 && (
          <p className="text-center text-calm-500 text-sm py-8">
            This habit is already at the highest tier — nothing wider to grow
            into.
          </p>
        )}

        {mode === "create" && higherTiers.length > 0 && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-calm-700 text-sm mb-2 font-medium">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Wake up by 9am"
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes about this habit"
                className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
              />
            </div>

            <div>
              <label className="block text-calm-700 text-sm mb-2 font-medium">
                Tier
              </label>
              <select
                value={tier ?? ""}
                onChange={(e) => setTier(Number(e.target.value))}
                className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900"
              >
                {higherTiers.map((t) => (
                  <option key={t} value={t}>
                    {tierLabels[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-calm-700 text-sm mb-2 font-medium">
                Time of day
                <span className="text-calm-400 font-normal"> (optional)</span>
              </label>
              <select
                value={timeOfDay}
                onChange={(e) =>
                  setTimeOfDay(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900"
              >
                <option value="">Any time</option>
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>
                    {timeLabels[t]}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              disabled={isLoading || !name.trim()}
              className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create & Link"}
            </button>
          </form>
        )}

        {mode === "existing" && higherTiers.length > 0 && (
          <div>
            {eligibleExisting.length === 0 ? (
              <p className="text-center text-calm-500 text-sm py-8">
                No habits at a higher tier to link to.
              </p>
            ) : (
              <ul className="space-y-2 mb-4">
                {eligibleExisting.map((h) => {
                  const selected = selectedExistingId === h.id;
                  return (
                    <li
                      key={h.id}
                      onClick={() => setSelectedExistingId(h.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selected
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-white border-calm-200 hover:border-calm-300"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          selected ? "text-white" : "text-calm-900"
                        }`}
                      >
                        {h.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          selected ? "text-white/80" : "text-calm-500"
                        }`}
                      >
                        {tierLabels[h.tier]}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center mb-3">{error}</p>
            )}

            <button
              onClick={handleLink}
              disabled={isLoading || selectedExistingId === null}
              className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Linking..." : "Link Habits"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GrowHorizontalPage;
