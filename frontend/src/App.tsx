import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import HabitView from "./pages/HabitView";
import HabitForm from "./pages/HabitForm";
import ChallengesList from "./pages/ChallengesList";
import ChallengeForm from "./pages/ChallengeForm";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-calm-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-calm-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/welcome"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/habit/new"
        element={
          <ProtectedRoute>
            <HabitForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/habit/:id"
        element={
          <ProtectedRoute>
            <HabitView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/habit/:id/edit"
        element={
          <ProtectedRoute>
            <HabitForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <ChallengesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenge/new"
        element={
          <ProtectedRoute>
            <ChallengeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenge/:id/edit"
        element={
          <ProtectedRoute>
            <ChallengeForm />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home or welcome */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
