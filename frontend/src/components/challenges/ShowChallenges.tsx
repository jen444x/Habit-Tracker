import { useState, useEffect } from "react";
import ChallengeListItem from "./ChallengeListItem";

type Challenge = {
  id: number;
  title: string;
  body: string;
};

function ShowChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function fetchChallenges() {
    setIsLoading(true);
    setChallenges([]);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/challenges/`, {
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

      setChallenges(data.challenges);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (!isLoading && challenges.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-calm-500">No challenges yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {isLoading && (
        <p className="text-center text-calm-500 mt-6">Loading challenges...</p>
      )}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {challenges.length > 0 && (
        <ul className="space-y-3">
          {challenges.map((challenge) => (
            <ChallengeListItem key={challenge.id} challenge={challenge} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShowChallenges;
