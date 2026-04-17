import React, { useState } from "react";
import TextField from "../common/TextField";

interface SkipHabitProps {
  id: number;
  selectedDate: string | null;
  onComplete: () => void;
}

function SkipHabit({ id, selectedDate, onComplete }: SkipHabitProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (selectedDate) {
        formData.append("date", selectedDate);
      }
      if (reason) {
        formData.append("reason", reason);
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/habits/${id}/skip`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
        return;
      }
      setIsOpen(false);
      onComplete();
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Skip Habit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Reason for skipping (Optional)"
                value={reason}
                onChange={setReason}
                placeholder="e.g. Forgot, Didn't have time"
              />

              <button className="w-full bg-calm-600 text-white capitalize py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed">
                Skip Habit
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(true)}
        className="text-calm-300 hover:text-calm-500 cursor-pointer p-1 hover:bg-calm-100 rounded-lg transition-colors"
        aria-label="Skip today"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      </button>
    </>
  );
}

export default SkipHabit;
