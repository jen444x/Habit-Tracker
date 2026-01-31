import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getHabits,
  getChallenges,
  completeHabit,
  undoCompleteHabit,
  moveHabit,
} from "../api";
import type { Habit, Challenge } from "../api";
import DateNavigator from "../components/DateNavigator";
import ChallengeTabs from "../components/ChallengeTabs";
import HabitCard from "../components/HabitCard";
import Layout from "../components/Layout";

function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [today, setToday] = useState<string>("");
  const [challengeFilter, setChallengeFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (date?: string, challengeId?: number | null) => {
    try {
      const [habitsRes, challengesRes] = await Promise.all([
        getHabits(date, challengeId ?? undefined),
        getChallenges(),
      ]);
      setHabits(habitsRes.habits);
      setSelectedDate(habitsRes.selected_date);
      setToday(habitsRes.today);
      setChallenges(challengesRes.challenges);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDateChange = (offset: number) => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + offset);
    const newDate = date.toISOString().split("T")[0];
    loadData(newDate, challengeFilter);
  };

  const handleBackToToday = () => {
    loadData(undefined, challengeFilter);
  };

  const handleChallengeFilter = (id: number | null) => {
    setChallengeFilter(id);
    loadData(selectedDate === today ? undefined : selectedDate, id);
  };

  const handleToggleComplete = async (habit: Habit) => {
    try {
      if (habit.completed) {
        await undoCompleteHabit(habit.id, selectedDate);
      } else {
        await completeHabit(habit.id, selectedDate);
      }
      loadData(selectedDate === today ? undefined : selectedDate, challengeFilter);
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    }
  };

  const handleMove = async (habitId: number, direction: "up" | "down") => {
    try {
      await moveHabit(habitId, direction);
      loadData(selectedDate === today ? undefined : selectedDate, challengeFilter);
    } catch (err) {
      console.error("Failed to move habit:", err);
    }
  };

  const isToday = selectedDate === today;
  const incompleteHabits = habits.filter((h) => !h.completed);
  const completedHabits = habits.filter((h) => h.completed);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-calm-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Date navigator */}
      <DateNavigator
        selectedDate={selectedDate}
        isToday={isToday}
        onPrev={() => handleDateChange(-1)}
        onNext={() => handleDateChange(1)}
        onBackToToday={handleBackToToday}
      />

      {/* Challenge filter tabs */}
      <ChallengeTabs
        challenges={challenges}
        selectedId={challengeFilter}
        onSelect={handleChallengeFilter}
      />

      {/* New habit button */}
      <Link
        to="/habit/new"
        className="block text-center bg-calm-600 hover:bg-calm-500 text-white py-2 rounded-lg font-bold cursor-pointer text-xl shadow-lg/30 transition-colors duration-150 mb-6"
      >
        + New Habit
      </Link>

      {/* Incomplete habits */}
      <div className="flex flex-col gap-4">
        {incompleteHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={() => handleToggleComplete(habit)}
            onMove={(direction) => handleMove(habit.id, direction)}
          />
        ))}
      </div>

      {/* Completed habits */}
      {completedHabits.length > 0 && (
        <>
          <hr className="my-8 border-t border-gray-300" />
          <div className="flex flex-col gap-4 mb-6">
            {completedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => handleToggleComplete(habit)}
                showReorder={false}
              />
            ))}
          </div>
        </>
      )}

      {habits.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No habits yet. Create one to get started!
        </p>
      )}
    </Layout>
  );
}

export default Dashboard;
