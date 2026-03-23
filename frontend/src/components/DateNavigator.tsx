import { useNavigate } from "react-router-dom";

function DateNavigator({ prevDate, nextDate }) {
  const navigate = useNavigate();

  return (
    <div>
      <span onClick={() => navigate(`?date=${prevDate}`)}>&larr;</span>
      <span onClick={() => navigate("/dashboard")}>today</span>
      <span onClick={() => navigate(`?date=${nextDate}`)}>&rarr;</span>
    </div>
  );
}

export default DateNavigator;
