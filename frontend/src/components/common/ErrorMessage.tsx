interface ErrorMessageProps {
  error: string;
}

function ErrorMesage({ error }: ErrorMessageProps) {
  return <p className="text-red-500 text-sm mt-3 text-center">{error}</p>;
}

export default ErrorMesage;
