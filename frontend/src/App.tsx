import { Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<div>Log In Page</div>} />
      </Routes>
    </>
  );
}

export default App;
