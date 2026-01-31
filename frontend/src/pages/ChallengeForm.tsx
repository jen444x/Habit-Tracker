import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createChallenge, deleteChallenge } from "../api";
import Layout from "../components/Layout";

function ChallengeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEdit) {
      // For now, we don't have a getChallenge endpoint, so just set loading to false
      // In a full implementation, you'd fetch the challenge details here
      setLoading(false);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        // Update challenge - would need an API endpoint
        navigate("/challenges");
      } else {
        await createChallenge(title);
        navigate("/challenges");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    try {
      await deleteChallenge(parseInt(id));
      navigate("/challenges");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete challenge");
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
        {isEdit ? "Edit Challenge" : "New Challenge"}
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

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-calm-600 hover:bg-calm-500 text-white px-6 py-3 rounded-lg font-bold cursor-pointer flex-1 shadow-lg/30 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Challenge"}
          </button>
          <Link
            to="/challenges"
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
                Delete Challenge
              </button>
            ) : (
              <div className="flex flex-col gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 text-center font-medium">
                  Are you sure? Habits in this challenge won't be deleted.
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

export default ChallengeForm;
