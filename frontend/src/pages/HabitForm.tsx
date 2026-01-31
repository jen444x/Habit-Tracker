import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabit,
  getChallenges,
} from "../api";
import type { Challenge } from "../api";
import Layout from "../components/Layout";

function HabitForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const challengesRes = await getChallenges();
        setChallenges(challengesRes.challenges);

        if (isEdit) {
          const habitRes = await getHabit(parseInt(id));
          setTitle(habitRes.habit.title);
          setBody(habitRes.habit.body || "");
          setChallengeId(habitRes.habit.challenge_id);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateHabit(parseInt(id), { title, body, challenge_id: challengeId });
      } else {
        await createHabit({ title, body, challenge_id: challengeId });
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save habit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    try {
      await deleteHabit(parseInt(id));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete habit");
    }
  };

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
      <h1 className="font-black text-3xl text-calm-600 text-center w-full mb-6">
        {isEdit ? "Edit Habit" : "New Habit"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-bold text-calm-600 text-lg">
            Title
          </label>
          <input
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border-2 border-calm-300 rounded-lg px-4 py-3 focus:outline-none focus:border-calm-500 text-calm-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="body" className="font-bold text-calm-600 text-lg">
            Description
          </label>
          <textarea
            name="body"
            id="body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border-2 border-calm-300 rounded-lg px-4 py-3 focus:outline-none focus:border-calm-500 text-calm-600 resize-y"
          />
        </div>

        {challenges.length > 0 && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="challenge"
              className="font-bold text-calm-600 text-lg"
            >
              Challenge
            </label>
            <select
              name="challenge"
              id="challenge"
              value={challengeId ?? ""}
              onChange={(e) =>
                setChallengeId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="border-2 border-calm-300 rounded-lg px-4 py-3 focus:outline-none focus:border-calm-500 text-calm-600 bg-white"
            >
              <option value="">None</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-calm-600 hover:bg-calm-500 text-white px-6 py-3 rounded-lg font-bold cursor-pointer flex-1 shadow-lg/30 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Habit"}
          </button>
          <Link
            to="/"
            className="bg-gray-200 hover:bg-gray-300 text-calm-600 px-6 py-3 rounded-lg font-bold cursor-pointer text-center flex-1"
          >
            Cancel
          </Link>
        </div>

        {isEdit && (
          <div className="mt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-red-500 hover:text-red-600 font-medium py-2"
              >
                Delete Habit
              </button>
            ) : (
              <div className="flex flex-col gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 text-center font-medium">
                  Are you sure you want to delete this habit?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Layout>
  );
}

export default HabitForm;
