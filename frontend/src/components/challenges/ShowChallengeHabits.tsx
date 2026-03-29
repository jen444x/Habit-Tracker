import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface Habit {
  id: number;
  title: string;
  body: string;
}

interface ShowChallengeHabitsProps {
  id: number;
}

function ShowChallengeHabits({ id }: ShowChallengeHabitsProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchHabits() {
    const url = `${import.meta.env.VITE_API_URL}/challenges/${id}/habits`;
    const token = localStorage.getItem("token");

    setIsLoading(true);
    try {
      const res = await fetch(url, {
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
      setHabits(data.challenge_habits);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, [id]);

  return (
    <div className="max-w-md mx-auto">
      {isLoading && (
        <p className="text-center text-calm-500 text-sm">Loading habits...</p>
      )}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {habits.length === 0 && !isLoading && (
        <p className="text-center text-calm-400 text-sm py-4">
          No habits in this challenge
        </p>
      )}

      <ul className="space-y-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            onClick={() => navigate(`/${habit.id}`)}
            className="bg-white border border-calm-200 rounded-xl p-4"
          >
            <p className="text-calm-900 font-medium">{habit.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowChallengeHabits;
