import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SearchTable } from "@/components/ui/search";
import { BtnDelete, BtnEdit, BtnAdd } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import {
  LayoutDashboard,
  PackageCheck,
  PackageX,
  Filter,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import Badge from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import productdApi from "@/api/core/productApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý sản phẩm & kho",
    route: "",
  },
  {
    title: "Sản phẩm",
    route: "",
  },
];

const ProductPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentIsActive = searchParams.get("is_active") || "";
  const currentCategory = searchParams.get("category_id") || "";
  const currentBrand = searchParams.get("brand_id") || "";
  const currentSupplier = searchParams.get("supplier_id") || "";
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
    currentIsActive ||
    currentCategory ||
    currentBrand ||
    currentSupplier ||
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

  const products = responses?.data?.list_products || [];

  const openConfirm = (productId, name) => {
    setDeleteTarget({ id: productId, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await productdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["products"] });
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

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
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
        <BtnAdd route="/management/products/create" name="Thêm sản phẩm" />
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
            <div className="w-[230px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <div className="flex items-center gap-0.5 p-0.5 bg-[#111827]/60 border border-slate-800 rounded-lg h-10">
                {[
                  { value: "", label: "Tất cả" },
                  { value: "true", label: "Còn hàng" },
                  { value: "false", label: "Hết hàng" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter("is_active", tab.value)}
                    className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                      currentIsActive === tab.value
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Danh mục"
                value={currentCategory}
                onChange={(val) => setFilter("category_id", val)}
                options={[
                  { slug: "", name: "Tất cả" },
                  ...(responses.categories || []).map((c) => ({
                    slug: String(c.id),
                    name: c.name,
                  })),
                ]}
                placeholder="Tất cả"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Thương hiệu"
                value={currentBrand}
                onChange={(val) => setFilter("brand_id", val)}
                options={[
                  { slug: "", name: "Tất cả" },
                  ...(responses.brands || []).map((b) => ({
                    slug: String(b.id),
                    name: b.name,
                  })),
                ]}
                placeholder="Tất cả"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label="Nhà cung cấp"
                value={currentSupplier}
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

      <h2 className="text-lg font-bold text-slate-100">Danh sách sản phẩm</h2>
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
                Trạng thái
              </th>
              <th className="px-6 py-4 font-black text-center text-slate-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-[#161F32]/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-[#161F32] flex-shrink-0">
                        <img
                          src={
                            product.thumbnail ||
                            "https://placehold.co/60x60/png?text=No+Img"
                          }
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-100 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color="blue">{product.category.name}</Badge>
                          <span className="text-xs text-emerald-400 font-black">
                            {formatCurrency(product.base_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge color="purple">
                        Thương hiệu: {product.brand.name}
                      </Badge>
                      <Badge color="pink">
                        Nhà cung cấp: {product.supplier.name}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.is_active ? (
                      <Badge color="green">
                        <PackageCheck size={14} />{" "}
                        <span className="ml-1">Còn hàng</span>
                      </Badge>
                    ) : (
                      <Badge color="red">
                        <PackageX size={14} />
                        <span className="ml-1">Hết hàng</span>
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <BtnEdit
                        route={`/management/products/edit/${product.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(product.id, product.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-slate-500 italic"
                >
                  Không có sản phẩm nào
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
          title="Xóa sản phẩm"
          message={`Bạn đang thực hiện xóa sản phẩm "${deleteTarget.name}".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default ProductPage;
