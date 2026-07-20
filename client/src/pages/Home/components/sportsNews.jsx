import { Newspaper, ChevronRight } from "lucide-react";

const newsList = [
  {
    title: "Sân bóng chuyền hơi: Tiêu chuẩn thiết kế và sự khác biệt với sân đấu lớn",
  },
  {
    title: "Tiêu chuẩn xây dựng sân bóng chuyền chất lượng cho câu lạc bộ",
  },
  {
    title: "Kích thước sân bóng chuyền hơi mới nhất: Những điều cần lưu ý khi kẻ vạch",
  },
  {
    title: "Cập nhật luật bóng chuyền hơi mới nhất: Quy định đổi sân và tính điểm",
  },
];

export const SportsNews = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-100">
            <Newspaper className="text-white" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Cẩm nang
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Tư vấn thể thao
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group cursor-pointer rounded-xl overflow-hidden border border-slate-50 hover:shadow-md transition-shadow">
              <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-100 to-sky-50 flex items-center justify-center">
                <span className="text-slate-300 font-black text-4xl">BÓNG CHUYỀN</span>
              </div>
              <div className="p-4 space-y-2">
                <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Bóng chuyền
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  Kích thước sân bóng chuyền hơi nam và nữ: Những thông số bạn bắt buộc cần biết
                </h4>
                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                  Tại Việt Nam, bóng chuyền hơi đã trở thành một phong trào rèn luyện sức khỏe vô cùng bổ ích cho mọi lứa tuổi...
                </p>
                <div className="flex items-center text-blue-600 text-[12px] font-semibold gap-0.5 pt-1">
                  Đọc tiếp <ChevronRight size={14} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {newsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0 cursor-pointer group"
                >
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 shadow-sm flex items-center justify-center">
                    <span className="text-slate-300 text-2xl font-black">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h5 className="text-[13px] font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h5>
                    <span className="text-[11px] text-slate-400 mt-1 font-medium">
                      3 ngày trước
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
