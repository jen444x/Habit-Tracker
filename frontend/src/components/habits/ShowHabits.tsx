import { useState, useEffect } from "react";
import HabitListItem from "./HabitListItem";
import DateNavigator from "../common/DateNavigator";
import MergedHabitGroup from "./MergedHabitGroup";

interface Habit {
  id: number;
  title: string;
  stage: number;
  tier: number;
  name: string;
  time_of_day: number;
  status?: "completed" | "skipped";
  curr_streak: number;
  family_id: number; // Add this
  merged: boolean; // Add this
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
        return;
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

  // =============================================
  // STEP 1: Group habits by tier
  // =============================================
  function groupHabitsByTier(habitsToGroup: Habit[]) {
    // Create an empty object to hold our groups
    const groups: Record<number, Habit[]> = {};

    // Loop through each habit
    for (const habit of habitsToGroup) {
      const tier = habit.tier;

      // If this tier doesn't have a bucket yet, create an empty array
      if (groups[tier] === undefined) {
        groups[tier] = [];
      }

      // Add this habit to its tier's bucket
      groups[tier].push(habit);
    }

    return groups;
  }

  // =============================================
  // STEP 2: Group habits by time of day
  // =============================================
  function groupHabitsByTime(habitsToGroup: Habit[]) {
    const groups: Record<number, Habit[]> = {};

    for (const habit of habitsToGroup) {
      // Use 0 (Any Time) if time_of_day is not set
      const time = habit.time_of_day || 0;

      if (groups[time] === undefined) {
        groups[time] = [];
      }

      groups[time].push(habit);
    }

    return groups;
  }

  // =============================================
  // STEP 3: Render all habits organized by tier, then by time
  // =============================================
  function renderHabitsByTier() {
    // Group all habits by tier
    const habitsByTier = groupHabitsByTier(habits);

    // Convert { 1: [...], 2: [...] } into [["1", [...]], ["2", [...]]]
    // so we can loop through it
    const tierEntries = Object.entries(habitsByTier);

    // Loop through each tier and render it
    return tierEntries.map(function (entry) {
      const tier = entry[0]; // The tier number (as a string)
      const tierHabits = entry[1] as Habit[]; // The habits in this tier

      // Get the label and color for this tier
      const tierInfo = tierLabels[Number(tier)];
      const tierLabel = tierInfo ? tierInfo.label : `Tier ${tier}`;
      const tierColor = tierInfo ? tierInfo.color : "text-calm-500";

      return (
        <div key={tier} className="mb-6">
          {/* Tier header */}
          <div className="flex items-center gap-3 mb-4">
            <h3
              className={`text-sm font-medium whitespace-nowrap ${tierColor}`}
            >
              {tierLabel}
            </h3>
            <div className="flex-1 h-px bg-calm-200"></div>
          </div>

          {/* Habits in this tier, grouped by time */}
          <div className="space-y-4">{renderHabitsByTime(tierHabits)}</div>
        </div>
      );
    });
  }

  // =============================================
  // STEP 4: Render habits for a single tier, grouped by time
  // =============================================
  function renderHabitsByTime(tierHabits: Habit[]) {
    // Group this tier's habits by time of day
    const habitsByTime = groupHabitsByTime(tierHabits);

    // Convert to array so we can loop
    const timeEntries = Object.entries(habitsByTime);

    return timeEntries.map(function (entry) {
      const time = entry[0]; // The time of day (as a string)
      const timeHabits = entry[1] as Habit[]; // The habits at this time
      const timeInfo = timeLabels[Number(time)]; // Get the label and icon for this time

      return (
        <div key={time}>
          {/* Time of day header (Morning, Evening, etc.) */}
          {timeInfo && (
            <div className="flex items-center gap-1.5 mb-2 text-calm-400">
              {timeInfo.icon && (
                <span className="text-xs">{timeInfo.icon}</span>
              )}
              <span className="text-xs">{timeInfo.label}</span>
            </div>
          )}

          {/* List of habits at this time */}
          <ul className="space-y-2">
            {timeHabits.map(function (habit, index) {
              // Render regularly if not merged
              if (habit.merged === false) {
                return (
                  <HabitListItem
                    key={habit.id}
                    habit={habit}
                    onComplete={fetchHabits}
                    status="incomplete"
                    selectedDate={selectedDate}
                  />
                );
              }

              // Skip if its not the first in family bc first handled it
              const previousHabit = timeHabits[index - 1];
              if (previousHabit !== undefined) {
                if (previousHabit.family_id === habit.family_id) {
                  return null;
                }
              }

              // If first habit, get rest of family
              const familyMembers: Habit[] = [habit];

              // Look at the next habits
              let i = index + 1;

              while (i < timeHabits.length) {
                const laterHabit = timeHabits[i];

                // Stop if we hit a different family
                if (laterHabit.family_id !== habit.family_id) {
                  break;
                }

                // Only include if also merged
                if (laterHabit.merged === true) {
                  familyMembers.push(laterHabit);
                }

                i = i + 1;
              }

              // Render regularly if theres only 1 habit in family
              if (familyMembers.length < 2) {
                return (
                  <HabitListItem
                    key={habit.id}
                    habit={habit}
                    onComplete={fetchHabits}
                    status="incomplete"
                    selectedDate={selectedDate}
                  />
                );
              }

              // Render merged group with a wrapper
              return (
                <MergedHabitGroup
                  key={habit.id}
                  familyMembers={familyMembers}
                  onComplete={fetchHabits}
                  selectedDate={selectedDate}
                />
              );
            })}
          </ul>
        </div>
      );
    });
  }

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
      {habits.length > 0 && renderHabitsByTier()}

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
