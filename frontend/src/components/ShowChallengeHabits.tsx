import { useState, useEffect } from "react";

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

  async function fetchHabits() {
    const url = `${import.meta.env.VITE_API_URL}/challenges/${id}/habits`;
    const token = localStorage.getItem("token");

    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: "GET",
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
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            {habit.title} {habit.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowChallengeHabits;
