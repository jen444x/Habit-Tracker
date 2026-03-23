import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import ShowHabits from "../components/ShowHabits";
import Header from "../components/Header";

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

      {/* Add Habit Button */}
      <div className="max-w-md mx-auto mb-8">
        <button
          onClick={handleClick}
          className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors"
        >
          + Add New Habit
        </button>
      </div>
      <p>Selected date: {selectedDate}</p>
      <ShowHabits selectedDate={selectedDate} />
    </div>
  );
}

export default DashboardPage;
