import { useState, useEffect, useRef } from "react";

type Habit = {
  title: string;
  body: string;
  challenge_id: number;
};

type Challenge = {
  id: number;
  title: string;
  body: string;
};

interface EditHabitProps {
  habit: Habit;
}

function EditItemForm({ habit }: EditHabitProps) {
  const [habitName, setHabitName] = useState("");
  const [habitBody, setHabitBody] = useState("");
  const [challengeId, setChallengeId] = useState(habit.challenge_id);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchChallenges();
  }, [habit]);
  return (
    <>
      <h1>hi</h1>
      <form>
        <label>name</label>
        <input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          type="text"
          placeholder={habit.title}
        ></input>

        <label>Body</label>
        <input
          value={habitBody}
          onChange={(e) => setHabitBody(e.target.value)}
          type="text"
          placeholder={habit.body}
        />
        {error && <p>error</p>}
        <div>
          <label>Challenge</label>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className={challengeId ? "text-calm-900" : "text-calm-400"}>
                {challengeId
                  ? challenges.find((c) => String(c.id) === challengeId)?.title
                  : "Link to a challenge"}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-calm-200 rounded-xl shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setChallengeId("");
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    challengeId === ""
                      ? "bg-calm-50 text-calm-900"
                      : "text-calm-600 hover:bg-calm-50"
                  }`}
                >
                  No challenge
                </button>
                {challenges.map((challenge) => (
                  <button
                    type="button"
                    key={challenge.id}
                    onClick={() => {
                      setChallengeId(String(challenge.id));
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      challengeId === String(challenge.id)
                        ? "bg-calm-50 text-calm-900"
                        : "text-calm-600 hover:bg-calm-50"
                    }`}
                  >
                    {challenge.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

export default EditItemForm;
