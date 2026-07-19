import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import Badge from "@/components/ui/badge";
import { SimpleSelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
import attributeKeyApi from "@/api/core/attributrKeyApi";
import LoaderAttr from "@/loaders/attributeKey";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import Pagination from "@/components/ui/pagination";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Thuộc tính sản phẩm", route: "" },
];

const AttributeKey = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [units, setUnits] = useState([]);

  const currentSearch = searchParams.get("search") || "";
  const currentUnit = searchParams.get("unit") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    LoaderAttr.getDistinctUnits().then((res) => {
      if (res?.data) setUnits(res.data);
    });
  }, []);

  const attributes = responses?.data?.attribute || [];

  const openConfirm = (id, name) => {
    setDeleteTarget({ id, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await attributeKeyApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      setIsConfirmOpen(false);
      const errorMessage =
        error.message || error.response?.data?.message || "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const hasAllClear = currentUnit !== "";

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleUnitClick = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("unit", value);
    else params.delete("unit");
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1, currentPage: 1,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex items-center gap-4 rounded-xl">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm tên thuộc tính..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <div className="w-[160px]">
          <SimpleSelect
            placeholder="Tất cả đơn vị"
            value={currentUnit}
            onChange={(val) => handleUnitClick(val)}
            options={[
              { slug: "", name: "Tất cả" },
              ...units.map((u) => ({ slug: u || "null", name: u || "Không có" })),
            ]}
          />
        </div>

        {hasAllClear && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-2.5 py-1.5 text-[10px] font-bold rounded border border-slate-800 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
          >
            Xóa bộ lọc
          </button>
        )}

        <BtnAdd
          route={"/management/attribute-key/create"}
          className="w-[200px]"
          name="Thêm thuộc tính"
        />
      </div>

      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách thuộc tính
        </h2>
        <div className="table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tên thuộc tính
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Đơn vị
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Được sử dụng
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {attributes.length > 0 ? (
                attributes.map((attr) => (
                  <tr key={attr.id} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-200">
                    <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                      {attr.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color="blue">{attr.unit || "Không có"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                      20 sản phẩm
                    </td>
                    <td className="px-6 py-4 text-center">
                      <BtnActions
                        route={`/management/attribute-key/edit/${attr.id}`}
                        id={attr.id}
                        onDelete={() => openConfirm(attr.id, attr.name)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-500 italic text-sm">
                    Không có thuộc tính nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-2">
        <Pagination
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      <ConfirmDelete
        isOpen={isConfirmOpen}
        title="Xóa thuộc tính"
        message={`Bạn đang thực hiện xóa thuộc tính "${deleteTarget.name}".`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default AttributeKey;
