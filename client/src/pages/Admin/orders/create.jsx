import { useState, useMemo } from "react";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
// utils
import { formatCurrency } from "@/utils/formatters";
// api
import couponApi from "@/api/management/couponApi";
import orderApi from "@/api/customer/orderApi";
// lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
  { title: "Thêm đơn hàng mới", route: "#" },
];

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();
  // console.log(response);
  // state form
  const [items, setItems] = useState([
    {
      id: Date.now(),
      product_variant_id: "",
      quantity: 1,
      price_at_purchase: 0,
    },
  ]);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("COD");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [discount, setDiscount] = useState(0); // tiền giảm
  const [final, setFinal] = useState(0); // tiền trả thực tế
  const [code, setCode] = useState(null);
  const [status, setStatus] = useState("Processing");

  const handleAddItem = () => {
    if (items.length >= 10) {
      toast.error("Nếu số lượng món hàng lớn hơn 10 món hãy nhập bằng file");
      return;
    }

    setItems([
      ...items,
      {
        id: Date.now(),
        product_variant_id: "",
        quantity: 1,
        price_at_purchase: 0,
      },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    setDiscount(0);
    setFinal(0);
  };

  // 1. Tính Tạm tính (Tổng tiền hàng)
  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc + Number(item.quantity || 0) * Number(item.price_at_purchase || 0)
      );
    }, 0);
  }, [items]);

  // 2. Tính Tổng cuối (Sau khi trừ giảm giá)
  // const finalAmount = useMemo(() => {
  //   const result = totalAmount - Number(discount || 0);
  //   return result > 0 ? result : 0;
  // }, [totalAmount, discount]);

  const variantsOptions = useMemo(
    () =>
      response.productVariants.data.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [response.productVariants.data],
  );

  const handleMethodChange = (methodName) => {
    setMethod(methodName);
  };
  const handleStatusChange = (status) => {
    setStatus(status);
  };
  const handlePaymentStatusChange = (paymentStatus) => {
    setPaymentStatus(paymentStatus);
  };

  const handleApplyCoupon = async () => {
    // console.log(totalAmount);
    // console.log(code);
    const dataCouponToSend = {
      amount: totalAmount,
      code: code,
    };
    // console.log(dataCouponToSend);
    try {
      const resCoupon = await couponApi.check(dataCouponToSend);
      if (resCoupon.success) {
        // console.log(resCoupon);
        toast.success(resCoupon.message);
        setDiscount(resCoupon.data.discount);
        setFinal(resCoupon.data.newAmount);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmountToSend = final === 0 ? totalAmount : final;
    const dataToSend = {
      total_amount: totalAmount,
      status: status,
      discount_amount: discount,
      final_amount: finalAmountToSend,
      shipping_address: address,
      coupon_code: code,
      user_email: email,
      payment_method: method,
      payment_status: paymentStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        price_at_purchase: Number(item.price_at_purchase),
      })),
    };
    // console.log(dataToSend);
    try {
      const response = await orderApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
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
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <h2>Tạo đơn hàng mới</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <div className="w-1/4 flex flex-col gap-2">
          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="cyan">Thông tin khách hàng</TitleManagement>
            <div className="flex flex-col gap-4">
              <FloatingInput
                label="Email khách hàng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                label="Địa chỉ giao hàng"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="orange">
              Thanh toán & Mã giảm giá
            </TitleManagement>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FloatingInput
                    label="Mã giảm giá"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="h-[46px] px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-[5px] text-[11px] font-black hover:bg-blue-100 transition-all uppercase tracking-wider"
                >
                  K.tra
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="emerald">Tổng kết đơn hàng</TitleManagement>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Số tiền giảm:</span>
                <span>{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-green-500 border-t pt-2 text-lg font-black">
                <span>Tổng cuối:</span>
                <span>
                  {discount !== 0
                    ? formatCurrency(final)
                    : formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="violet">Thông tin đơn hàng</TitleManagement>
            <div className="flex gap-2">
              <div className="w-1/3">
                <SelectPro
                  label="Phương thức thanh toán"
                  options={[
                    { id: "MOMO", name: "Ví MoMo" },
                    { id: "COD", name: "Tiền mặt" },
                  ]}
                  value={method}
                  onChange={handleMethodChange}
                />
              </div>
              <div className="w-1/3">
                <SelectPro
                  label="Trạng thái đơn hàng"
                  options={[
                    { id: "Processing", name: "Chuẩn bị hàng" },
                    { id: "Shipping", name: "Đang giao" },
                    { id: "Delivered", name: "Đã giao" },
                    { id: "Cancelled", name: "Hủy" },
                    { id: "Refunded", name: "Trả hàng" },
                  ]}
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>
              <div className="w-1/3">
                <SelectPro
                  label="Trạng thái thanh toán"
                  options={[
                    { id: "Pending", name: "Chờ thanh toán" },
                    { id: "Paid", name: "Đã thanh toán" },
                    { id: "Failed", name: "Thanh toán thất bại" },
                    { id: "Refunded", name: "Hoàn tiền" },
                  ]}
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                />
              </div>
            </div>
          </div>
          <div className=" bg-white p-5 rounded-[5px] border border-gray-200">
            <div className="flex justify-between items-start">
              <TitleManagement color="blue">
                Danh sách sản phẩm mua
              </TitleManagement>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-[5px] text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition"
              >
                <Plus size={16} /> Thêm sản phẩm
              </button>
            </div>

            <div className="flex flex-col gap-4 min-h-[550px] max-h-[550px] overflow-y-auto pr-2 custom-scrollbar pb-20">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-[5px] border border-gray-200 relative"
                  style={{ zIndex: items.length - index }} // Chống ẩn Select
                >
                  <div className="flex-1">
                    <SelectPro
                      value={item.variantId}
                      options={variantsOptions}
                      onChange={(val) =>
                        handleItemChange(item.id, "variantId", val)
                      }
                      label="Sản phẩm"
                    />
                  </div>
                  <div className="w-24">
                    <FloatingInput
                      label="SL"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-40">
                    <FloatingInput
                      label="Đơn giá"
                      type="number"
                      value={item.price_at_purchase}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "price_at_purchase",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="w-[70px]">
                    <span className="text-xs font-bold text-blue-600">
                      {formatCurrency(item.quantity * item.price_at_purchase)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setItems(items.filter((i) => i.id !== item.id));
                      setDiscount(0);
                      setFinal(0);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
