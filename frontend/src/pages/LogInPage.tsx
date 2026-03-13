import { useState } from "react";

function LogInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
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
          Sign In
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-calm-500 text-sm mt-8">
        Don't have an account?{" "}
        <span className="text-calm-700 font-medium">Sign up</span>
      </p>
    </div>
  );
}
export default LogInPage;
