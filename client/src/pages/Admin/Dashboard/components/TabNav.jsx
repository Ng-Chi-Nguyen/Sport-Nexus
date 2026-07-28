import { useSearchParams } from "react-router-dom";

const TABS = [
  { key: "business", label: "Kinh doanh" },
  { key: "customers", label: "Khách hàng" },
  { key: "products", label: "Sản phẩm" },
  { key: "inventory", label: "Kho & biến thể" },
  { key: "orders", label: "Đơn hàng" },
  { key: "promotions", label: "Khuyến mãi" },
  { key: "suppliers", label: "Nhà cung cấp" },
  { key: "reviews", label: "Đánh giá" },
  { key: "system", label: "Hệ thống" },
  { key: "overview", label: "Tổng hợp" },
];

export const TabNav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("tab") || "business";

  const handleTab = (key) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", key);
    setSearchParams(next);
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-900 bg-[#0D121F]/50 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleTab(tab.key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === tab.key
              ? "bg-sky-500/15 text-sky-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
