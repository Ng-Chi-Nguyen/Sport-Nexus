import { ArrowLeft, Pencil, Plus, Trash, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BtnAdd = ({ name, route }) => {
  return (
    <Link
      to={route}
      className="
        inline-flex items-center justify-center gap-2
        py-2 px-6 w-fit
        bg-[#4facf3] text-white 
        font-bold text-[16px]
        table-retro
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all duration-150 group
      "
    >
      <Plus
        size={20}
        strokeWidth={4}
        className="group-hover:rotate-90 transition-transform"
      />
      <span className="">{name || "Thêm mới"}</span>
    </Link>
  );
};

const BtnSubmit = (props) => {
  const { name } = props;
  return (
    <>
      <button
        className="cursor-pointer font-bold overflow-hidden relative z-100 border-2 border-primary bg-white group px-8 py-2 
      active:translate-x-[2px] active:translate-y-[2px] transition-all duration-150"
      >
        {/* Chữ hiển thị */}
        <span className="relative z-10 text-[#4facf3] group-hover:text-white text-xl duration-500 uppercase">
          {name}
        </span>

        {/* Hiệu ứng nền chạy khi hover */}
        <span className="absolute w-full h-full bg-[#4facf3] -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-500"></span>
        <span className="absolute w-full h-full bg-[#4facf3] -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-500"></span>
      </button>
    </>
  );
};

const BtnGoback = () => {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

  const handleGoBack = () => {
    navigate(-1); // Lệnh quay lại trang trước đó trong lịch sử trình duyệt
  };
  return (
    <>
      <button
        onClick={handleGoBack}
        type="button"
        className="bg-white text-center w-[150px] h-[47px] relative text-black text-xl font-semibold border-2 border-blue-500 group"
      >
        <div className="bg-[#4facf3] h-[44px] w-1/3 grid place-items-center absolute left-0 top-0 group-hover:w-full z-10 duration-500 transition-all">
          <ArrowLeft
            size={25}
            color="#FFF"
            strokeWidth={2.5} // Làm icon đậm hơn để hợp với phong cách Retro
          />
        </div>
        <p className="translate-x-4 text-[15px]">Quay lại</p>
      </button>
    </>
  );
};

const BtnEdit = (props) => {
  let { route, name } = props;
  return (
    <Link
      to={route}
      className="flex items-center justify-center p-2 bg-[#f39e4f] text-white border-2 border-[#323232] shadow-[3px_3px_0px_0px_#323232] rounded-[5px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all duration-150 group"
      title="Chỉnh sửa"
    >
      <Pencil
        size={18}
        strokeWidth={2.5}
        className="group-hover:rotate-12 transition-transform"
      />
      <span className="ml-1 text-sm font-bold uppercase">{name}</span>
    </Link>
  );
};

const BtnDelete = (props) => {
  // Bóc tách thêm onClick và className từ props
  const { onClick, className, name } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center justify-center py-2 px-4 bg-[#ee1111] text-white 
        border-2 border-[#323232] shadow-[3px_3px_0px_0px_#323232] 
        rounded-[5px] hover:translate-x-[2px] hover:translate-y-[2px] 
        hover:shadow-none active:translate-x-[3px] 
        active:translate-y-[3px] active:shadow-none transition-all duration-200 ${className}`}
      title="Xóa dữ liệu"
    >
      <div className="relative w-[18px] h-[18px] mr-2">
        {/* 1. Phần Nắp - Chỉ lấy phần trên cùng */}
        <Trash2
          size={18}
          strokeWidth={2.5}
          className="absolute top-0 left-0 z-10 origin-bottom-left transition-transform duration-300
           ease-in-out group-hover:-rotate-[35deg] group-hover:-translate-y-0 group-hover:translate-x-1.5"
          style={{ clipPath: "inset(0 0 65% 0)" }} // Cắt bỏ 65% phía dưới
        />

        {/* 2. Phần Thân - Cắt bỏ phần nắp phía trên để không bị 2 nắp */}
        <Trash2
          size={18}
          strokeWidth={2.5}
          className="absolute top-0 left-0 z-0"
          style={{ clipPath: "inset(35% 0 0 0)" }} // Cắt bỏ 35% phía trên (phần nắp)
        />
      </div>

      <span className="text-[14px] font-black uppercase tracking-wider">
        {name}
      </span>
    </button>
  );
};

const Submit_GoBack = (props) => {
  const { name } = props;
  return (
    <div className="flex items-start gap-2 bg-blue-200 py-2 px-5">
      <BtnGoback />
      <BtnSubmit name={name || "Thêm"} />
    </div>
  );
};

export { BtnAdd, BtnSubmit, BtnGoback, BtnEdit, BtnDelete, Submit_GoBack };
