# ProductAttributeKeys Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ProductAttributeKeys join table (Products ↔ AttributeKeys) with full CRUD API and admin UI.

**Architecture:** New Prisma model + management controller/service/validator/route on backend; new admin pages (index/create/edit) on frontend following existing brand/category patterns.

**Tech Stack:** Express 5 + Prisma (MySQL) + React 19 + Vite + TanStack Query

---

### Task 1: Prisma Schema + Migration

**Files:**
- Modify: `server/prisma/schema.prisma` — add new model after `AttributeKeys`

- [ ] **Add `ProductAttributeKeys` model**

```prisma
// Added after AttributeKeys block (after line 185)
model ProductAttributeKeys {
    id               Int             @id @default(autoincrement())
    product_id       Int
    product          Products        @relation(fields: [product_id], references: [id], onDelete: Cascade)
    attribute_key_id Int
    attributeKey     AttributeKeys   @relation(fields: [attribute_key_id], references: [id], onDelete: Cascade)

    @@unique([product_id, attribute_key_id])
    @@map("productattributekeys")
}
```

Also add relation to `Products` model:
```prisma
// Inside Products model, after ProductVariants line
model Products {
    // ... existing fields ...
    ProductAttributeKeys ProductAttributeKeys[]
}
```

And to `AttributeKeys` model:
```prisma
model AttributeKeys {
    // ... existing fields ...
    ProductAttributeKeys ProductAttributeKeys[]
}
```

- [ ] **Run Prisma migration**

```bash
cd server
npx prisma migrate dev --name add_product_attributekeys
```

Expected: New table `productattributekeys` created in MySQL.

- [ ] **Generate Prisma client**

```bash
npx prisma generate
```

---

### Task 2: Backend Service (`productAttributeKey.service.js`)

**Files:**
- Create: `server/src/services/management/productAttributeKey.service.js`

- [ ] **Create service file**

```javascript
import prisma from "../../db/prisma.js";

const productAttributeKeyService = {
    create: async (data) => {
        const { product_id, attribute_key_id } = data;
        return prisma.ProductAttributeKeys.create({
            data: { product_id, attribute_key_id },
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    getAll: async ({ page = 1, product_id = '' } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page);
        const skip = (currentPage - 1) * limit;
        const where = {};
        if (product_id) where.product_id = parseInt(product_id);

        const [items, totalItems] = await Promise.all([
            prisma.ProductAttributeKeys.findMany({
                where,
                take: limit,
                skip,
                include: {
                    product: { select: { id: true, name: true } },
                    attributeKey: { select: { id: true, name: true, unit: true } },
                },
                orderBy: { id: 'desc' },
            }),
            prisma.ProductAttributeKeys.count({ where }),
        ]);

        return {
            data: items,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit,
            },
        };
    },

    getById: async (id) => {
        return prisma.ProductAttributeKeys.findUnique({
            where: { id },
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    getByProduct: async (productId) => {
        return prisma.ProductAttributeKeys.findMany({
            where: { product_id: parseInt(productId) },
            include: {
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    update: async (id, data) => {
        return prisma.ProductAttributeKeys.update({
            where: { id },
            data: {
                ...(data.product_id && { product_id: parseInt(data.product_id) }),
                ...(data.attribute_key_id && { attribute_key_id: parseInt(data.attribute_key_id) }),
            },
            include: {
                product: { select: { id: true, name: true } },
                attributeKey: { select: { id: true, name: true, unit: true } },
            },
        });
    },

    delete: async (id) => {
        return prisma.ProductAttributeKeys.delete({ where: { id } });
    },
};

export default productAttributeKeyService;
```

---

### Task 3: Backend Controller (`productAttributeKey.controller.js`)

**Files:**
- Create: `server/src/controllers/management/productAttributeKey.controller.js`

- [ ] **Create controller file**

```javascript
import productAttributeKeyService from "../../services/management/productAttributeKey.service.js";

const productAttributeKeyController = {
    create: async (req, res) => {
        try {
            const result = await productAttributeKeyService.create(req.body);
            return res.status(201).json({ success: true, data: result, message: "Thêm thuộc tính cho sản phẩm thành công" });
        } catch (error) {
            if (error.code === 'P2002')
                return res.status(409).json({ success: false, message: "Thuộc tính này đã được gán cho sản phẩm." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const product_id = req.query.product_id || '';
            const result = await productAttributeKeyService.getAll({ page, product_id });

            if (!result || result.data.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi nào." });
            }

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await productAttributeKeyService.getById(id);
            if (!result)
                return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi." });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getByProduct: async (req, res) => {
        try {
            const productId = parseInt(req.params.productId);
            const result = await productAttributeKeyService.getByProduct(productId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await productAttributeKeyService.update(id, req.body);
            return res.status(200).json({ success: true, data: result, message: "Cập nhật thành công" });
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy bản ghi." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await productAttributeKeyService.delete(id);
            return res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy bản ghi." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};

export default productAttributeKeyController;
```

