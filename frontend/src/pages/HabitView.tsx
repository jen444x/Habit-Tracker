import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHabit } from "../api";
import type { Habit, HabitStats, Challenge } from "../api";
import Layout from "../components/Layout";
import WeekGrid from "../components/WeekGrid";
import ProgressHistogram from "../components/ProgressHistogram";

interface WeekData {
  percentage: number;
  label: string;
}

interface DayData {
  date: string;
  completed: boolean;
  inFuture: boolean;
  beforeHabit: boolean;
}

function HabitView() {
  const { id } = useParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!id) return;

    const loadHabit = async () => {
      try {
        const data = await getHabit(parseInt(id));
        setHabit(data.habit);
        setStats(data.stats);
        setChallenge(data.challenge);
      } catch (err) {
        console.error("Failed to load habit:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHabit();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-calm-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!habit || !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Habit not found</p>
        </div>
      </Layout>
    );
  }

  // Calculate week data for the grid
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

  const selectedMonday = new Date(currentMonday);
  selectedMonday.setDate(selectedMonday.getDate() + weekOffset * 7);

  const habitCreatedDate = habit.created_at ? new Date(habit.created_at) : new Date();
  const habitCreatedMonday = new Date(habitCreatedDate);
  habitCreatedMonday.setDate(habitCreatedDate.getDate() - habitCreatedDate.getDay() + (habitCreatedDate.getDay() === 0 ? -6 : 1));

  const canGoPrev = selectedMonday > habitCreatedMonday;
  const canGoNext = weekOffset < 0;
  const isCurrentWeek = weekOffset === 0;

  // Build days data for the week
  const completedDatesSet = new Set(stats.completion_dates);
  const daysData: DayData[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(selectedMonday);
    date.setDate(selectedMonday.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    daysData.push({
      date: dateStr,
      completed: completedDatesSet.has(dateStr),
      inFuture: date > today,
      beforeHabit: habit.created_at ? date < new Date(habit.created_at) : false,
    });
  }

  // Calculate weekly progress data (last 8 weeks)
  const weeksData: WeekData[] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - w * 7);

    let validDays = 0;
    let completedDays = 0;

    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const dayStr = day.toISOString().split("T")[0];

      if (day >= habitCreatedDate && day <= today) {
        validDays++;
        if (completedDatesSet.has(dayStr)) {
          completedDays++;
        }
      }
    }

    if (validDays > 0) {
      weeksData.push({
        percentage: (completedDays / validDays) * 100,
        label: `W${8 - w}`,
      });
    }
  }

  const formatWeekRange = () => {
    const sunday = new Date(selectedMonday);
    sunday.setDate(selectedMonday.getDate() + 6);
    return `${selectedMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  return (
    <Layout>
      {/* Header with edit button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-calm-600">{habit.title}</h2>
        <Link
          to={`/habit/${habit.id}/edit`}
          className="px-3 py-2 flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-calm-500 rounded-lg cursor-pointer transition-colors duration-150"
          title="Edit habit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#0d9488"
          >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
          </svg>
          <span className="text-calm-600 font-medium">Edit</span>
        </Link>
      </div>

      {/* Description */}
      {habit.body && <p className="text-gray-500 mb-6">{habit.body}</p>}

      {/* Challenge link */}
      {challenge && (
        <div className="mb-6">
          <Link
            to={`/challenge/${challenge.id}`}
            className="inline-flex items-center gap-2 text-calm-500 hover:text-calm-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            {challenge.title}
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2 border-calm-500 shadow-lg/30 text-center">
          <div className="text-3xl font-bold text-calm-600">
            {stats.current_streak}
          </div>
          <div className="text-sm text-gray-500">Current Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-calm-500 shadow-lg/30 text-center">
          <div className="text-3xl font-bold text-calm-600">
            {stats.longest_streak}
          </div>
          <div className="text-sm text-gray-500">Longest Streak</div>
        </div>
      </div>

      {/* Weekly Progress Histogram */}
      {weeksData.length > 0 && (
        <section className="mb-6 bg-white rounded-xl p-5 border-2 border-calm-500 shadow-lg/30">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
            Weekly Progress
          </h3>
          <ProgressHistogram weeks={weeksData} />
        </section>
      )}

      {/* Weekly grid */}
      <section className="bg-white rounded-xl p-5 border-2 border-calm-500 shadow-lg/30">
        {/* Week navigator */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
            This Week
          </h3>
          <div className="flex items-center gap-3">
            {canGoPrev ? (
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-1 text-gray-400 hover:text-calm-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : (
              <div className="p-1 w-6"></div>
            )}

            <span className="text-sm text-gray-600 font-medium">
              {isCurrentWeek ? "This week" : formatWeekRange()}
            </span>

            {canGoNext ? (
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-1 text-gray-400 hover:text-calm-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <div className="p-1 w-6"></div>
            )}
          </div>
        </div>

        {!isCurrentWeek && (
          <div className="mb-3 text-center">
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-calm-500 hover:text-calm-600"
            >
              Back to this week
            </button>
          </div>
        )}

        <WeekGrid days={daysData} />
      </section>
    </Layout>
  );
}

export default HabitView;
