import { Link } from "react-router";

interface TextButtonProps {
  to: string;
  label: string;
}

function TextButton({ to, label }: TextButtonProps) {
  return (
    <Link
      to={to}
      className="block text-center w-full mt-4 py-3 text-calm-500 hover:text-calm-700 text-sm transition-colors"
    >
      {label}
    </Link>
  );
}

export default TextButton;
