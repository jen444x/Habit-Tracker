import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getChallenges } from "../api";
import type { Challenge } from "../api";
import Layout from "../components/Layout";

function ChallengesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const data = await getChallenges();
        setChallenges(data.challenges);
      } catch (err) {
        console.error("Failed to load challenges:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-calm-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="font-black text-3xl text-calm-600 text-center w-full mb-6">
        Challenges
      </h1>

      {/* New challenge button */}
      <Link
        to="/challenge/new"
        className="block text-center bg-calm-600 hover:bg-calm-500 text-white py-2 rounded-lg font-bold cursor-pointer text-xl shadow-lg/30 transition-colors duration-150 mb-6"
      >
        + New Challenge
      </Link>

      {/* Challenges list */}
      <div className="flex flex-col gap-4">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            to={`/challenge/${challenge.id}`}
            className="bg-white rounded-xl px-4 py-4 shadow-lg/30 border-3 border-calm-500 hover:shadow-xl transition-all duration-150"
          >
            <h3 className="font-bold text-xl text-calm-600">{challenge.title}</h3>
          </Link>
        ))}
      </div>

      {challenges.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No challenges yet. Create one to group your habits!
        </p>
      )}
    </Layout>
  );
}

export default ChallengesList;
