import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
import { PURCHASE_STATUS_OPTIONS } from "@/constants/management/purchaseOrder";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

const CreatePurchaseOrder = () => {
  const { t } = useTranslation("translation", { keyPrefix: "purchaseOrder" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const responses = useLoaderData();
  const navigate = useNavigate();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("supply_chain"), route: "" },
    { title: t("purchase_title"), route: "/management/purchase" },
    { title: t("create_breadcrumb"), route: "" },
  ];

  // 1. State quản lý thông tin chung
  const [selectSupplier, setSelectSupplier] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [selectStatus, setSelectStatus] = useState("PENDING");

  // 2. State quản lý danh sách món hàng
  const [items, setItems] = useState([
    { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
  ]);

  // 3. Tự động tính tổng tiền khi danh sách items thay đổi
  const totalCost = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.cost || 0),
      0,
    );
  }, [items]);

  // 4. Chuẩn bị Options từ LoaderData
  const suppliersOptions = useMemo(
    () => responses.suppliers.data.map((s) => ({ id: s.id, name: s.name })),
    [responses.suppliers.data],
  );

  const variantsOptions = useMemo(() => {
    if (!responses?.productVariants?.data) return [];

    return responses.productVariants.data.map((v) => {
      const hasAttributes =
        Array.isArray(v.VariableAttributes) && v.VariableAttributes.length > 0;

      const attrName = hasAttributes
        ? v.VariableAttributes[0]?.attributeKey?.name
        : "";
      const attrValue = hasAttributes ? v.VariableAttributes[0]?.value : "";

      const variantLabel = hasAttributes ? ` - ${attrName}: ${attrValue}` : "";

      return {
        id: v.id,
        name: `${v.product?.name || t("unknown_product")}${variantLabel}`,
      };
    });
  }, [responses?.productVariants?.data]);

  // 5. Hàm xử lý logic món hàng
  const handleAddItem = (e) => {
    e.preventDefault();
    if (items.length >= 10) {
      ShowToast("error", t("max_items_error"));
      return;
    }
    setItems([
      ...items,
      { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectSupplier || !expectedDate) {
      ShowToast("error", t("missing_info_error"));
      return;
    }

    const dataToSend = {
      supplier_id: Number(selectSupplier),
      expected_delivery_date: expectedDate,
      total_cost: totalCost,
      status: selectStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        unit_cost_price: Number(item.cost),
      })),
    };

    try {
      const response = await purchaseOrderdApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase"] });
        ShowToast("success", response.message);
        navigate("/management/purchase");
      }
    } catch (error) {
      ShowToast("error", error.response?.data?.message || t("error_occurred"));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
        {t("create_heading")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI: THÔNG TIN CHUNG */}
        <div className="flex flex-col w-full lg:w-[30%] gap-3.5 relative z-30">
          <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-4 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-md space-y-3.5 transition-colors duration-200">
            {/* PHẦN 1: NHÀ CUNG CẤP */}
            <div>
              <TitleManagement color="blue">
                {t("supplier_title")}
              </TitleManagement>
              <div className="mt-1">
                <SelectPro
                  value={selectSupplier}
                  options={suppliersOptions}
                  onChange={setSelectSupplier}
                  label={t("select_supplier_label")}
                />
              </div>
            </div>

            {/* PHẦN 2: TRẠNG THÁI MẶC ĐỊNH */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-3">
              <TitleManagement color="green">
                {t("default_status_title")}
              </TitleManagement>
              <div className="mt-1">
                <SelectPro
                  value={selectStatus}
                  options={PURCHASE_STATUS_OPTIONS.map((s) => ({
                    id: s.slug,
                    name: tc(s.name),
                  }))}
                  onChange={setSelectStatus}
                  label={t("status_label")}
                />
              </div>
            </div>

            {/* PHẦN 3: THỜI GIAN & NGÂN SÁCH */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-3">
              <TitleManagement color="orange">
                {t("time_budget_title")}
              </TitleManagement>
              <div className="flex flex-col gap-2 mt-2">
                <FloatingInput
                  label={t("expected_date_label")}
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />

                <div className="flex justify-between items-center px-1 py-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    {t("estimated_total")}
                  </span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI: DANH SÁCH MÓN HÀNG */}
        <div className="flex-1 w-full bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md relative z-20 transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <TitleManagement color="violet">
              {t("items_list_title")}
            </TitleManagement>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20 py-2 px-4 rounded-lg font-bold hover:bg-sky-500/20 shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} /> {t("add_item")}
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2 pb-60 custom-scrollbar relative z-30">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-slate-50/80 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 relative"
                style={{ zIndex: items.length - index }}
              >
                {/* Chọn Biến thể sản phẩm */}
                <div className="w-full sm:w-2/4">
                  <SelectPro
                    value={item.variantId}
                    options={variantsOptions}
                    onChange={(val) =>
                      handleItemChange(item.id, "variantId", val)
                    }
                    label={t("product_label")}
                  />
                </div>

                {/* Nhập Số lượng */}
                <div className="w-full sm:w-1/4">
                  <FloatingInput
                    label={t("quantity_label")}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                </div>

                {/* Nhập Giá nhập gốc */}
                <div className="w-full sm:w-1/4">
                  <FloatingInput
                    label={t("import_price_label")}
                    type="number"
                    min={0}
                    value={item.cost}
                    onChange={(e) =>
                      handleItemChange(item.id, "cost", e.target.value)
                    }
                  />
                </div>

                {/* Nút gỡ dòng sản phẩm */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 self-end sm:self-auto text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title={t("delete_row_title")}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 italic text-sm border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10">
                {t("no_items")}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;
