import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import ShowHabits from "../components/habits/ShowHabits";
import BottomNav from "../components/layout/BottomNav";

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date"); // null if not set

  const navigate = useNavigate();

  function handleClick() {
    navigate("/create");
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      <Header title="Your Habits" body="1% better everyday" />
      <ShowHabits selectedDate={selectedDate} />
      <button
        onClick={handleClick}
        className="w-full mt-4 py-3 text-calm-500 hover:text-calm-700 text-sm transition-colors"
      >
        + Add habit
      </button>
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
