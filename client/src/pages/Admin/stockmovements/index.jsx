import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { SimpleSelect } from "@/components/ui/select";
import { LayoutDashboard, Filter, ChevronDown } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { formatCurrency } from "@/utils/formatters";
import { getStockBadgeClass } from "@/utils/statusStyles";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Tồn kho", route: "#" },
];

const StockPage = () => {
  const response = useLoaderData() || {};
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentProductId = searchParams.get("product_id") || "";
  const currentStockMin = searchParams.get("stock_min") || "";
  const currentStockMax = searchParams.get("stock_max") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilters =
    currentProductId ||
    currentStockMin ||
    currentStockMax ||
    currentPriceMin ||
    currentPriceMax;

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const stocks = response?.data?.list_stocks || [];
  const paginationInfo = response?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm sản phẩm..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
            hasActiveFilters
              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
              : "bg-[#111827]/40 text-slate-400 border-slate-800 hover:bg-[#161F32] hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
          />
        </button>
        <BtnAdd route={"/management/stocks/create"} name="Tạo biến động kho" />
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-[500px] opacity-100 mb-4 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <SimpleSelect
                label="Sản phẩm"
                value={currentProductId}
                onChange={(val) => setFilter("product_id", val)}
                options={[
                  { slug: "", name: "Tất cả" },
                  ...(response.products || []).map((p) => ({
                    slug: String(p.id),
                    name: p.name,
                  })),
                ]}
                placeholder="Tất cả"
              />
            </div>

            <div className="w-[220px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Tồn kho
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={currentStockMin}
                  onChange={(e) => setFilter("stock_min", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={currentStockMax}
                  onChange={(e) => setFilter("stock_max", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="w-[220px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Khoảng giá
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={currentPriceMin}
                  onChange={(e) => setFilter("price_min", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
                <span className="text-slate-600 shrink-0">–</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={currentPriceMax}
                  onChange={(e) => setFilter("price_max", e.target.value)}
                  className="w-full h-10 px-2 text-xs rounded-lg bg-[#111827]/40 border border-slate-800 text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="h-10 flex items-center shrink-0">
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1 text-[10px] font-bold rounded border border-slate-800 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI NỀN TỔNG - Chuyển hoàn toàn sang tối mờ GlassOS */}
      <div className="\bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        {/* HEADER TIÊU ĐỀ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-wide">
              Biến động kho
            </h2>

            {/* Chú thích màu sắc phong cách Cyberpunk tối giản */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-medium text-slate-400 bg-[#111827]/60 px-4 py-2 rounded-xl border border-slate-900/60 w-fit">
              <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                Chú thích:
              </span>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                <span>Nguy hiểm (&lt; 10)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                <span>Cảnh báo (10 - 50)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></div>
                <span>Ổn định (51 - 100)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span>An toàn (&gt; 100)</span>
              </div>
            </div>
          </div>

          <div className="text-xs bg-[#111827] text-slate-400 border border-slate-800 px-3 py-1.5 rounded-xl font-medium h-fit self-end">
            Tổng số mặt hàng:{" "}
            <span className="text-sky-400 font-bold">
              {paginationInfo.totalItems || stocks.length}
            </span>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU CHUẨN ĐƯỜNG KẺ TRẮNG MỜ BIÊN DƯỚI */}
        <div className="mb-2 table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 w-[15%]">
                  Mã định danh
                </th>
                <th scope="col" className="px-6 py-4 w-[60%] !text-start">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-4 w-[25%] text-center">
                  Số lượng tồn
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.length > 0 ? (
                stocks.map((stock) => {
                  const product = stock.product;
                  const thumbnail = product?.thumbnail;
                  const productName =
                    product?.name || "Sản phẩm không xác định";
                  const price = stock.price ? Number(stock.price) : 0;
                  const currentStock = stock.stock ?? 0;

                  return (
                    <tr key={stock.id}>
                      {/* Cột ID biến thể */}
                      <td className="px-6 py-5 font-mono text-xs text-slate-500 text-center">
                        #VAR-{stock.id}
                      </td>

                      {/* Cột Chi tiết sản phẩm */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-slate-800 bg-[#111827] overflow-hidden flex-shrink-0 p-0.5">
                            <img
                              crossOrigin="anonymous"
                              src={thumbnail || "https://placehold.co/50"}
                              alt={productName}
                              className="w-full h-full object-contain mix-blend-screen"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/50";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-200 text-sm line-clamp-1 max-w-[400px] tracking-wide">
                              {productName}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Giá gốc:{" "}
                              <span className="text-[12px] font-semibold text-emerald-400">
                                {Number(price).toLocaleString()}
                              </span>{" "}
                              đ
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột hiển thị Số lượng Badge phát sáng mờ */}
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[50px] px-3 py-1 rounded-lg text-sm font-bold border ${getStockBadgeClass(currentStock)}`}
                          >
                            {currentStock}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    Không tìm thấy dữ liệu tồn kho phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default StockPage;
