import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

function UpgradeHabitPage() {
  const [habitName, setHabitName] = useState("");
  const [habitBody, setHabitBody] = useState("");
  const [habitChallenge, setHabitChallenge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  async function fetchHabit() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
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

      const habitData = data.habit;
      setHabitName(habitData.title);
      setHabitBody(habitData.body);
      setHabitChallenge(habitData.challenge_id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }
  useEffect(() => {
    fetchHabit();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(habitChallenge);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: habitName,
          desc: habitBody,
          challengeId: habitChallenge,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      navigate(`/dashboard`);
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
    <>
      <p>Create updated habit</p>

      <form onSubmit={handleSubmit}>
        <label>new name</label>
        <input
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />

        <label>new body</label>
        <input
          type="text"
          value={habitBody}
          onChange={(e) => setHabitBody(e.target.value)}
        />
        <button disabled={isLoading}>
          {isLoading ? "Upgrading..." : "Upgrade Habit"}
        </button>
      </form>
      {error && <p>{error}</p>}
    </>
  );
}

export default UpgradeHabitPage;
