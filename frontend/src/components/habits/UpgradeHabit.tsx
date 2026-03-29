import { useNavigate } from "react-router";
interface UpgradeHabitProps {
  id: number;
}
function UpgradeHabit({ id }: UpgradeHabitProps) {
  const navigate = useNavigate();
  function handleClick() {
    navigate(`/habits/${id}/upgrade`);
  }
  return <button onClick={handleClick}>Upgrade Habit</button>;
}

export default UpgradeHabit;
