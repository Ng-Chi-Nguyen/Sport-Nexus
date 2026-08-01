import { useState } from "react";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import FilterPanel from "@/components/ui/FilterPanel";
import RangeInput from "@/components/ui/RangeInput";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import {
  formatDate,
  formatCurrency,
  formatFullDateTime,
} from "@/utils/formatters";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/ui/confirm";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";
import useTableFilters from "@/hooks/useTableFilters";
import { PURCHASE_STATUS_OPTIONS } from "@/constants/management/purchaseOrder";
import { getPurchaseStatusDetails } from "@/utils/statusStyles";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuổi cung ứng", route: "" },
  { title: "Nhập hàng", route: "" },
];

const PurchaseOrderPage = () => {
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

  const {
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const currentStatus = searchParams.get("status") || "";
  const currentSupplierId = searchParams.get("supplier_id") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";
  const currentCostMin = searchParams.get("cost_min") || "";
  const currentCostMax = searchParams.get("cost_max") || "";

  const purchases = responses.data?.purchaseOrders || [];

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (purchaseId) => {
    setDeleteTarget({ id: purchaseId });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await purchaseOrderdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
        revalidator.revalidate();
        toast.success(response.message);
      }
      setIsConfirmOpen(false);
    } catch (error) {
      setIsConfirmOpen(false);
      toast.error(
        error.message ||
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          "Đã có lỗi xảy ra!",
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder="Tìm kiếm mã đơn nhập hàng..."
        addButton={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ExcelCrudActions
              basePath="/management/purchase-order"
              title="Import / Export nhập hàng"
              templateFileName="template-nhap-hang.xlsx"
              exportFileName="nhap-hang.xlsx"
              sheetNote="Workbook gồm 2 sheet: PurchaseOrders và PurchaseOrderItems"
            />
            <BtnAdd
              route={"/management/purchase/create"}
              name="Thêm đơn nhập hàng"
            />
          </div>
        }
      >
        <SimpleSelect
          label="Trạng thái"
          value={currentStatus}
          onChange={(val) => setFilter("status", val)}
          options={PURCHASE_STATUS_OPTIONS}
          placeholder="Tất cả"
        />
        <SimpleSelect
          label="Nhà cung cấp"
          value={currentSupplierId}
          onChange={(val) => setFilter("supplier_id", val)}
          options={[
            { slug: "", name: "Tất cả" },
            ...(responses.suppliers || []).map((s) => ({
              slug: String(s.id),
              name: s.name,
            })),
          ]}
          placeholder="Tất cả"
        />
        <RangeInput
          label="Ngày đặt hàng"
          type="date"
          minValue={currentDateFrom}
          maxValue={currentDateTo}
          onMinChange={(v) => setFilter("date_from", v)}
          onMaxChange={(v) => setFilter("date_to", v)}
        />
        <RangeInput
          label="Tổng tiền"
          type="number"
          minValue={currentCostMin}
          maxValue={currentCostMax}
          onMinChange={(v) => setFilter("cost_min", v)}
          onMaxChange={(v) => setFilter("cost_max", v)}
          placeholderMin="Tối thiểu"
          placeholderMax="Tối đa"
        />
      </FilterPanel>

      <div className="flex items-center justify-between my-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Danh sách nhập hàng
        </h2>
        <button
          onClick={handleRefresh}
          disabled={revalidator.state === "loading"}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tải lại"
        >
          <RefreshCw
            size={18}
            className={revalidator.state === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
        <div className="table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Mã nhập hàng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Ngày đặt hàng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Ngày nhận hàng dự kiến
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Giá (Vnđ)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Số lượng món hàng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {purchases.length > 0 ? (
                  purchases.map((purchase, index) => (
                    <tr
                      key={purchase.id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-center font-bold">
                        <p className="text-sky-600 dark:text-sky-400 text-sm">
                          #PO-{purchase.id}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center text-xs">
                        {formatFullDateTime(purchase.order_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center text-xs">
                        {formatDate(purchase.expected_delivery_date)}
                      </td>
                      <td className="px-6 py-4 font-black text-rose-600 dark:text-rose-400 text-center font-mono text-xs">
                        {formatCurrency(purchase.total_cost)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge color="blue">
                          {purchase.PurchaseOrderItems.length} món
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          color={
                            getPurchaseStatusDetails(purchase.status).color
                          }
                        >
                          {getPurchaseStatusDetails(purchase.status).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <BtnEdit
                            route={`/management/purchase/edit/${purchase.id}`}
                            name="Sửa"
                          />
                          <BtnDelete
                            name="Xóa"
                            onClick={() => openConfirm(purchase.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm"
                    >
                      Không có đơn nhập hàng nào được tìm thấy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa đơn hàng"
          message="Bạn đang thực hiện xóa đơn hàng."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
