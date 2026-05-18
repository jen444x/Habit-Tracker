import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import UpgradeHabit from "./UpgradeHabit";

interface ShowHabitFamilyProps {
  familyId: number;
  id: number;
}

type LinkedHabit = {
  id: number;
  name: string;
  tier: number;
};

type Habit = {
  id: number;
  name: string;
  stage: number;
  tier: number;
  cascades_to: number | null;
  linked_lower: LinkedHabit | null;
  linked_higher: LinkedHabit[];
};

const tierLabels: Record<number, string> = {
  1: "Roots",
  2: "Growth",
  3: "Flourish",
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

      <UpgradeHabit id={Number(id)} canGrowTaller={!nextStageExists} />

      {habits.some(
        (h) =>
          h.id !== id ||
          h.linked_lower !== null ||
          h.linked_higher.length > 0,
      ) && (
        <ul className="flex flex-col gap-2 mt-4">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-stretch gap-2">
              <div className="flex-1 flex justify-end">
                {habit.linked_lower && (
                  <LinkedCard
                    habit={habit.linked_lower}
                    onClick={() => navigate(`/${habit.linked_lower!.id}`)}
                  />
                )}
              </div>

              <div
                onClick={() => navigate(`/${habit.id}`)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-all min-w-32 text-center ${
                  habit.id === id
                    ? "bg-teal-500 text-white"
                    : "bg-calm-100 text-calm-600 hover:bg-calm-200"
                }`}
              >
                <p className="text-sm font-medium">{habit.name}</p>
                <p className="text-xs opacity-75">Stage {habit.stage}</p>
              </div>

              <div className="flex-1 flex flex-col gap-1 justify-center">
                {habit.linked_higher.map((linked) => (
                  <LinkedCard
                    key={linked.id}
                    habit={linked}
                    onClick={() => navigate(`/${linked.id}`)}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function LinkedCard({
  habit,
  onClick,
}: {
  habit: LinkedHabit;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="px-2 py-1.5 rounded-lg cursor-pointer bg-calm-50 border border-calm-200 hover:bg-calm-100 transition-colors text-center"
    >
      <p className="text-xs font-medium text-calm-700 leading-tight">
        {habit.name}
      </p>
      <p className="text-[10px] text-calm-400">{tierLabels[habit.tier]}</p>
    </div>
  );
}

export default ShowHabitFamily;
