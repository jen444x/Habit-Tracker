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
import Layout from "./components/layout/Layout.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import UpgradeHabitPage from "./pages/UpgradeHabitPage.tsx";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/habits/new" element={<AddHabitPage />} />
          <Route path="/habits/:id/upgrade" element={<UpgradeHabitPage />} />
          <Route path="/challenges/create" element={<AddChallengePage />} />
          <Route path="/:id" element={<HabitPage />} />
          <Route path="/challenges/:id" element={<ChallengePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
