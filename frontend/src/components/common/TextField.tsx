interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div>
      <label className="block text-calm-700 text-sm mb-2 font-medium capitalize">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-4 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500 text-calm-900 placeholder:text-calm-400"
      />
    </div>
  );
}

export default TextField;
