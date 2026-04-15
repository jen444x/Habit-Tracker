interface SelectProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function Select({ label, value, onChange }: SelectProps) {
  return (
    <>
      <div>
        <label className="block text-calm-700 text-sm mb-2 font-medium">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-3 bg-white border border-calm-200 rounded-xl focus:outline-none focus:border-calm-500"
        >
          <option value={value}>{value}</option>
          {[1, 2, 3]
            .filter((num) => num !== value)
            .map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
        </select>
      </div>
    </>
  );
}
export default Select;
