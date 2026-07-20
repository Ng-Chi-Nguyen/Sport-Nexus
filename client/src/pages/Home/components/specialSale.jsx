import logo from "@/assets/images/avatar-default.jpg";
import Badge from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export const SpecialSale = ({ products }) => {
  // Console log để kiểm tra dữ liệu nếu cần
  // console.log("Danh sách sản phẩm:", products);

  return (
    // Container chính: căn giữa, giới hạn chiều rộng, padding 2 bên và trên dưới
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Tiêu đề phần: Chữ đậm, lớn, màu tối, khoảng cách dưới */}
      <h2 className="mb-5">Bán chạy nhất</h2>
      <div className="grid grid-cols-1 [480px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product, idx) => (
          <div
            key={product.id || idx}
            className="group bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="flex flex-wrap flex-start aspect-square bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden relative">
              <span>{product.brand.name}</span>
              <img
                src={logo}
                alt={product.name || "Sản phẩm"}
                className="w-[90%] border object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="p-4 flex flex-col flex-grow space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug h-10 group-hover:text-blue-700 transition-colors">
                {product.name || "Tên sản phẩm mẫu"}
              </h3>

              <div className="pt-2 mt-auto border-t border-slate-50 space-y-2.5">
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="text-xs font-bold text-slate-500 ml-1">
                    4.5
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2">
                  {/* Giá tiền: Đậm, lớn, màu xanh */}
                  <p className="text-base font-extrabold text-blue-600 tracking-tight">
                    {/* Giả sử có product.price, nếu không hiện giá mẫu */}
                    {product.price
                      ? `${Number(product.price).toLocaleString()}đ`
                      : "150.000đ"}
                  </p>

                  {/* Nút mua hàng: Nhỏ, màu xanh nhạt, hover đậm */}
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95 shadow-inner">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
