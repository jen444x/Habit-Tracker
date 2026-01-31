import { useState } from "react";
import AuthModal from "../components/AuthModal";

function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setModalMode("login");
    setModalOpen(true);
  };

  const openSignup = () => {
    setModalMode("signup");
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-calm-700 tracking-wider">
          Crescentia
        </h1>
        <p className="mt-3 text-sm font-light tracking-widest text-calm-500 uppercase">
          nourish yourself
        </p>
      </div>

      <div className="flex flex-col gap-4 w-3/5 max-w-xs">
        <button
          onClick={openLogin}
          className="w-full py-3 px-6 text-white bg-calm-600 hover:bg-calm-500 rounded-md font-bold text-lg shadow-lg/30 transition-colors cursor-pointer"
        >
          Log In
        </button>
        <button
          onClick={openSignup}
          className="w-full py-3 px-6 text-calm-700 bg-white hover:bg-gray-50 border-2 border-calm-400 rounded-md font-medium text-lg transition-colors cursor-pointer"
        >
          Create an account
        </button>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
      />
    </div>
  );
}

export default LandingPage;
