import { useNavigate } from "react-router";
import Header from "../components/layout/Header";
import ShowChallenges from "../components/challenges/ShowChallenges";
import BottomNav from "../components/layout/BottomNav";

function ChallengesPage() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/challenges/create");
  }
  return (
    <>
      <Header title="Challenges" body="Push your limits" />
      <ShowChallenges />

      <div className="max-w-md mx-auto mt-8 text-center">
        <button
          onClick={handleClick}
          className="text-calm-600 hover:text-calm-500 text-sm font-medium transition-colors"
        >
          + New challenge
        </button>
      </div>

      <BottomNav />
    </>
  );
}

export default ChallengesPage;
