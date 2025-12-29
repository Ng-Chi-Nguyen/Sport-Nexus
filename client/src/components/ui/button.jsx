import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Button3D = (props) => {
  let { name } = props;
  return (
    <>
      <button className="active:shadow-none active:translate-x-[3px] active:translate-y-[3px] shadow-[3px_3px_0px_0px_#fafafa] transition-all rounded-[10px]">
        <Link
          to="/management/users/create" // Sửa lỗi chính tả: managament -> management
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

export { Button3D };
