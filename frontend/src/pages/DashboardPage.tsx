import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ShowHabits from "../components/ShowHabits";
import BottomNav from "../components/BottomNav";

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date"); // null if not set

  const navigate = useNavigate();

  function handleClick() {
    navigate("/create");
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12 pb-24">
      <Header title="Your Habits" body="1% better everyday" />
      <ShowHabits selectedDate={selectedDate} onAddHabit={handleClick} />
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
