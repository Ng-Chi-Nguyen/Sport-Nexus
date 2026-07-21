import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Badge from "@/components/ui/badge";
import { SelectPro } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
import productAttributeKeyApi from "@/api/management/productAttributeKeyApi";
import LoaderProductAttributeKey from "@/loaders/management/productAttributeKeyLoader";
import LoaderProduct from "@/loaders/core/productLoader";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import Pagination from "@/components/ui/pagination";

const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: "Quản lý sản phẩm & kho", route: "" },
    { title: "Gán thuộc tính sản phẩm", route: "" },
];

const ProductAttributeKey = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
    const [products, setProducts] = useState([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

    const currentPage = parseInt(searchParams.get("page")) || 1;
    const currentProductId = searchParams.get("product_id") || "";

    useEffect(() => {
        Promise.all([
            LoaderProductAttributeKey.getAll({ page: currentPage, product_id: currentProductId }).catch(() => ({ success: true, data: { data: [], pagination: { totalPages: 1, currentPage: 1 } } })),
            LoaderProduct.getProductsDropdown().catch(() => ({ success: true, data: [] })),
        ]).then(([res, prodRes]) => {
            if (res?.success) {
                setData(res.data.data);
                setPagination(res.data.pagination);
            }
            if (prodRes?.data) setProducts(prodRes.data);
        });
    }, [currentPage, currentProductId]);

    const openConfirm = (id, name) => {
        setDeleteTarget({ id, name });
        setIsConfirmOpen(true);
    };

    const handleDelete = async () => {
        try {
            const response = await productAttributeKeyApi.delete(deleteTarget.id);
            if (response.success) {
                await queryClient.invalidateQueries({ queryKey: ["product-attribute-keys"] });
                toast.success(response.message);
                setIsConfirmOpen(false);
                fetchData();
            }
        } catch (error) {
            setIsConfirmOpen(false);
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra!");
        }
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage);
        setSearchParams(params);
    };

    const handleProductFilter = (value) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        if (value) params.set("product_id", value);
        else params.delete("product_id");
        setSearchParams(params);
    };

    const productOptions = [
        { id: "", name: "Tất cả sản phẩm" },
        ...products.map((p) => ({ id: p.id, name: p.name })),
    ];

    return (
        <div className="space-y-6">
            <Breadcrumbs data={breadcrumbData} />
            <div className="flex items-center gap-4 rounded-xl">
                <div className="w-[300px]">
                    <SelectPro
                        value={currentProductId}
                        options={productOptions}
                        onChange={handleProductFilter}
                        label="Lọc theo sản phẩm"
                    />
                </div>
                <BtnAdd
                    route={"/management/product-attribute-key/create"}
                    className="w-[200px]"
                    name="Gán thuộc tính"
                />
            </div>
            <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                <h2 className="section-title">Danh sách thuộc tính sản phẩm</h2>
                <div className="table-retro">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Thuộc tính</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn vị</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map((item) => (
                                <tr key={item.id} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">{item.product?.name}</td>
                                    <td className="px-6 py-4 text-center">{item.attributeKey?.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge color="blue">{item.attributeKey?.unit || "—"}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <BtnActions
                                            route={`/management/product-attribute-key/edit/${item.id}`}
                                            id={item.id}
                                            onDelete={() => openConfirm(item.id, item.attributeKey?.name)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-500 italic text-sm">
                                        Không có bản ghi nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination
                totalPages={pagination.totalPages}
                currentPage={pagination.currentPage}
                onPageChange={handlePageChange}
            />
            <ConfirmDelete
                isOpen={isConfirmOpen}
                title="Xóa bản ghi"
                message={`Bạn đang xóa bản ghi thuộc tính "${deleteTarget.name}".`}
                onConfirm={handleDelete}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </div>
    );
};

export default ProductAttributeKey;
