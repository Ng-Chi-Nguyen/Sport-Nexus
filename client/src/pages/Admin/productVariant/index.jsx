import { useState, useEffect, useMemo, useRef } from "react";
import { LayoutDashboard, Filter, ChevronDown, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import productVariantdApi from "@/api/core/productVariantApi";

// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { ConfirmDelete } from "@/components/ui/confirm";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Món hàng", route: "#" },
];

const VariantPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentProductId = searchParams.get("product_id") || "";
  const currentStockMin = searchParams.get("stock_min") || "";
  const currentStockMax = searchParams.get("stock_max") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
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

  const variants = responses?.data?.variants || [];

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["product-variants"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const openConfirm = (productId, name) => {
    setDeleteTarget({ id: productId, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await productVariantdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      setIsConfirmOpen(false);
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

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1">
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
        <BtnAdd
          route="/management/product-variants/create"
          name="Thêm biến thể"
        />
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
                  ...(responses.products || []).map((p) => ({
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

            <div className="h-10 flex items-center shrink-0 ml-auto">
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Danh sách biến thể</h2>
        <button
          onClick={handleRefresh}
          disabled={revalidator.state === "loading"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tải lại"
        >
          <RefreshCw size={18} className={revalidator.state === "loading" ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="mt-3 relative bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="text-xs uppercase bg-[#161F32] border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-black text-slate-400 !text-start">
                Thông tin sản phẩm
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Phân loại
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Tồn kho
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {variants.length > 0 ? (
              variants.map((variant) => (
                <tr
                  key={variant.id}
                  className="hover:bg-[#161F32]/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[60px] h-[60px] border border-slate-800 rounded-lg overflow-hidden bg-[#111827] flex-shrink-0 p-1">
                        <img
                          src={variant.product.thumbnail}
                          alt={variant.product.name}
                          className="w-full h-full object-contain mix-blend-screen"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-100 mb-1 tracking-wide">
                          {variant.product.name}
                        </p>
                        <span className="text-[12px] text-slate-500">
                          Giá gốc:{" "}
                          <span className="font-semibold text-emerald-400">
                            {Number(
                              variant.product.base_price,
                            ).toLocaleString()}
                            đ
                          </span>
                        </span>
                        <div className="mt-1">
                          <span className="text-xs text-slate-500">
                            Giá bán:{" "}
                          </span>
                          <span className="text-sm font-semibold text-sky-400">
                            {Number(variant.price).toLocaleString()}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* SỬ DỤNG COMPONENT BADGE MÀU INFO CHO THUỘC TÍNH */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-center justify-center">
                      {variant.VariableAttributes?.length > 0 ? (
                        variant.VariableAttributes.map((attr) => (
                          <Badge key={attr.id} color="info">
                            {attr.attributeKey.name}: {attr.value}{" "}
                            {attr.attributeKey.unit || ""}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs italic">
                          Không có phân loại
                        </span>
                      )}
                    </div>
                  </td>

                  {/* SỬ DỤNG COMPONENT BADGE MÀU SUCCESS / ERROR CHO TỒN KHO */}
                  <td className="px-6 py-4 text-center">
                    {variant.stock > 0 ? (
                      <Badge color="success">Sẵn có: {variant.stock}</Badge>
                    ) : (
                      <Badge color="error">Hết hàng</Badge>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <BtnActions
                      route={`/management/product-variants/edit/${variant.id}`}
                      id={variant.id}
                      onDelete={() =>
                        openConfirm(variant.id, variant.product.name)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-500 italic"
                >
                  Không có biến thể nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-800">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa biến thể sản phẩm"
          message={`Bạn đang thực hiện xóa biến thể sản phẩm "${deleteTarget.name}".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default VariantPage;
