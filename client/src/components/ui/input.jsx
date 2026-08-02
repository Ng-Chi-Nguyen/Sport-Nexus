import React, { useEffect, useState } from "react";
import { Eye, EyeClosed, ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

// 1. INPUT CÆ  Báº¢N
const InputFrom = (props) => {
  let { type, placeholder, onChange, value, className = "" } = props;
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`peer py-2.5 px-4 w-full cursor-pointer transition-colors duration-200
                 bg-slate-100 text-slate-800 border border-slate-300 outline-none rounded-xl 
                 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500/20
                 dark:bg-[#111827]/40 dark:text-slate-200 dark:border-slate-800 
                 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50 dark:focus:bg-[#161F32]/60
                 dark:focus:ring-sky-500/20 ${className}`}
    />
  );
};

// 2. INPUT Máº¬T KHáº¨U CÆ  Báº¢N
const InputPassword = (props) => {
  const [show, setShow] = useState(false);
  let { placeholder, value, onChange, className = "" } = props;
  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`peer py-2.5 pl-4 pr-11 w-full cursor-pointer transition-colors duration-200
                   bg-slate-100 text-slate-800 border border-slate-300 outline-none rounded-xl 
                   placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500/20
                   dark:bg-[#111827]/40 dark:text-slate-200 dark:border-slate-800 
                   dark:placeholder:text-slate-600 dark:focus:border-sky-500/50 dark:focus:bg-[#161F32]/60
                   dark:focus:ring-sky-500/20 ${className}`}
      />
      <div
        className="absolute cursor-pointer top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-sky-600 dark:text-slate-500 dark:hover:text-sky-400 transition-colors"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <Eye size={18} strokeWidth={1.5} />
        ) : (
          <EyeClosed size={18} strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
};

// 3. COMPONENT Táº¢I áº¢NH (AVATAR/LOGO)
const InputFile = ({ label, value, onChange }) => {
  const { t } = useTranslation("translation", { keyPrefix: "component.common" });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    if (typeof value === "string") {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <h3 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-white/5">
          <span className="w-1.5 h-3.5 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
          {label}
        </h3>
      )}

      <label
        className="relative group m-auto w-[160px] h-[160px] rounded-full 
                   bg-slate-100 border border-slate-300 hover:border-sky-500/50 hover:shadow-md
                   dark:bg-[#0D121F] dark:border-slate-800/80 dark:hover:border-sky-500/40 dark:hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]
                   transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover p-1 rounded-full"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {/* Lá»›p phá»§ khi di chuá»™t vĂ o */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <ImagePlus size={24} className="text-sky-400" />
              <span className="text-[10px] text-slate-200 font-medium">
                {t("change_image")}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 hover:text-sky-600 dark:text-slate-500 dark:group-hover:text-sky-400 transition-colors">
            <ImagePlus size={28} className="mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold tracking-wider">
              {t("upload_image")}
            </span>
          </div>
        )}
      </label>
    </div>
  );
};

// 4. FLOATING INPUT CAO Cáº¤P
const FloatingInput = ({ label, id, ...props }) => {
  const inputClass =
    "peer w-full p-[11px_15px] text-sm rounded-xl border outline-none tracking-wide transition-colors duration-200 " +
    "bg-slate-50 border-slate-300 text-slate-800 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500/20 " +
    "dark:border-slate-800 dark:bg-[#111827]/40 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:bg-[#161F32]/60 dark:focus:ring-sky-500/10";

  const labelClass =
    "absolute left-[15px] top-[11px] text-sm pointer-events-none transition-all duration-200 tracking-wide " +
    "text-slate-400 peer-focus:-translate-y-[21px] peer-focus:-translate-x-1.5 peer-focus:scale-[0.82] peer-focus:bg-slate-50 peer-focus:px-1.5 peer-focus:text-sky-600 peer-focus:font-semibold " +
    "peer-[:not(:placeholder-shown)]:-translate-y-[21px] peer-[:not(:placeholder-shown)]:-translate-x-1.5 peer-[:not(:placeholder-shown)]:scale-[0.82] peer-[:not(:placeholder-shown)]:bg-slate-50 peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-slate-500 " +
    "dark:text-slate-500 dark:peer-focus:bg-[#0D121F] dark:peer-focus:text-sky-400 dark:peer-[:not(:placeholder-shown)]:bg-[#0D121F] dark:peer-[:not(:placeholder-shown)]:text-slate-400";

  return (
    <div className="relative w-full group">
      <input id={id} {...props} placeholder=" " className={inputClass} />
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  );
};

// 5. FLOATING INPUT PASSWORD CAO Cáº¤P
const FloatingInputPassword = ({ label, id, ...props }) => {
  const [showPass, setShowPass] = useState(false);

  const inputClass =
    "peer w-full p-[11px_15px] pr-11 text-sm rounded-xl border outline-none tracking-wide transition-colors duration-200 " +
    "bg-slate-50 border-slate-300 text-slate-800 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500/20 " +
    "dark:border-slate-800 dark:bg-[#111827]/40 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:bg-[#161F32]/60 dark:focus:ring-sky-500/10";

  const labelClass =
    "absolute left-[15px] top-[11px] text-sm pointer-events-none transition-all duration-200 tracking-wide " +
    "text-slate-400 peer-focus:-translate-y-[21px] peer-focus:-translate-x-1.5 peer-focus:scale-[0.82] peer-focus:bg-slate-50 peer-focus:px-1.5 peer-focus:text-sky-600 peer-focus:font-semibold " +
    "peer-[:not(:placeholder-shown)]:-translate-y-[21px] peer-[:not(:placeholder-shown)]:-translate-x-1.5 peer-[:not(:placeholder-shown)]:scale-[0.82] peer-[:not(:placeholder-shown)]:bg-slate-50 peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-slate-500 " +
    "dark:text-slate-500 dark:peer-focus:bg-[#0D121F] dark:peer-focus:text-sky-400 dark:peer-[:not(:placeholder-shown)]:bg-[#0D121F] dark:peer-[:not(:placeholder-shown)]:text-slate-400";

  const eyeClass =
    "absolute cursor-pointer top-1/2 -translate-y-1/2 right-[15px] z-10 transition-colors " +
    "text-slate-400 hover:text-sky-600 dark:text-slate-500 dark:hover:text-sky-400";

  return (
    <div className="relative w-full group">
      <input
        id={id}
        type={showPass ? "text" : "password"}
        {...props}
        placeholder=" "
        className={inputClass}
      />
      <div className={eyeClass} onClick={() => setShowPass(!showPass)}>
        {showPass ? (
          <Eye size={18} strokeWidth={1.5} />
        ) : (
          <EyeClosed size={18} strokeWidth={1.5} />
        )}
      </div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  );
};

// 6. INPUT CĂ“ LABEL PHĂA TRĂN
const LabelInput = ({
  label,
  required,
  id,
  className = "",
  rightElement,
  square = false,
  ...props
}) => (
  <div>
    {label && (
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      <input
        id={id}
        required={required}
        className={`w-full px-3 py-2 border ${square ? "rounded-none" : "rounded"} text-sm focus:outline-none transition-colors duration-200
                   bg-slate-50 border-slate-300 text-slate-800 focus:border-sky-500 focus:bg-white
                   dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 ${
                     rightElement ? "pr-10" : ""
                   } ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

export {
  InputFrom,
  InputPassword,
  InputFile,
  FloatingInput,
  FloatingInputPassword,
  LabelInput,
};
