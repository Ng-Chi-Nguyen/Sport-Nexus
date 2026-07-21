# Product Description Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multiple product description images to admin product create/edit forms.

**Architecture:** Frontend-only feature leveraging existing backend ProductImages API (`/api/v1/core/product-image/`). A reusable `MultiFileUpload` component handles multi-file selection/preview. Create flow: create product → upload images. Edit flow: load existing images → allow add/delete → bulk update.

**Tech Stack:** React 19, Vite, Tailwind CSS, TanStack Query, axios, Lucide icons

---

### Task 1: Frontend API for Product Images

**Files:**
- Create: `client/src/api/core/productImageApi.jsx`

- [ ] **Create `productImageApi.jsx`**

```jsx
import axiosClient from "@/lib/axiosClient";

const productImageApi = {
  getByProduct: (productId) => {
    const url = `/core/product-image/product/${productId}`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = "/core/product-image";
    return axiosClient.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (productId, data) => {
    const url = `/core/product-image/${productId}`;
    return axiosClient.put(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (imageId) => {
    const url = `/core/product-image/${imageId}`;
    return axiosClient.delete(url);
  },
};

export default productImageApi;
```

### Task 2: MultiFileUpload Component

**Files:**
- Create: `client/src/components/ui/MultiFileUpload.jsx`

- [ ] **Create `MultiFileUpload.jsx`**

A reusable component that:
- Accepts `files` (array of File objects for new uploads or string URLs for existing images)
- `onChange` callback with the updated array
- `maxFiles` prop (default 10)
- Shows a grid preview with remove button per item
- Has a label/upload button to select multiple files
- Follows the dark glassmorphism style of the project

Key states:
- Empty: show upload prompt with `ImagePlus` icon
- Has files: show grid of previews with X button
- Loading: show spinner (optional, not needed for this task)

