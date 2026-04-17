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

const timeLabels: Record<number, { label: string; icon: string }> = {
  // 0: { label: "Any Time", icon: "◐" },
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

      {/* Show habits that haven't been completed */}
      {habits.length > 0 && (
        <ul className="space-y-3">
          {habits.map((habit: Habit, index: number) => {
            const prevHabit: Habit = habits[index - 1];
            const isNewLevel = index === 0 || habit.tier !== prevHabit.tier;
            const isNewTimeOfDay =
              index === 0 ||
              habit.time_of_day !== prevHabit.time_of_day ||
              habit.tier !== prevHabit.tier;
            return (
              <>
                {/* show tier seperator */}
                {isNewLevel && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-calm-200"></div>
                    <span className="text-calm-400 text-sm">
                      Tier {habit.tier}
                    </span>
                    <div className="flex-1 h-px bg-calm-200"></div>
                  </div>
                )}
                {/* show tod seperator - subtle, left-aligned */}
                {isNewTimeOfDay && (
                  <div
                    className={`flex items-center gap-1.5 pl-1 mb-1.5 ${isNewLevel ? "mt-0" : "mt-3"}`}
                  >
                    {habit.time_of_day in timeLabels && (
                      <span className="text-calm-400 text-[11px]">
                        {timeLabels[habit.time_of_day ?? 0].icon}
                      </span>
                    )}
                    {/* <span className="text-calm-400 text-[11px] tracking-wider uppercase">
                      {timeLabels[habit.time_of_day ?? 0].label}
                    </span> */}
                  </div>
                )}
                <HabitListItem
                  key={habit.id}
                  habit={habit}
                  onComplete={fetchHabits}
                  status="incomplete"
                  selectedDate={selectedDate}
                />
              </>
            );
          })}
        </ul>
      )}

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
