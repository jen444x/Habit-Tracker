import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

function ChallengesPage() {
  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12 pb-24">
      <Header title="Challenges" body="Push your limits" />
      <div className="mt-8 text-center text-gray-500">
        Coming soon...
      </div>
      <BottomNav />
    </div>
  );
}

export default ChallengesPage;
