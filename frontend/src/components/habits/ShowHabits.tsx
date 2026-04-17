import { useState, useEffect } from "react";
import HabitListItem from "./HabitListItem";
import DateNavigator from "../common/DateNavigator";

interface Habit {
  id: number;
  title: string;
  stage: number;
  tier: number;
  name: string;
  time_of_day: number;
  status?: "completed" | "skipped";
  curr_streak: number;
}

interface ShowHabitsProps {
  selectedDate: string | null;
}

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Roots", color: "text-amber-700" },
  2: { label: "Growth", color: "text-green-600" },
  3: { label: "Flourish", color: "text-purple-600" },
};

const timeLabels: Record<number, { label: string; icon?: string }> = {
  0: { label: "Any Time" },
  1: { label: "Morning", icon: "☀" },
  2: { label: "Afternoon", icon: "◑" },
  3: { label: "Evening", icon: "☾" },
  4: { label: "Night", icon: "✦" },
};

function ShowHabits({ selectedDate }: ShowHabitsProps) {
  const [habits, setHabits] = useState([]);
  const [habitsDone, setHabitsDone] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prevDate, setPrevDate] = useState("");
  const [nextDate, setNextDate] = useState("");

  async function fetchHabits() {
    const url = `${import.meta.env.VITE_API_URL}/habits/tiers`;
    const fetchUrl = selectedDate ? `${url}?date=${selectedDate}` : url;
    const token = localStorage.getItem("token");

    setIsLoading(true);
    setHabits([]);
    setHabitsDone([]);

    try {
      const res = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      }

      setHabits(data.habits);
      setHabitsDone(data.habits_done);
      setPrevDate(data.prev_date);
      setNextDate(data.next_date);
      console.log(data.habits);
      console.log(data.habits_done);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, [selectedDate]);

  if (!isLoading && habits.length === 0 && habitsDone.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <DateNavigator
          prevDate={prevDate}
          nextDate={nextDate}
          selectedDate={selectedDate}
        />
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-calm-500">No habits yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <DateNavigator
        prevDate={prevDate}
        nextDate={nextDate}
        selectedDate={selectedDate}
      />
      {isLoading && (
        <p className="text-center text-calm-500 mt-6">Loading habits...</p>
      )}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {/* Show habits grouped by tier */}
      {habits.length > 0 &&
        Object.entries(
          habits.reduce(
            (acc: Record<number, Habit[]>, habit: Habit) => {
              const tier = habit.tier;
              if (!acc[tier]) acc[tier] = [];
              acc[tier].push(habit);
              return acc;
            },
            {} as Record<number, Habit[]>,
          ),
        ).map(([tier, tierHabits]) => (
          <div key={tier} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h3
                className={`text-sm font-medium whitespace-nowrap ${
                  tierLabels[Number(tier)]?.color || "text-calm-500"
                }`}
              >
                {tierLabels[Number(tier)]?.label || `Tier ${tier}`}
              </h3>
              <div className="flex-1 h-px bg-calm-200"></div>
            </div>
            <div className="space-y-4">
              {Object.entries(
                (tierHabits as Habit[]).reduce(
                  (acc: Record<number, Habit[]>, habit: Habit) => {
                    const time = habit.time_of_day || 0;
                    if (!acc[time]) acc[time] = [];
                    acc[time].push(habit);
                    return acc;
                  },
                  {} as Record<number, Habit[]>,
                ),
              ).map(([time, timeHabits]) => (
                <div key={time}>
                  {Number(time) in timeLabels && (
                    <div className="flex items-center gap-1.5 mb-2 text-calm-400">
                      {timeLabels[Number(time)].icon && (
                        <span className="text-xs">{timeLabels[Number(time)].icon}</span>
                      )}
                      <span className="text-xs">{timeLabels[Number(time)].label}</span>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {(timeHabits as Habit[]).map((habit: Habit) => (
                      <HabitListItem
                        key={habit.id}
                        habit={habit}
                        onComplete={fetchHabits}
                        status="incomplete"
                        selectedDate={selectedDate}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Show habits that have been completed */}
      {habitsDone.length > 0 && (
        <>
          {habits.length > 0 && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-calm-200"></div>
              <span className="text-calm-400 text-sm">Completed</span>
              <div className="flex-1 h-px bg-calm-200"></div>
            </div>
          )}
          <ul className="space-y-3">
            {habitsDone.map((habit: Habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onComplete={fetchHabits}
                status={habit.status || "completed"}
                selectedDate={selectedDate}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ShowHabits;