---

### Task 4: Backend Validator + Route

**Files:**
- Create: `server/src/validators/management/productAttributeKey.validator.js`
- Create: `server/src/routes/management/productAttributeKey.route.js`

- [ ] **Create validator**

```javascript
import Joi from "joi";

const productAttributeKeySchema = {
    create: Joi.object({
        product_id: Joi.number().integer().required().messages({
            'any.required': 'Sản phẩm không được để trống',
            'number.base': 'Sản phẩm phải là số',
        }),
        attribute_key_id: Joi.number().integer().required().messages({
            'any.required': 'Thuộc tính không được để trống',
            'number.base': 'Thuộc tính phải là số',
        }),
    }),
    update: Joi.object({
        product_id: Joi.number().integer(),
        attribute_key_id: Joi.number().integer(),
    }).min(1).unknown(false),
};

export default productAttributeKeySchema;
```

- [ ] **Create route**

```javascript
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import productAttributeKeySchema from "../../validators/management/productAttributeKey.validator.js";
import productAttributeKeyController from "../../controllers/management/productAttributeKey.controller.js";

const productAttributeKeyRoute = express.Router();

productAttributeKeyRoute
    .post("/", validate(productAttributeKeySchema.create), productAttributeKeyController.create)
    .get("/by-product/:productId", productAttributeKeyController.getByProduct)
    .get("/:id", productAttributeKeyController.getById)
    .get("/", productAttributeKeyController.getAll)
    .put("/:id", validate(productAttributeKeySchema.update), productAttributeKeyController.update)
    .delete("/:id", productAttributeKeyController.delete);

export default productAttributeKeyRoute;
```

---

### Task 5: Register Route in Main Index

**Files:**
- Modify: `server/src/routes/index.route.js`

- [ ] **Add import and use**

```javascript
// Add import after logRoute (line 21)
import productAttributeKeyRoute from "./management/productAttributeKey.route.js";

// Add use after log (after line 37)
app.use(`${api_prefix_v1}management/product-attribute-key/`, productAttributeKeyRoute)
```

---

### Task 6: Frontend API Layer

**Files:**
- Create: `client/src/api/management/productAttributeKeyApi.jsx`

- [ ] **Create API file**

```javascript
import axiosClient from "@/lib/axiosClient";

const productAttributeKeyApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.product_id) query.set('product_id', params.product_id);
        return axiosClient.get(`/management/product-attribute-key?${query.toString()}`);
    },

    getById: (id) => {
        return axiosClient.get(`/management/product-attribute-key/${id}`);
    },

    getByProduct: (productId) => {
        return axiosClient.get(`/management/product-attribute-key/by-product/${productId}`);
    },

    create: (data) => {
        return axiosClient.post('/management/product-attribute-key', data);
    },

    update: (id, data) => {
        return axiosClient.put(`/management/product-attribute-key/${id}`, data);
    },

    delete: (id) => {
        return axiosClient.delete(`/management/product-attribute-key/${id}`);
    },
};

export default productAttributeKeyApi;
```

---

### Task 7: Frontend Loader

**Files:**
- Create: `client/src/loaders/management/productAttributeKeyLoader.jsx`

- [ ] **Create loader**

```javascript
import axiosClient from "@/lib/axiosClient";

const LoaderProductAttributeKey = {
    getAll: async ({ page = 1, product_id = '' } = {}) => {
        const params = new URLSearchParams();
        params.set('page', page);
        if (product_id) params.set('product_id', product_id);
        try {
            const response = await axiosClient.get(`management/product-attribute-key?${params.toString()}`);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return { success: true, data: { data: [], pagination: { totalPages: 1, currentPage: 1 } } };
            }
            throw error;
        }
    },

    getById: (id) => {
        return axiosClient.get(`management/product-attribute-key/${id}`);
    },

    getByProduct: (productId) => {
        return axiosClient.get(`management/product-attribute-key/by-product/${productId}`);
    },
};

export default LoaderProductAttributeKey;
```

---

### Task 8: Admin Index Page

