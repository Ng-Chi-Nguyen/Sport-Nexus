import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productAttributeKeyApi from "@/api/management/productAttributeKeyApi";
import LoaderProduct from "@/loaders/core/productLoader";
import LoaderAttr from "@/loaders/core/attributeKey";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";

const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: "Quản lý sản phẩm & kho", route: "" },
    { title: "Gán thuộc tính sản phẩm", route: "/management/product-attribute-key/" },
    { title: "Chỉnh sửa", route: "" },
];

const EditProductAttributeKey = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [attributeKeys, setAttributeKeys] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedAttributeKey, setSelectedAttributeKey] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            LoaderProduct.getProductsDropdown(),
            LoaderAttr.getAllAttributesDropdown(),
            productAttributeKeyApi.getById(id),
        ]).then(([prodRes, attrRes, itemRes]) => {
            if (prodRes?.data) setProducts(prodRes.data);
            if (attrRes?.data) setAttributeKeys(attrRes.data);
            if (itemRes?.success) {
                setSelectedProduct(itemRes.data.product_id);
                setSelectedAttributeKey(itemRes.data.attribute_key_id);
            }
            setLoading(false);
        });
    }, [id]);

    const productOptions = useMemo(() =>
        products.map((p) => ({ id: p.id, name: p.name })),
    [products]);

    const attrKeyOptions = useMemo(() =>
        attributeKeys.map((a) => ({ id: a.id, name: `${a.name}${a.unit ? ` (${a.unit})` : ""}` })),
    [attributeKeys]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await productAttributeKeyApi.update(id, {
                product_id: Number(selectedProduct),
                attribute_key_id: Number(selectedAttributeKey),
            });
            if (response.success) {
                await queryClient.invalidateQueries({ queryKey: ["product-attribute-keys"] });
                toast.success(response.message);
                navigate(-1);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Đã có lỗi xảy ra!");
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="">
            <Breadcrumbs data={breadcrumbData} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-fit border border-gray-200 p-3 rounded-[5px]">
                <TitleManagement color="blue">Chỉnh sửa gán thuộc tính</TitleManagement>
                <div className="flex gap-2">
                    <div className="w-[300px]">
                        <SelectPro
                            value={selectedProduct}
                            options={productOptions}
                            onChange={setSelectedProduct}
                            label="Chọn sản phẩm"
                        />
                    </div>
                    <div className="w-[300px]">
                        <SelectPro
                            value={selectedAttributeKey}
                            options={attrKeyOptions}
                            onChange={setSelectedAttributeKey}
                            label="Chọn thuộc tính"
                        />
                    </div>
                </div>
                <div className="ml-auto mr-auto">
                    <Submit_GoBack />
                </div>
            </form>
        </div>
    );
};

export default EditProductAttributeKey;
