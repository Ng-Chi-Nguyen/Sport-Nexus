import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Button3DLink = (props) => {
  let { name, route } = props;
  // console.log(route);
  return (
    <>
      <button className="active:shadow-none active:translate-x-[3px] active:translate-y-[3px] shadow-[3px_3px_0px_0px_#fafafa] transition-all rounded-[10px]">
        <Link
          to={route}
          className="
            inline-flex items-center justify-center gap-2 
            py-1.5 px-3 w-fit
            bg-[#4facf3] text-white 
            rounded-[4px] border-none
            transition-all duration-75
            active:translate-x-[2px] active:translate-y-[2px]
            shadow-[4px_4px_2px_2px_rgba(0,0,0,0.1)]
            active:shadow-none
            cursor-pointer
            "
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-[15px] font-medium leading-none">
            {name || "Thêm người dùng"}
          </span>
        </Link>
      </button>
    </>
  );
};

const ButtonSubmit = (props) => {
  const { name } = props;
  return (
    <>
      <button className="mb-[5px] cursor-pointer font-bold overflow-hidden relative z-100 border-2 border-[#323232] bg-white group px-8 py-2 shadow-[4px_4px_0px_0px_#4facf3] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150">
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

const ButtonGoback = () => {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

  const handleGoBack = () => {
    navigate(-1); // Lệnh quay lại trang trước đó trong lịch sử trình duyệt
  };
  return (
    <>
      <button
        onClick={handleGoBack}
        type="button"
        className="bg-white text-center w-[150px] h-[50px] relative text-black text-xl font-semibold border-2 border-blue-500 group"
      >
        <div className="bg-[#4facf3] h-[48px] w-1/3 grid place-items-center absolute left-0 top-0 group-hover:w-full z-10 duration-500 transition-all">
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

export { Button3DLink, ButtonSubmit, ButtonGoback };
