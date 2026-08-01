import { useSearchParams } from "react-router-dom";

const TABS = [
  { key: "business", label: "Kinh doanh" },
  { key: "customers", label: "Khách hàng" },
  { key: "products", label: "Sản phẩm" },
  { key: "inventory", label: "Kho" },
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
    <div
      className="flex flex-wrap gap-1 rounded-xl border p-1 transition-colors duration-200
                    bg-slate-100 border-slate-200 
                    dark:bg-[#0D121F]/50 dark:border-slate-900"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => handleTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-white text-sky-600 shadow-sm dark:bg-sky-500/15 dark:text-sky-300 dark:shadow-none font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
