import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import EditHabit from "../components/habits/EditHabit";
import ShowHabitFamily from "../components/habits/ShowHabitFamily";

function HabitPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [habitLevel, setHabitLevel] = useState<number | null>(null);
  const [habitChallenge, setHabitChallenge] = useState<number | null>(null);
  const [challengeName, setChallengeName] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  async function fetchHabit() {
    setDataLoaded(false);
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

      const habit = data.habit;
      setHabitName(habit.title);
      setHabitDesc(habit.body || "");
      setHabitLevel(habit.tier);
      setHabitChallenge(habit.challenge_id || null);
      setFamilyId(habit.family_id);
      setChallengeName(data.challenge_title || null);
      setCurrentStreak(data.current_streak);
      setLongestStreak(data.longest_streak);
      setDataLoaded(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    fetchHabit();
  }, [id]);

  async function handleDelete() {
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
        setError(data.error);
        return;
      }
      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-calm-50 to-calm-100 px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 text-calm-600 hover:text-calm-800 transition-colors"
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

          <button
            onClick={() => setIsEditOpen(true)}
            className="p-2 -mr-2 text-calm-600 hover:text-calm-800 transition-colors"
            aria-label="Edit habit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-calm-100 rounded-full mb-4">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-heading text-3xl text-calm-900 capitalize mb-1">
            {habitName}
          </h1>
          {habitDesc && (
            <p
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className={`text-gray-400 text-sm max-w-xs mx-auto cursor-pointer ${
                isDescExpanded ? "" : "line-clamp-2"
              }`}
            >
              {habitDesc}
            </p>
          )}
          {challengeName && habitChallenge && (
            <button
              onClick={() => navigate(`/challenges/${habitChallenge}`)}
              className="mt-3 inline-block px-3 py-1 bg-teal-50 text-teal-600 text-xs rounded-full hover:bg-teal-100 transition-colors"
            >
              {challengeName}
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-3xl font-heading text-calm-800 mb-1">
              {currentStreak}
            </div>
            <p className="text-calm-500 text-xs uppercase tracking-wide">
              Current Streak
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-3xl font-heading text-calm-800 mb-1">
              {longestStreak}
            </div>
            <p className="text-calm-500 text-xs uppercase tracking-wide">
              Longest Streak
            </p>
          </div>
        </div>

        {familyId && id && (
          <ShowHabitFamily familyId={familyId} id={Number(id)} />
        )}
        {/* Delete */}
        <div className="pt-8 text-center">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete Habit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {habitLevel && dataLoaded && (
        <EditHabit
          id={id}
          habitName={habitName}
          habitDesc={habitDesc}
          habitLevel={habitLevel}
          habitChallenge={habitChallenge}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={fetchHabit}
        />
      )}
    </div>
  );
}

export default HabitPage;
