export const FloatingTextarea = ({
  id,
  label,
  value,
  onChange,
  required,
  rows = 3,
  placeholder,
}) => {
  return (
    <div className="relative w-full border border-gray-200">
      <textarea
        id={id}
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm min-h-[250px] max-h-[500px] text-[#323232] bg-transparent rounded-[5px] appearance-none focus:outline-none focus:ring-0 focus:border-[#4facf3] peer"
        placeholder={placeholder}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-[#323232] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#4facf3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-bold pointer-events-none"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};
