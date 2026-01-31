import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full min-h-dvh">
      <section className="flex flex-col pt-4 pb-34 max-w-2xl mx-auto px-6">
        {children}
      </section>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 overscroll-none bg-calm-600 shadow-lg">
          <div className="flex justify-around items-center py-4 pb-7 text-center text-white">
            <Link
              to="/challenges"
              className={`flex-1 flex flex-col items-center gap-1 py-2 ${
                isActive("/challenges") ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-medium">Challenges</span>
            </Link>
            <Link
              to="/"
              className={`flex-1 flex flex-col items-center gap-1 py-2 ${
                isActive("/") ? "opacity-100" : "opacity-80 hover:opacity-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">Habits</span>
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex flex-col items-center gap-1 py-2 opacity-80 hover:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default Layout;
