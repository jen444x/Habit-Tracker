import { Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LogInPage from "./pages/LogInPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import AddHabitPage from "./pages/AddHabitPage.tsx";
import HabitPage from "./pages/HabitPage.tsx";
import ChallengesPage from "./pages/ChallengesPage.tsx";
import AddChallengePage from "./pages/AddChallengePage.tsx";
import ChallengePage from "./pages/ChallengePage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/create" element={<AddHabitPage />} />
        <Route path="/:id" element={<HabitPage />} />
        <Route path="/challenges/create" element={<AddChallengePage />} />
        <Route path="/challenges/:id" element={<ChallengePage />} />
      </Routes>
    </>
  );
}

export default App;
