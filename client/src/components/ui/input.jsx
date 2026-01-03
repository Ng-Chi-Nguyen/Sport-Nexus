import { useEffect, useState } from "react";
import { Eye, EyeClosed, ImagePlus, X } from "lucide-react";

const InputFrom = (props) => {
  let { type, placeholder, onChange, value } = props;
  return (
    <>
      <input
        type={type}
        value={value} // Nhận giá trị từ cha truyền vào
        onChange={onChange}
        placeholder={placeholder}
        className="peer py-3 px-3 cursor-pointer transition-all border border-gray-500 outline-none rounded-[5px] focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </>
  );
};

const InputPassword = (props) => {
  const [type, setType] = useState(false);
  let { placeholder } = props;
  return (
    <div className="relative">
      <input
        type={type ? "password" : "text"}
        placeholder={placeholder}
        className="peer py-3 px-3 cursor-pointer transition-all border border-gray-500 outline-none rounded-[5px] focus:border-primary focus:ring-1 focus:ring-primary w-full"
      />
      {type ? (
        <EyeClosed
          className="absolute cursor-pointer top-[30%] right-[10px]"
          onClick={() => setType(!type)}
        />
      ) : (
        <Eye
          className="absolute cursor-pointer top-[30%] right-[10px]"
          onClick={() => setType(!type)}
        />
      )}
    </div>
  );
};

const InputFile = ({ label, value, onChange }) => {
  const [preview, setPreview] = useState(null);

  // Xử lý hiển thị ban đầu và khi value thay đổi
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // Nếu value là đối tượng File (người dùng vừa chọn)
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      // Cleanup để tránh rò rỉ bộ nhớ
      return () => URL.revokeObjectURL(objectUrl);
    }

    // Nếu value là string (URL từ database)
    if (typeof value === "string") {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file); // Gửi file lên cha để cập nhật state
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null); // Xóa ảnh ở state cha
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-black uppercase text-[#323232]">
          {label}
        </label>
      )}

      <label
        className="relative group m-auto w-[200px] h-[200px] rounded-full bg-gray-50 hover:border-[#4facf3] 
        transition-all flex items-center justify-center overflow-hidden cursor-pointer"
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
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none"; // Ẩn ảnh nếu đường dẫn lỗi
              }}
            />
            {/* Overlay khi hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImagePlus size={30} className="text-white" />
            </div>

            {/* Nút Xóa */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-4 p-1 bg-red-500 text-white rounded-full border-2 border-[#323232] hover:scale-110 transition-transform z-30 shadow-[2px_2px_0px_0px_#323232]"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImagePlus size={32} className="mb-2" />
            <span className="text-[12px] font-bold">NHẤN ĐỂ TẢI ẢNH</span>
          </div>
        )}
      </label>
    </div>
  );
};

const FloatingInput = ({ label, id, ...props }) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        {...props}
        placeholder=" " // Quan trọng: Khoảng trắng để kích hoạt CSS logic
        className="peer w-full p-[10px_15px] text-base rounded-lg border border-[#8d8d8d] 
                   tracking-wider outline-none transition-all 
                   focus:border-[#4facf3] focus:ring-1 focus:ring-[#4facf3]/20"
      />
      <label
        htmlFor={id}
        className="absolute left-[15px] top-[10px] text-[#8d8d8d] pointer-events-none 
                   transition-all duration-300
                   peer-focus:-translate-y-[22px] peer-focus:-translate-x-2 
                   peer-focus:scale-[0.8] peer-focus:bg-white peer-focus:px-1 
                   peer-focus:text-[#4facf3] peer-focus:font-bold
                   peer-[:not(:placeholder-shown)]:-translate-y-[22px] 
                   peer-[:not(:placeholder-shown)]:-translate-x-2 
                   peer-[:not(:placeholder-shown)]:scale-[0.8] 
                   peer-[:not(:placeholder-shown)]:bg-white 
                   peer-[:not(:placeholder-shown)]:px-1"
      >
        {label}
      </label>
    </div>
  );
};

const FloatingInputPassword = ({ label, id, ...props }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={showPass ? "text" : "password"}
        {...props}
        placeholder=" "
        className="peer w-full p-[10px_15px] text-base rounded-lg border border-[#8d8d8d] 
                   tracking-wider outline-none transition-all 
                   focus:border-[#4facf3] focus:ring-1 focus:ring-[#4facf3]/20"
      />

      {/* ICON PHẢI NẰM NGOÀI THẺ INPUT */}
      <div
        className="absolute cursor-pointer top-1/2 -translate-y-1/2 right-[15px] text-[#8d8d8d] hover:text-[#4facf3] transition-colors"
        onClick={() => setShowPass(!showPass)}
      >
        {showPass ? (
          <Eye size={20} strokeWidth={1.5} />
        ) : (
          <EyeClosed size={20} strokeWidth={1.5} />
        )}
      </div>

      <label
        htmlFor={id}
        className="absolute left-[15px] top-[10px] text-[#8d8d8d] pointer-events-none 
                   transition-all duration-300
                   peer-focus:-translate-y-[22px] peer-focus:-translate-x-2 
                   peer-focus:scale-[0.8] peer-focus:bg-white peer-focus:px-1 
                   peer-focus:text-[#4facf3] peer-focus:font-bold
                   peer-[:not(:placeholder-shown)]:-translate-y-[22px] 
                   peer-[:not(:placeholder-shown)]:-translate-x-2 
                   peer-[:not(:placeholder-shown)]:scale-[0.8] 
                   peer-[:not(:placeholder-shown)]:bg-white 
                   peer-[:not(:placeholder-shown)]:px-1"
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
