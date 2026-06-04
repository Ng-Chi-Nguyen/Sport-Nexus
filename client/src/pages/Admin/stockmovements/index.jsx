import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters"; // Sử dụng các hàm format của bạn
import Badge from "@/components/ui/badge";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Tồn kho", route: "#" },
];

const StockPage = () => {
  const response = useLoaderData() || {};
  // Lấy mảng dữ liệu từ cấu trúc dữ liệu mới của bạn
  const stocks = response.data?.list_stocks || [];
  console.log(stocks);

  const getStockColor = (stockQty) => {
    if (stockQty < 10) return "red"; // Đỏ nguy hiểm (Sắp hết hàng)
    if (stockQty <= 50) return "orange"; // Cam cảnh báo (Cần chuẩn bị nhập)
    if (stockQty <= 100) return "blue"; // Xanh dương ổn định
    return "green"; // Xanh lá an toàn (Tồn kho dồi dào)
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm lịch sử biến động..." />
        </div>
        <BtnAdd
          route={"/management/stocks/create"}
          className="w-[20%]"
          name="Tạo biến động kho"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-slate-800">Biến động kho</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-between">
            <div className="flex flex-wrap items-center gap-4 my-3 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 w-fit">
              <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                Chú thích:
              </span>

              {/* Đỏ */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span>Nguy hiểm (Dưới 10)</span>
              </div>

              {/* Cam */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                <span>Cảnh báo (10 - 50)</span>
              </div>

              {/* Xanh dương */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span>Ổn định (51 - 100)</span>
              </div>

              {/* Xanh lá */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span>An toàn (Trên 100)</span>
              </div>
            </div>
          </div>
          <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            Tổng số sản phẩm: {stocks.length}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Tồn kho</th>
                {/* <th className="px-6 py-4 text-center">//</th>
                <th className="px-6 py-4">Hành động</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-slate-600">
              {stocks.length > 0 ? (
                stocks.map((stock) => {
                  const product = stock.product;
                  const thumbnail = product?.thumbnail;
                  const productName =
                    product?.name || "Sản phẩm không xác định";
                  const price = stock.price ? Number(stock.price) : 0;
                  const currentStock = stock.stock ?? 0;

                  return (
                    <tr
                      key={stock.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        #VAR-{stock.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            crossOrigin="anonymous"
                            src={thumbnail || "https://placehold.co/50"}
                            alt={productName}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-slate-100"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/50";
                            }}
                          />
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1 max-w-[250px]">
                              {productName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Giá gốc: {formatCurrency(price)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={getStockColor(currentStock)}>
                          <span className="text-[16px] font-bold px-1.5 py-0.5 block">
                            {currentStock}
                          </span>
                        </Badge>
                      </td>
                      {/* <td className="px-6 py-4 text-center font-medium text-slate-700">
                        //
                      </td>
                      <td className="px-6 py-4"></td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Không tìm thấy dữ liệu tồn kho phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StockPage;
