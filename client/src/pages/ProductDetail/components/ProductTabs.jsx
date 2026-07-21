import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TABS = [
  { key: "description", label: "Mô tả sản phẩm" },
  { key: "shipping", label: "Chính sách giao hàng" },
  { key: "return", label: "Chính sách đổi trả" },
];

const TAB_CONTENT = {
  description: (desc, expanded, onToggle, isOverflowing) => (
    <div>
      <div
        className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line transition-all ${
          !expanded && isOverflowing ? "line-clamp-4" : ""
        }`}
        ref={(el) => {
          // store ref check via closure in parent
        }}
      >
        {desc}
      </div>
      {isOverflowing && (
        <button
          onClick={onToggle}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white py-1 px-3 border border-blue-200 rounded-full hover:bg-blue-50 transition-all"
        >
          {expanded ? (
            <>Thu gọn <ChevronUp size={16} /></>
          ) : (
            <>Xem thêm <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  ),
  shipping: () => (
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">
      <p>- Miễn phí giao hàng cho đơn hàng từ 500.000₫</p>
      <p>- Thời gian giao hàng: 3-7 ngày làm việc (nội thành), 5-10 ngày (ngoại thành)</p>
      <p>- Giao hàng COD và chuyển khoản đều được hỗ trợ</p>
      <p>- Kiểm tra hàng trước khi thanh toán</p>
    </div>
  ),
  return: () => (
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">
      <p>- Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</p>
      <p>- Sản phẩm còn nguyên tem mác, chưa qua sử dụng</p>
      <p>- Hoàn tiền 100% nếu sản phẩm bị lỗi từ nhà sản xuất</p>
      <p>- Phí đổi trả: 15.000₫ (miễn phí nếu lỗi nhà sản xuất)</p>
    </div>
  ),
};

const DescriptionTab = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [description]);

  return (
    <div>
      <div
        ref={textRef}
        className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line transition-all ${
          !expanded ? "line-clamp-4" : ""
        }`}
      >
        {description}
      </div>
      {isOverflowing && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white py-1.5 px-4 border border-blue-200 rounded-full hover:bg-blue-50 transition-all shadow-sm"
        >
          {expanded ? (
            <>Thu gọn <ChevronUp size={16} /></>
          ) : (
            <>Xem thêm <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
};

const ProductTabs = ({ description }) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="border-t border-slate-200 pt-6">
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {activeTab === "description" ? (
          <DescriptionTab description={description} />
        ) : (
          TAB_CONTENT[activeTab]()
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
