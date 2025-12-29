import { useState } from "react";
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

const InputFile = ({ label, name }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo đường dẫn tạm thời cho file ảnh
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col justify-center gap-2 w-full">
      {/* Label phong cách Sport Nexus */}
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}

      <div className="m-auto relative w-[200px] h-[200px] border-2 border-dashed border-gray-300  rounded-full bg-gray-50 hover:border-[#4facf3] transition-colors flex items-center justify-center overflow-hidden">
        {selectedImage ? (
          <>
            {/* Ảnh xem trước */}
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Nút xóa ảnh */}
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer rounded-full">
            <ImagePlus size={32} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Nhấn để tải ảnh lên</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export { InputFrom, InputPassword, InputFile };
