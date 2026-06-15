import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import productVariantdApi from "@/api/core/productVariantApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Biến thể sản phẩm", route: "/management/product-variants" },
  { title: "Thêm mới", route: "#" },
];

const CreateProductVariant = () => {
  const response = useLoaderData();
  const navigate = useNavigate();

  const [selectProdut, setSelectProduct] = useState("");
  const [selectAttributeKey, setSelectAttributeKey] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [value, setValue] = useState("");

  const products = response.products.data;
  const attributeKeys = response.attributeKeys.data;

  const productOptions = useMemo(() =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  );

  const attributeKeyOptions = useMemo(() =>
    attributeKeys.map((attrKey) => ({
      id: attrKey.id,
      name: attrKey.name,
    })),
  );

  const handleProductChange = (productId) => {
    setSelectProduct(productId);
  };

  const handleAttrChange = (attrId) => {
    setSelectAttributeKey(attrId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      stock: Number(stock),
      price: Number(price),
      product_id: Number(selectProdut),
      attributes: [
        {
          attribute_key_id: Number(selectAttributeKey),
          value: value,
        },
      ],
    };

    try {
      const response = await productVariantdApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-100 tracking-wide">
        Thêm mới biến thể sản phẩm
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        {/* KHỐI 1: GIÁ & KHO HÀNG (4 CỘT) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-6 rounded-2xl shadow-2xl backdrop-blur-md h-fit">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 mb-6 flex items-center gap-2 border-b border-white/5">
            <span className="w-1.5 h-3.5 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
            Giá & Kho hàng
          </h3>
          <div className="space-y-5">
            <FloatingInput
              label="Số lượng tồn kho"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <FloatingInput
              label="Giá bán biến thể"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI 2: CẤU HÌNH THUỘC TÍNH & NÚT HÀNH ĐỘNG (8 CỘT) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-20">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 mb-6 flex items-center gap-2 border-b border-white/5">
            <span className="w-1.5 h-3.5 rounded-sm bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></span>
            Cấu hình thuộc tính
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1">
              <SelectPro
                value={selectProdut}
                options={productOptions}
                onChange={handleProductChange}
                label="Sản phẩm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <SelectPro
                value={selectAttributeKey}
                options={attributeKeyOptions}
                onChange={handleAttrChange}
                label="Giá trị (Kích thước / Màu sắc...)"
              />
            </div>
          </div>

          {/* Ô nhập giá trị thuộc tính căng tràn thoải mái */}
          <div className="w-full mb-8">
            <FloatingInput
              label="Giá trị thuộc tính chi tiết (Ví dụ: XL, 42, Đỏ...)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {/* Đã chuyển bộ nút xuống góc dưới cùng bên phải cực kỳ cân đối */}
          <div className="flex justify-end border-t border-white/5 pt-5 w-full">
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductVariant;
