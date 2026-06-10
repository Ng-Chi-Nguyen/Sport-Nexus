import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import { formatCurrency } from "@/utils/formatters";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Tồn kho", route: "#" },
];

const StockPage = () => {
  const response = useLoaderData() || {};
  const stocks = response.data?.list_stocks || [];

  // Hàm sinh class phát sáng (Neon Glow) theo số lượng tồn kho cực sang cho Dark Mode
  const getStockBadgeClass = (stockQty) => {
    if (stockQty < 10) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
    }
    if (stockQty <= 50) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
    }
    if (stockQty <= 100) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
    }
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM - Đồng bộ khoảng cách */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm lịch sử biến động..." />
        </div>
        <BtnAdd route={"/management/stocks/create"} name="Tạo biến động kho" />
      </div>

      {/* KHỐI NỀN TỔNG - Chuyển hoàn toàn sang tối mờ GlassOS */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
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
            <span className="text-sky-400 font-bold">{stocks.length}</span>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU CHUẨN ĐƯỜNG KẺ TRẮNG MỜ BIÊN DƯỚI */}
        <div className="table-retro">
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
      </div>
    </div>
  );
};

export default StockPage;
