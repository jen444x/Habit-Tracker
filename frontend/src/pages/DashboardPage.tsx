import { useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import ShowHabits from "../components/habits/ShowHabits";
import TextButton from "../components/common/TextButton";

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date"); // null if not set


  return (
    <>
      <Header title="Your Habits" body="1% better everyday" />
      <ShowHabits selectedDate={selectedDate} />
      <TextButton to="/habits/new" label="+ Add habit" />
    </>
  );
}

export default DashboardPage;
