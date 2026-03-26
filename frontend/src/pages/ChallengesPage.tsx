import { useNavigate } from "react-router";
import Header from "../components/Header";
import ShowChallenges from "../components/ShowChallenges";
import BottomNav from "../components/BottomNav";

function ChallengesPage() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/challenges/create");
  }
  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12 pb-24">
      <Header title="Challenges" body="Push your limits" />
      <ShowChallenges />

      <button
        onClick={handleClick}
        className="w-full mt-4 py-3 text-calm-500 hover:text-calm-700 text-sm transition-colors"
      >
        + Add challenge
      </button>
      <BottomNav />
    </div>
  );
}

export default ChallengesPage;