**Files:**
- Create: `client/src/pages/Admin/productAttributeKey/index.jsx`
- Create: `client/src/pages/Admin/productAttributeKey/create.jsx`
- Create: `client/src/pages/Admin/productAttributeKey/edit.jsx`

- [ ] **Create index page** — table with product name, attribute key name, unit, actions

```jsx
import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import { useRevalidator, useSearchParams } from "react-router-dom";
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
    { title: "Thuộc tính sản phẩm", route: "" },
];

const ProductAttributeKey = () => {
    const revalidator = useRevalidator();
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
    const [products, setProducts] = useState([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

    const currentPage = parseInt(searchParams.get("page")) || 1;
    const currentProductId = searchParams.get("product_id") || "";

    useEffect(() => {
        LoaderProductAttributeKey.getAll({ page: currentPage, product_id: currentProductId }).then((res) => {
            if (res?.success) {
                setData(res.data.data);
                setPagination(res.data.pagination);
            }
        });
        LoaderProduct.getProductsDropdown().then((res) => {
            if (res?.data) setProducts(res.data);
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
                revalidator.revalidate();
                toast.success(response.message);
                setIsConfirmOpen(false);
                const res = await LoaderProductAttributeKey.getAll({ page: currentPage, product_id: currentProductId });
                if (res?.success) {
                    setData(res.data.data);
                    setPagination(res.data.pagination);
                }
            }
        } catch (error) {
            setIsConfirmOpen(false);
            toast.error(error.message || "Đã có lỗi xảy ra!");
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
```

- [ ] **Create create page** — select product + select attribute key + submit

```jsx
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productAttributeKeyApi from "@/api/management/productAttributeKeyApi";
import LoaderProduct from "@/loaders/core/productLoader";
import LoaderAttr from "@/loaders/core/attributeKey";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import Badge from "@/components/ui/badge";

const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: "Quản lý sản phẩm & kho", route: "" },
    { title: "Thuộc tính sản phẩm", route: "/management/product-attribute-key/" },
    { title: "Thêm mới", route: "" },
];

const CreateProductAttributeKey = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [attributeKeys, setAttributeKeys] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedAttributeKey, setSelectedAttributeKey] = useState("");

    useEffect(() => {
        LoaderProduct.getProductsDropdown().then((res) => {
            if (res?.data) setProducts(res.data);
        });
        LoaderAttr.getAllAttributesDropdown().then((res) => {
            if (res?.data) setAttributeKeys(res.data);
        });
    }, []);

    const productOptions = useMemo(() =>
        products.map((p) => ({ id: p.id, name: p.name })),
    [products]);

    const attrKeyOptions = useMemo(() =>
        attributeKeys.map((a) => ({ id: a.id, name: `${a.name}${a.unit ? ` (${a.unit})` : ""}` })),
    [attributeKeys]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await productAttributeKeyApi.create({
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

    return (
        <div className="">
            <Breadcrumbs data={breadcrumbData} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-fit border border-gray-200 p-3 rounded-[5px]">
                <TitleManagement color="blue">Thông tin gán thuộc tính</TitleManagement>
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

export default CreateProductAttributeKey;
```

- [ ] **Create edit page**

```jsx
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
    { title: "Thuộc tính sản phẩm", route: "/management/product-attribute-key/" },
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
```

---

### Task 9: Register Routes + Menu Frontend

**Files:**
- Modify: `client/src/routes/adminRoutes.jsx`
- Modify: `client/src/constants/menu.jsx`

- [ ] **Add lazy imports in `adminRoutes.jsx`**

```javascript
// After AttributeKey imports (after line 105)
const ProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/index.jsx"));
const CreateProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/create.jsx"));
const EditProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/edit.jsx"));
```

- [ ] **Add route entries**

```javascript
// After attribute-key routes (after line 183)
{
    path: "product-attribute-key",
    element: <ProductAttributeKey />,
},
{ path: "product-attribute-key/create", element: <CreateProductAttributeKey /> },
{
    path: "product-attribute-key/edit/:id",
    element: <EditProductAttributeKey />,
},
```

- [ ] **Add to sidebar menu in `menu.jsx`**

```javascript
// After attribute-key line (line 49)
{
    path: `${prefix}/product-attribute-key`,
    label: "Gán thuộc tính SP",
    iconName: "Tags",
},
```

---

### Task 10: Verify Build

**Files:**
- Root level

- [ ] **Run frontend build**

```bash
npm run build --prefix client
```

- [ ] **Run frontend lint**

```bash
npm run lint --prefix client
```

- [ ] **Check backend syntax**

```bash
node --check server/src/index.js
```