```jsx
import React, { useEffect, useState, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";

const MultiFileUpload = ({ label, value = [], onChange, maxFiles = 10 }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = value.map((item) => {
      if (item instanceof File) return URL.createObjectURL(item);
      if (typeof item === "string") return item;
      if (item?.url) return item.url;
      return null;
    });
    setPreviews(urls.filter(Boolean));
    return () => urls.forEach((u) => { if (u?.startsWith?.("blob:")) URL.revokeObjectURL(u); });
  }, [value]);

  const handleFileSelect = useCallback(
    (e) => {
      const newFiles = Array.from(e.target.files || []);
      const remaining = maxFiles - value.filter((v) => v instanceof File || typeof v === "string").length;
      if (newFiles.length > remaining) {
        newFiles.splice(remaining);
      }
      onChange([...value, ...newFiles]);
      e.target.value = "";
    },
    [value, onChange, maxFiles]
  );

  const handleRemove = useCallback(
    (index) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const canAdd = value.length < maxFiles;

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 flex items-center gap-2 border-b border-white/5">
          <span className="w-1.5 h-3.5 rounded-sm bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
          {label}
        </h3>
      )}

      <div className="grid grid-cols-4 gap-3">
        {previews.map((src, idx) => (
          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-800 bg-[#0D121F]">
            <img
              src={src}
              alt={`Ảnh ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {canAdd && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-[#0D121F]/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-[#161F32]/40">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <ImagePlus size={24} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Thêm ảnh</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default MultiFileUpload;
```

### Task 3: Add Images Section to Create Product Page

**Files:**
- Modify: `client/src/pages/Admin/products/create.jsx`

- [ ] **Modify `create.jsx`**

Add import for `productImageApi` and `MultiFileUpload`:
```jsx
import MultiFileUpload from "@/components/ui/MultiFileUpload";
import productImageApi from "@/api/core/productImageApi";
```

Add state for product images:
```jsx
const [productImages, setProductImages] = useState([]);
```

Replace the existing thumbnail section to include both thumbnail and description images:
```jsx
<div className="w-1/2 flex flex-col gap-3">
  {/* existing category/brand/supplier section */}
  <div className="border border-gray-200 p-3 rounded-[5px]">
    <TitleManagement color="cyan">Ảnh đại diện</TitleManagement>
    <InputFile
      value={thumbnail}
      onChange={(file) => setThumbnail(file)}
    />
  </div>
  <div className="border border-gray-200 p-3 rounded-[5px]">
    <MultiFileUpload
      label="Ảnh mô tả sản phẩm"
      value={productImages}
      onChange={setProductImages}
      maxFiles={10}
    />
  </div>
</div>
```

Update the submit handler to upload images after product creation:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  if (thumbnail instanceof File) {
    formData.append("thumbnail", thumbnail);
  }
  formData.append("name", name);
  formData.append("base_price", basePrice);
  formData.append("is_active", isActive);
  formData.append("brand_id", selectBrand);
  formData.append("supplier_id", selectSupplier);
  formData.append("category_id", selectCategory);
  formData.append("description", description);

  try {
    const response = await productdApi.create(formData);
    if (response.success) {
      const newProductId = response.data.id;

      if (productImages.length > 0) {
        const imageFormData = new FormData();
        productImages.forEach((file) => {
          imageFormData.append("url", file);
        });
        imageFormData.append("product_id", newProductId);
        await productImageApi.create(imageFormData);
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(response.message);
      navigate(-1);
    }
  } catch (error) {
    const errorMessage =
      error.message ||
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      "Đã có lỗi xảy ra!";
    toast.error(errorMessage);
  }
};
```

### Task 4: Add Images Section to Edit Product Page

**Files:**
- Modify: `client/src/pages/Admin/products/edit.jsx`

- [ ] **Modify `edit.jsx`**

Add imports:
```jsx
import MultiFileUpload from "@/components/ui/MultiFileUpload";
import productImageApi from "@/api/core/productImageApi";
```

Add state:
```jsx
const [productImages, setProductImages] = useState([]);
const [existingImageIds, setExistingImageIds] = useState([]);
```

Load existing images on mount:
```jsx
useEffect(() => {
  const loadImages = async () => {
    try {
      const res = await productImageApi.getByProduct(product.data.id);
      if (res.success) {
        setProductImages(res.data || []);
        setExistingImageIds((res.data || []).map(img => ({ id: img.id, is_primary: img.is_primary })));
      }
    } catch {
      // Không có ảnh hoặc lỗi
    }
  };
  loadImages();
}, [product.data.id]);
```

Add section to the left column (after thumbnail section):
```jsx
<div className="border border-gray-200 p-3 rounded-[5px]">
  <MultiFileUpload
    label="Ảnh mô tả sản phẩm"
    value={productImages}
    onChange={setProductImages}
    maxFiles={10}
  />
</div>
```

Update submit handler:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  if (thumbnail instanceof File) {
    formData.append("thumbnail", thumbnail);
  }
  formData.append("name", name);
  formData.append("base_price", basePrice);
  formData.append("is_active", isActive);
  formData.append("brand_id", selectBrand);
  formData.append("supplier_id", selectSupplier);
  formData.append("category_id", selectCategory);
  formData.append("description", description);

  try {
    const response = await productdApi.update(product.data.id, formData);
    if (response.success) {
      // Handle images
      const newFiles = productImages.filter((img) => img instanceof File);
      const currentImageIds = productImages
        .filter((img) => !(img instanceof File))
        .map((img) => ({ id: img.id, is_primary: img.is_primary || false }));

      if (newFiles.length > 0 || currentImageIds.length !== existingImageIds.length) {
        const imageFormData = new FormData();
        newFiles.forEach((file) => imageFormData.append("url", file));
        imageFormData.append("current_image_ids", JSON.stringify(currentImageIds));
        await productImageApi.update(product.data.id, imageFormData);
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
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
```

### Task 5: Verify Build

- [ ] **Run frontend build and lint**

```bash
npm run build --prefix client
npm run lint --prefix client
```
