import { Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LogInPage from "./pages/LogInPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  );
}

export default App;
