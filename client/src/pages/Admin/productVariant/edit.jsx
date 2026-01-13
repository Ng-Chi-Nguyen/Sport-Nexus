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
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Biến thể sản phẩm", route: "/management/product-variants" },
  { title: "Thêm mới", route: "#" },
];

const CreateProductVariant = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  // console.log(response);
  const products = response.products.data;
  const attributeKeys = response.attributeKeys.data;
  const product_variant = response.product_variant.data;

  const [selectProdut, setSelectProduct] = useState(product_variant.product_id);
  const [selectAttributeKey, setSelectAttributeKey] = useState(
    product_variant.VariableAttributes[0].attributeKey.id
  );
  const [stock, setStock] = useState(product_variant.stock);
  const [price, setPrice] = useState(product_variant.price);
  const [value, setValue] = useState(
    product_variant.VariableAttributes[0].value
  );

  const productOptions = useMemo(() =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
    }))
  );

  const attributeKeyOptions = useMemo(() =>
    attributeKeys.map((attrKey) => ({
      id: attrKey.id,
      name: attrKey.name,
    }))
  );
  // console.log(productOptions);
  // console.log(response);

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

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // console.log(dataToSend);
    // console.log("===============================");

    try {
      const response = await productVariantdApi.update(
        product_variant.id,
        dataToSend
      );
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
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="my-2">Thêm mới biến thể sản phẩm</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5 w-full">
        <div className="col-span-12 lg:col-span-4 flex flex-col border border-gray-200 p-5 rounded-[5px] bg-white shadow-sm h-fit">
          <h3 className="font-bold text-sm uppercase border-b-2 border-blue-500 pb-3 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500"></span>
            Giá & Kho hàng
          </h3>
          <div className="space-y-4">
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
        <div className="col-span-12 lg:col-span-8 flex flex-col border border-gray-200 p-5 rounded-[5px] bg-white shadow-sm">
          <h3 className="font-bold text-sm uppercase border-b-2 border-blue-500 pb-3 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500"></span>
            Cấu hình thuộc tính
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                label="Giá trị"
              />
            </div>
          </div>
          <div className="flex justify-between gap-1">
            <div className="w-full mr-7">
              <FloatingInput
                label="Giá trị thuộc thính"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="">
              <Submit_GoBack name="Sữa" />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateProductVariant;
