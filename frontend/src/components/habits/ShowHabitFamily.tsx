import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import UpgradeHabit from "./UpgradeHabit";

interface ShowHabitFamilyProps {
  familyId: number;
  id: number;
}

type Habit = {
  id: number;
  name: string;
  stage: number;
};
function ShowHabitFamily({ familyId, id }: ShowHabitFamilyProps) {
  const [error, setError] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);
  const navigate = useNavigate();

  const currentHabit = habits.find((h) => h.id === id);
  const nextStageExists = habits.some(
    (h) => h.stage === (currentHabit?.stage ?? 0) + 1,
  );

  async function fetchFamily() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/family/${familyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setHabits(data.habits);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  useEffect(() => {
    fetchFamily();
  }, [familyId]);
  return (
    <>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!nextStageExists && <UpgradeHabit id={Number(id)} />}

      {habits.length > 1 && (
        <ul className="flex flex-col gap-2 mt-4">
          {habits.map((habit) => (
            <li
              key={habit.id}
              onClick={() => navigate(`/${habit.id}`)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
                habit.id === id
                  ? "bg-teal-500 text-white"
                  : "bg-calm-100 text-calm-600 hover:bg-calm-200"
              }`}
            >
              <p className="text-sm font-medium">{habit.name}</p>
              <p className="text-xs opacity-75">Stage {habit.stage}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default ShowHabitFamily;
