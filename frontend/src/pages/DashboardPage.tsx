import { useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import ShowHabits from "../components/habits/ShowHabits";
import TextButton from "../components/common/TextButton";
import BottomNav from "../components/layout/BottomNav";

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date"); // null if not set

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      <Header title="Your Habits" body="1% better everyday" />
      <ShowHabits selectedDate={selectedDate} />
      <TextButton to="/create" label="+ Add habit" />
      <BottomNav />
    </div>
  );
}

export default DashboardPage;
