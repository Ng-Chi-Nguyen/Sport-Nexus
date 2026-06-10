import { ArrowLeft, Edit, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// 1. NÚT THÊM MỚI (Thường nằm trên đầu danh sách)
const BtnAdd = ({ name, route }) => {
  return (
    <Link
      to={route}
      className="
        inline-flex items-center justify-center gap-2
        py-2 px-5 w-fit rounded-xl
        bg-blue-600 hover:bg-blue-500 text-white 
        font-medium text-[14px] tracking-wide
        shadow-[0_0_15px_rgba(37,99,235,0.2)]
        hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]
        active:scale-95 transition-all duration-150 group
      "
    >
      <Plus
        size={16}
        strokeWidth={2}
        className="group-hover:rotate-90 transition-transform duration-200"
      />
      <span>{name || "Thêm mới"}</span>
    </Link>
  );
};

// 2. NÚT LƯU / SUBMIT FORM
const BtnSubmit = (props) => {
  const { name } = props;
  return (
    <button
      type="submit"
      className="cursor-pointer font-medium text-[14px] tracking-wider text-white px-6 py-2.5 rounded-xl
                 bg-sky-600 hover:bg-sky-500
                 shadow-[0_0_15px_rgba(14,165,233,0.2)]
                 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]
                 active:scale-95 transition-all duration-150 uppercase"
    >
      {name}
    </button>
  );
};

// 3. NÚT QUAY LẠI
const BtnGoback = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      type="button"
      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                 bg-[#111827] text-slate-400 hover:text-slate-200 
                 border border-slate-800 hover:border-slate-700
                 text-[14px] font-medium active:scale-95 transition-all duration-150 group"
    >
      <ArrowLeft
        size={16}
        strokeWidth={2}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
      <span>Quay lại</span>
    </button>
  );
};

// 4. NÚT SỬA (Dạng Badge/Button có text đi kèm)
const BtnEdit = (props) => {
  let { route, name } = props;
  return (
    <Link
      to={route}
      className="flex items-center justify-center px-3 py-1.5 bg-amber-500/10 text-amber-400 
                 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 
                 active:scale-95 transition-all duration-150 group"
      title="Chỉnh sửa"
    >
      <Pencil size={14} strokeWidth={2} />
      {name && (
        <span className="ml-1.5 text-xs font-medium uppercase">{name}</span>
      )}
    </Link>
  );
};

// 5. NÚT XÓA (Dạng Badge/Button kèm hiệu ứng mở nắp thùng rác đã tối ưu)
const BtnDelete = (props) => {
  const { onClick, className, name } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-center px-3 py-1.5 bg-rose-500/10 text-rose-400 
        border border-rose-500/30 rounded-lg hover:bg-rose-500/20 
        active:scale-95 transition-all duration-150 ${className}`}
      title="Xóa dữ liệu"
    >
      <div className="relative w-[14px] h-[14px] ${name ? 'mr-1.5' : ''}">
        {/* Phần Nắp thùng rác */}
        <Trash2
          size={14}
          strokeWidth={2}
          className="absolute top-0 left-0 z-10 origin-bottom-left transition-transform duration-200
                     ease-in-out group-hover:-rotate-[30deg] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]"
          style={{ clipPath: "inset(0 0 65% 0)" }}
        />
        {/* Phần Thân thùng rác */}
        <Trash2
          size={14}
          strokeWidth={2}
          className="absolute top-0 left-0 z-0"
          style={{ clipPath: "inset(35% 0 0 0)" }}
        />
      </div>

      {name && (
        <span className="text-xs font-medium uppercase ml-1">{name}</span>
      )}
    </button>
  );
};

// 6. CỤM NÚT ĐIỀU HƯỚNG CUỐI FORM (Quay lại + Lưu)
const Submit_GoBack = (props) => {
  const { name, justify = "start" } = props;
  return (
    <div
      className={`flex items-center gap-3 py-4 justify-${justify} border-t border-slate-900/60 mt-6`}
    >
      <BtnGoback />
      <BtnSubmit name={name || "Lưu lại"} />
    </div>
  );
};

// 7. CỤM ICON THAO TÁC TRONG BẢNG (Sửa/Xóa mini gọn gàng như hình mẫu)
const BtnActions = ({ route, id, onDelete }) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <Link
        to={route}
        className="p-2 bg-[#111827] text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/30 rounded-lg transition-all duration-150"
        title="Sửa"
      >
        <Edit size={14} />
      </Link>

      <button
        onClick={() => onDelete(id)}
        className="p-2 bg-[#111827] text-slate-400 hover:text-rose-500 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-all duration-150"
        title="Xóa"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export {
  BtnAdd,
  BtnSubmit,
  BtnGoback,
  BtnEdit,
  BtnDelete,
  Submit_GoBack,
  BtnActions,
};
