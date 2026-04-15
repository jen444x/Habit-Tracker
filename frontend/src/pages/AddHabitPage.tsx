import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/layout/Header";
import TextButton from "../components/common/TextButton";
import ErrorMesage from "../components/common/ErrorMessage";
import TextField from "../components/common/TextField";
import Select from "../components/common/Select";

function AddHabitPage() {
  const [habitName, setHabitName] = useState("");
  const [habitNotes, setHabitNotes] = useState("");
  const [habitTier, setHabitTier] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/habits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: habitName,
          notes: habitNotes,
          tier: habitTier,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      navigate(-1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header title={`New Habit`} body="Start something meaningful" />

      {/* Form */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Habit name"
            value={habitName}
            onChange={setHabitName}
            placeholder="Habit Name"
          />
          <TextField
            label="Notes"
            value={habitNotes}
            onChange={setHabitNotes}
            placeholder={"Optional: add any notes"}
          />
          <Select label="tier" value={habitTier} onChange={setHabitTier} />

          <button
            disabled={isLoading}
            className="w-full bg-calm-600 text-white capitalize py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors disabled:bg-calm-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : `Add Habit`}
          </button>
        </form>

        {error && <ErrorMesage error={error} />}
        <TextButton to="/dashboard" label="← Back" />
      </div>
    </>
  );
}

export default AddHabitPage;
