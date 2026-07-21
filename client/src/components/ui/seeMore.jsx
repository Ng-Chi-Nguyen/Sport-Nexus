import { ChevronRight } from "lucide-react";

const SeeMore = ({ onClick, href, label = "Xem thêm" }) => {
  return (
    <div className="flex justify-center pt-6">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 rounded-lg px-5 py-2.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        {label}
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default SeeMore;
