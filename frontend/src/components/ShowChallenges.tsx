import { useState, useEffect } from "react";

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
    const url = `${import.meta.env.VITE_API_URL}/challenges/`;
    const token = localStorage.getItem("token");

    setIsLoading(true);
    setChallenges([]);

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
            <li
              key={challenge.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-calm-400"></div>
                <h3 className="flex-1 font-medium text-calm-900">{challenge.title}</h3>
                <svg
                  className="w-5 h-5 text-calm-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShowChallenges;
