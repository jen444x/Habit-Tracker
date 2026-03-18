import { useState } from "react";

function DashboardPage() {
  const [task_name, setTaskName] = useState("");
  const [task_desc, setTaskDesc] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = "http://localhost:8000/create";
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: task_name, desc: task_desc }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        console.log(data.error);
        return;
      }

      console.log("task added");

      // reset values
      setTaskName("");
      setTaskDesc("");
      setError("");
      setStatus("succes");
    } catch (error) {
      // this only runs if the request itself failed (network error, etc.)
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    }
  }

  return (
    <div>
      <h1>habits</h1>
      {/* Add habits  */}
      <form onSubmit={handleSubmit}>
        <label>Task name</label>
        <input
          value={task_name}
          onChange={(e) => setTaskName(e.target.value)}
          type="text"
        ></input>

        <label>Description</label>
        <input
          value={task_desc}
          onChange={(e) => setTaskDesc(e.target.value)}
          type="text"
        ></input>
        <button>Add task</button>
      </form>

      {error && <p>{error}</p>}
      {status && <p>New task created</p>}

      <ul>
        <li>habits</li>
      </ul>
    </div>
  );
}

export default DashboardPage;
