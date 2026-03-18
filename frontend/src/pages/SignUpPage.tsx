import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";

function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = "http://localhost:8000/auth/register";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        console.log(data.error);
        return;
      }

      // save token to local storage
      localStorage.setItem("token", data.token);
      // go to dashboard on success
      navigate("/dashboard");
      console.log("signup successful!", data);
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
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="font-heading text-4xl text-calm-900 mb-2">
          Begin Your Journey
        </h1>
        <p className="text-calm-600 text-sm">Small steps, steady growth</p>
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
            placeholder="Choose a username"
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
            placeholder="Create a password"
            className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
          />
        </div>

        {/* Show errors if any */}
        {error && <p>{error}</p>}

        <button className="w-full bg-calm-600 text-white py-4 rounded-xl font-medium hover:bg-calm-700 transition-colors mt-4">
          Start Growing
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-calm-500 text-sm mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-calm-700 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default SignUpPage;
