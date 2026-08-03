import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TABS = [
  { key: "description", label: "Mô tả sản phẩm" },
  { key: "shipping", label: "Chính sách giao hàng" },
  { key: "return", label: "Chính sách đổi trả" },
];

const DescriptionTab = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    }
  }, [description]);

  return (
    <div className="space-y-3">
      <div
        ref={textRef}
        className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line transition-all ${
          !expanded ? "line-clamp-4" : ""
        }`}
      >
        {description}
      </div>
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-sky-400 bg-white dark:bg-[#111827]/60 py-1.5 px-4 border border-sky-200 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all shadow-sm cursor-pointer"
        >
          {expanded ? (
            <>
              Thu gọn <ChevronUp size={16} />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ShippingTab = () => (
  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
    <p>- Miễn phí giao hàng cho đơn hàng từ 500.000₫</p>
    <p>
      - Thời gian giao hàng: 3-7 ngày làm việc (nội thành), 5-10 ngày (ngoại
      thành)
    </p>
    <p>- Giao hàng COD và chuyển khoản đều được hỗ trợ</p>
    <p>- Kiểm tra hàng trước khi thanh toán</p>
  </div>
);

const ReturnTab = () => (
  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
    <p>- Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</p>
    <p>- Sản phẩm còn nguyên tem mác, chưa qua sử dụng</p>
    <p>- Hoàn tiền 100% nếu sản phẩm bị lỗi từ nhà sản xuất</p>
    <p>- Phí đổi trả: 15.000₫ (miễn phí nếu lỗi nhà sản xuất)</p>
  </div>
);

const ProductTabs = ({ description }) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 font-semibold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="py-4">
        {activeTab === "description" && (
          <DescriptionTab description={description} />
        )}
        {activeTab === "shipping" && <ShippingTab />}
        {activeTab === "return" && <ReturnTab />}
      </div>
    </div>
  );
};

export default ProductTabs;
