import { useNavigate } from "react-router";

interface TextButtonProps {
  to: string;
  label: string;
}

function TextButton({ to, label }: TextButtonProps) {
  function handleClick() {
    const navigate = useNavigate();
    navigate(to);
  }
  return (
    <button
      onClick={handleClick}
      className="w-full mt-4 py-3 text-calm-500 hover:text-calm-700 text-sm transition-colors"
    >
      {label}
    </button>
  );
}

export default TextButton;
