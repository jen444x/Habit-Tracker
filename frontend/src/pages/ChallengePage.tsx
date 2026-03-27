import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import Header from "../components/layout/Header";
import ShowChallengeHabits from "../components/ShowChallengeHabits";

function ChallengePage() {
  const { id } = useParams();
  const [challengeName, setChallengeName] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");

  const navigate = useNavigate();

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

  async function handleClick() {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    const url = `${import.meta.env.VITE_API_URL}/challenges/${id}/delete`;
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
        console.log(data.error);
        return;
      }
      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      <Header title={challengeName} body={challengeDesc} />

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}
      <p>{startDate}</p>
      <ShowChallengeHabits id={Number(id)} />

      <div className="max-w-md mx-auto">
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-red-50 text-red-500 text-sm rounded-lg hover:bg-red-100 transition-colors mb-4"
        >
          Delete Challenge
        </button>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="w-full text-calm-500 text-sm hover:text-calm-700 transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

export default ChallengePage;
