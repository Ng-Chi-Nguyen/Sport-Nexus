import React, { useEffect, useState } from "react";
import { Eye, EyeClosed, ImagePlus } from "lucide-react";

// 1. INPUT CƠ BẢN PHONG CÁCH TỐI MỜ
const InputFrom = (props) => {
  let { type, placeholder, onChange, value, className = "" } = props;
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`peer py-2.5 px-4 w-full cursor-pointer transition-colors duration-200
                 bg-[#111827]/40 text-slate-200 border border-slate-800 outline-none rounded-xl 
                 placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-[#161F32]/60
                 focus:ring-1 focus:ring-sky-500/20 ${className}`}
    />
  );
};

// 2. INPUT MẬT KHẨU CƠ BẢN
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
                   bg-[#111827]/40 text-slate-200 border border-slate-800 outline-none rounded-xl 
                   placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-[#161F32]/60
                   focus:ring-1 focus:ring-sky-500/20 ${className}`}
      />
      <div
        className="absolute cursor-pointer top-1/2 -translate-y-1/2 right-4 text-slate-500 hover:text-sky-400 transition-colors"
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

// 3. COMPONENT TẢI ẢNH (AVATAR/LOGO) CHUẨN GLASSOS
const InputFile = ({ label, value, onChange }) => {
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
        <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 mb-3 flex items-center gap-2 border-b border-white/5">
          <span className="w-1.5 h-3.5 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
          {label}
        </h3>
      )}

      <label
        className="relative group m-auto w-[160px] h-[160px] rounded-full bg-[#0D121F] border border-slate-800/80
                   hover:border-sky-500/40 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]
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
              className="w-full h-full object-cover mix-blend-screen p-1 rounded-full"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {/* Lớp phủ khi di chuột vào */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <ImagePlus size={24} className="text-sky-400" />
              <span className="text-[10px] text-slate-300 font-medium">
                Thay đổi ảnh
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-sky-400 transition-colors">
            <ImagePlus size={28} className="mb-1.5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold tracking-wider">
              TẢI ẢNH LÊN
            </span>
          </div>
        )}
      </label>
    </div>
  );
};

// 4. FLOATING INPUT CAO CẤP (Fix lỗi nền cắt viền)
const FloatingInput = ({ label, id, ...props }) => {
  return (
    <div className="relative w-full group">
      <input
        id={id}
        {...props}
        placeholder=" "
        className="peer w-full p-[11px_15px] text-sm rounded-xl border border-slate-800 bg-[#111827]/40 
                   text-slate-200 tracking-wide outline-none transition-colors duration-200
                   focus:border-sky-500/50 focus:bg-[#161F32]/60 focus:ring-1 focus:ring-sky-500/10"
      />
      <label
        htmlFor={id}
        className="absolute left-[15px] top-[11px] text-slate-500 text-sm pointer-events-none 
                   transition-all duration-200 tracking-wide
                   peer-focus:-translate-y-[21px] peer-focus:-translate-x-1.5 
                   peer-focus:scale-[0.82] peer-focus:bg-[#0D121F] peer-focus:px-1.5 
                   peer-focus:text-sky-400 peer-focus:font-semibold
                   
                   peer-[:not(:placeholder-shown)]:-translate-y-[21px] 
                   peer-[:not(:placeholder-shown)]:-translate-x-1.5 
                   peer-[:not(:placeholder-shown)]:scale-[0.82] 
                   peer-[:not(:placeholder-shown)]:bg-[#0D121F] 
                   peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-slate-400"
      >
        {label}
      </label>
    </div>
  );
};

// 5. FLOATING INPUT PASSWORD CAO CẤP
const FloatingInputPassword = ({ label, id, ...props }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative w-full group">
      <input
        id={id}
        type={showPass ? "text" : "password"}
        {...props}
        placeholder=" "
        className="peer w-full p-[11px_15px] pr-11 text-sm rounded-xl border border-slate-800 bg-[#111827]/40 
                   text-slate-200 tracking-wide outline-none transition-colors duration-200
                   focus:border-sky-500/50 focus:bg-[#161F32]/60 focus:ring-1 focus:ring-sky-500/10"
      />

      <div
        className="absolute cursor-pointer top-1/2 -translate-y-1/2 right-[15px] text-slate-500 hover:text-sky-400 transition-colors z-10"
        onClick={() => setShowPass(!showPass)}
      >
        {showPass ? (
          <Eye size={18} strokeWidth={1.5} />
        ) : (
          <EyeClosed size={18} strokeWidth={1.5} />
        )}
      </div>

      <label
        htmlFor={id}
        className="absolute left-[15px] top-[11px] text-slate-500 text-sm pointer-events-none 
                   transition-all duration-200 tracking-wide
                   peer-focus:-translate-y-[21px] peer-focus:-translate-x-1.5 
                   peer-focus:scale-[0.82] peer-focus:bg-[#0D121F] peer-focus:px-1.5 
                   peer-focus:text-sky-400 peer-focus:font-semibold
                   
                   peer-[:not(:placeholder-shown)]:-translate-y-[21px] 
                   peer-[:not(:placeholder-shown)]:-translate-x-1.5 
                   peer-[:not(:placeholder-shown)]:scale-[0.82] 
                   peer-[:not(:placeholder-shown)]:bg-[#0D121F] 
                   peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-slate-400"
      >
        {label}
      </label>
    </div>
  );
};

export {
  InputFrom,
  InputPassword,
  InputFile,
  FloatingInput,
  FloatingInputPassword,
};
