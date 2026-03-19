import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";

function LogInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // fetch
    const url = `${import.meta.env.VITE_API_URL}/auth/login`;
    try {
      console.log("starting");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });
      const data = await response.json();
      console.log("did my fetch");

      if (!response.ok) {
        setError(data.error);
        console.log(data.error);
        return;
      }

      // save token
      localStorage.setItem("token", data.token);
      // go to dashboard
      navigate("/dashboard");
      console.log("login successful");
    } catch (error) {
      // this only runs if the request itself failed (network error, etc.)
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      console.error("network error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-heading text-4xl text-calm-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-calm-600 text-sm">Continue your growth</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-calm-700 text-sm mb-2 font-medium">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter your username"
            className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
          />
        </div>

        <div>
          <label className="block text-calm-700 text-sm mb-2 font-medium">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
          />
        </div>

        <button className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors mt-4">
          Log In
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-calm-500 text-sm mt-8">
        Don't have an account?{" "}
        <Link to="/signup" className="text-calm-700 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
export default LogInPage;
