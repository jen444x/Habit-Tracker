import { useState, useEffect } from "react";

interface ShowChallengeDataProps {
  id: number;
}

function ShowChallengeData({ id }: ShowChallengeDataProps) {
  const [challengeName, setChallengeName] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");

  async function fetchChallenge() {
    const url = `${import.meta.env.VITE_API_URL}/challenges/${id}`;
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
      // Get challenge data
      const challenge = data.challenge;

      setChallengeName(challenge.title);
      if (challenge.body) {
        setChallengeDesc(challenge.body);
      }
      setStartDate(challenge.created_at);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    }
  }

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  return (
    <>
      <p>{startDate}</p>
    </>
  );
}

export default ShowChallengeData;
