# Categories Import/Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add import (xlsx) and export (xlsx) functionality for Categories admin page.

**Architecture:** Server uses ExcelJS to generate/parse xlsx files. Multer handles file upload with MIME type check. Import uses Partial Success strategy (batch insert, valid rows saved, invalid rows reported). Error files are stored in-memory with 30min TTL. Client uses a modal for the import flow and direct download for export.

**Tech Stack:** ExcelJS (server), Multer (server), React + TanStack Query (client)

---

### Task 1: Install exceljs + add multer xlsx upload middleware

**Files:**

- Modify: `server/package.json`
- Modify: `server/src/middlewares/fileUpload.middleware.js`

- [ ] **Install exceljs**

```bash
cd server && npm install exceljs
```

- [ ] **Add uploadExcelFile middleware**

In `server/src/middlewares/fileUpload.middleware.js`, add a new multer instance for xlsx files:

```javascript
const uploadExcel = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const allowedExt = ".xlsx";
    const ext = "." + file.originalname.split(".").pop().toLowerCase();

    if (allowedMimes.includes(file.mimetype) && ext === allowedExt) {
      cb(null, true);
    } else {
      cb(new Error("File phải là định dạng .xlsx hợp lệ."), false);
    }
  },
});

const uploadExcelFile = uploadExcel.single("file");
```

Then add it to the export block:

```javascript
export {
  uploadImageAvatar,
  uploadImageLogoSupplier,
  uploadImageLogoBrand,
  uploadImageCategory,
  uploadThubnailProduct,
  uploadProductImage,
  uploadMediaImage,
  uploadExcelFile,
};
```

---

### Task 2: Create categoryImport service

**Files:**

- Create: `server/src/services/management/categoryImport.service.js`

This service handles all import/export business logic: template generation, file parsing, batch import, export generation, and error file creation.

- [ ] **Create the service file**

```javascript
import ExcelJS from "exceljs";
import prisma from "../../db/prisma.js";
import slugify from "slugify";
import { ACTIVE } from "../../utils/prisma.js";
import crypto from "crypto";

// In-memory temp storage for error files (TTL: 30 min)
const errorFileStore = new Map();

const cleanupErrorFiles = () => {
  const now = Date.now();
  for (const [token, entry] of errorFileStore) {
    if (now - entry.createdAt > 30 * 60 * 1000) {
      errorFileStore.delete(token);
    }
  }
};
setInterval(cleanupErrorFiles, 5 * 60 * 1000);

const categoryImportService = {
  generateTemplate: async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SportNexus";

    // ── Sheet 1: Categories ──
    const ws = workbook.addWorksheet("Categories", {
      properties: { tabColor: { argb: "FF667EEA" } },
    });

    ws.columns = [
      { header: "Tên danh mục", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 30 },
      { header: "Hình ảnh", key: "image", width: 40 },
      { header: "Trạng thái", key: "is_active", width: 15 },
      { header: "Mô tả", key: "description", width: 40 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 30;

    ws.getColumn(1).alignment = { vertical: "middle" };
    ws.getColumn(2).alignment = { vertical: "middle" };
    ws.getColumn(3).alignment = { vertical: "middle" };
    ws.getColumn(4).alignment = { vertical: "middle" };
    ws.getColumn(5).alignment = { vertical: "middle" };

    ws.getColumn(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 12,
    };
    ws.getColumn(2).font = {
      bold: false,
      color: { argb: "FF333333" },
      size: 11,
    };
    ws.getColumn(3).font = {
      bold: false,
      color: { argb: "FF333333" },
      size: 11,
    };
    ws.getColumn(4).font = {
      bold: false,
      color: { argb: "FF333333" },
      size: 11,
    };
    ws.getColumn(5).font = {
      bold: false,
      color: { argb: "FF333333" },
      size: 11,
    };

    // Style header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF667EEA" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.border = {
        top: { style: "thin", color: { argb: "FF5A6FD6" } },
        left: { style: "thin", color: { argb: "FF5A6FD6" } },
        bottom: { style: "thin", color: { argb: "FF5A6FD6" } },
        right: { style: "thin", color: { argb: "FF5A6FD6" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Required column marker (Tên danh mục)
    ws.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF667EEA" },
    };

    // Data validation dropdown for Trạng thái
    ws.dataValidations.add("D2:D1001", {
      type: "list",
      formulae: ['"Hoạt động,Ngừng"'],
      showErrorMessage: true,
      errorTitle: "Giá trị không hợp lệ",
      error: 'Chọn "Hoạt động" hoặc "Ngừng"',
    });

    // Sample row
    ws.addRow({
      name: "Giày thể thao",
      slug: "giay-the-thao",
      image: "https://images.supabase.co/.../example.jpg",
      is_active: "Hoạt động",
      description: "Danh mục giày thể thao các loại",
    });
    const sampleRow = ws.getRow(2);
    sampleRow.eachCell((cell) => {
      cell.font = { italic: true, color: { argb: "FF999999" } };
    });

    // ── Sheet 2: Hướng dẫn ──
    const ws2 = workbook.addWorksheet("Hướng dẫn");
    ws2.getCell("A1").value = "HƯỚNG DẪN NHẬP DANH MỤC";
    ws2.getCell("A1").font = {
      bold: true,
      size: 16,
      color: { argb: "FF667EEA" },
    };
    ws2.mergeCells("A1:E1");

    const instructions = [
      "",
      '1. Cột "Tên danh mục" (màu tím) là bắt buộc, không được để trống.',
      '2. Cột "Slug": nếu để trống sẽ tự động sinh từ tên danh mục.',
      '3. Cột "Trạng thái": chọn từ dropdown (Hoạt động / Ngừng).',
      '4. Cột "Hình ảnh": nhập URL ảnh từ Supabase (nếu có).',
      "5. Xóa dòng mẫu (dòng số 2) trước khi import.",
      "6. File chỉ hỗ trợ tối đa 1,000 dòng.",
    ];
    instructions.forEach((text, i) => {
      ws2.getCell(`A${i + 3}`).value = text;
      ws2.getCell(`A${i + 3}`).font = { size: 12 };
    });

    ws2.getColumn("A").width = 80;

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },

  parseFile: async (fileBuffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const ws = workbook.getWorksheet("Categories");

    if (!ws) {
      throw new Error('File Excel không có sheet "Categories".');
    }

    const rows = [];
    const nameSet = new Set();
    const slugSet = new Set();

    // Lấy tất cả slug hiện có từ DB để check unique
    const existingCategories = await prisma.categories.findMany({
      where: { deleted_at: ACTIVE },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingCategories.map((c) => c.slug));

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const name = (row.getCell(1).value || "").toString().trim();
      const slug = (row.getCell(2).value || "").toString().trim();
      const image = (row.getCell(3).value || "").toString().trim();
      const isActiveRaw = (row.getCell(4).value || "").toString().trim();
      const description = (row.getCell(5).value || "").toString().trim();

      const errors = [];

      // Required: name
      if (!name) {
        errors.push({
          field: "name",
          message: "Tên danh mục không được để trống",
        });
      } else if (name.length > 191) {
        errors.push({
          field: "name",
          message: "Tên danh mục không được quá 191 ký tự",
        });
      }

      // Deduplicate within file
      if (name && nameSet.has(name)) {
        errors.push({
          field: "name",
          message: `Tên danh mục "${name}" bị trùng trong file`,
        });
      }
      if (name) nameSet.add(name);

      if (slug && slugSet.has(slug)) {
        errors.push({
          field: "slug",
          message: `Slug "${slug}" bị trùng trong file`,
        });
      }
      if (slug) slugSet.add(slug);

      // Slug uniqueness check with DB
      if (slug && existingSlugs.has(slug)) {
        errors.push({
          field: "slug",
          message: `Slug "${slug}" đã tồn tại trong hệ thống`,
        });
      }

      // is_active
      let isActive = true;
      if (isActiveRaw) {
        if (isActiveRaw === "Hoạt động") {
          isActive = true;
        } else if (isActiveRaw === "Ngừng") {
          isActive = false;
        } else {
          errors.push({
            field: "is_active",
            message: 'Trạng thái phải là "Hoạt động" hoặc "Ngừng"',
          });
        }
      }

      rows.push({
        row: rowNumber,
        name,
        slug,
        image,
        is_active: isActive,
        description,
        errors,
      });
    });

    return rows;
  },

  importCategories: async (parsedRows) => {
    const validRows = parsedRows.filter((r) => r.errors.length === 0);
    const errorRows = parsedRows.filter((r) => r.errors.length > 0);
    const imported = [];
    const batchSize = 100;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const data = batch.map((row) => {
        let slug = row.slug;
        if (!slug) {
          slug = slugify(row.name, {
            replacement: "-",
            remove: /[*+~.()'"!:@]/g,
            lower: true,
            strict: true,
            locale: "vi",
          });

          // Check duplicate slug and append counter if needed
          let baseSlug = slug;
          let counter = 1;
          const allSlugs = new Set(data.map((d) => d.slug).filter(Boolean));
          while (allSlugs.has(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
        }

        return {
          name: row.name,
          slug,
          image: row.image || null,
          is_active: row.is_active,
          description: row.description || null,
        };
      });

      const result = await prisma.$transaction(
        data.map((d) => prisma.categories.create({ data: d })),
      );
      imported.push(...result);
    }

    // Generate error file if there are errors
    let errorFileUrl = null;
    if (errorRows.length > 0 || validRows.length === 0) {
      const errorFileToken = crypto.randomBytes(16).toString("hex");
      errorFileStore.set(errorFileToken, {
        createdAt: Date.now(),
        rows: errorRows,
      });
      errorFileUrl = `/api/v1/management/categories/import/error-file/${errorFileToken}`;
    }

    return {
      total: parsedRows.length,
      success: imported.length,
      failed: errorRows.length,
      errors: errorRows.flatMap((r) =>
        r.errors.map((e) => ({
          row: r.row,
          field: e.field,
          message: e.message,
        })),
      ),
      imported: imported.map((c) => ({ id: c.id, name: c.name })),
      errorFileUrl,
    };
  },

  generateExport: async () => {
    const categories = await prisma.categories.findMany({
      where: { deleted_at: ACTIVE },
      select: { name: true, slug: true, image: true, is_active: true },
      orderBy: { id: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SportNexus";

    const ws = workbook.addWorksheet("Categories");
    ws.columns = [
      { header: "Tên danh mục", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 30 },
      { header: "Hình ảnh", key: "image", width: 40 },
      { header: "Trạng thái", key: "is_active", width: 15 },
      { header: "Mô tả", key: "description", width: 40 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF667EEA" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.border = {
        top: { style: "thin", color: { argb: "FF5A6FD6" } },
        left: { style: "thin", color: { argb: "FF5A6FD6" } },
        bottom: { style: "thin", color: { argb: "FF5A6FD6" } },
        right: { style: "thin", color: { argb: "FF5A6FD6" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    categories.forEach((cat) => {
      ws.addRow({
        name: cat.name,
        slug: cat.slug,
        image: cat.image || "",
        is_active: cat.is_active ? "Hoạt động" : "Ngừng",
        description: "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },

  getErrorFile: async (token) => {
    const entry = errorFileStore.get(token);
    if (!entry) {
      throw new Error("File lỗi không tồn tại hoặc đã hết hạn.");
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SportNexus";

    const ws = workbook.addWorksheet("Lỗi");
    ws.columns = [
      { header: "Dòng số", key: "row", width: 10 },
      { header: "Tên danh mục", key: "name", width: 25 },
      { header: "Slug", key: "slug", width: 25 },
      { header: "Trạng thái", key: "is_active", width: 15 },
      { header: "Mô tả lỗi", key: "errors", width: 50 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE74C3C" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    entry.rows.forEach((r) => {
      ws.addRow({
        row: r.row,
        name: r.name,
        slug: r.slug,
        is_active: r.is_active ? "Hoạt động" : "Ngừng",
        errors: r.errors.map((e) => e.message).join("; "),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};

export default categoryImportService;
```

---

### Task 3: Add controller methods

**Files:**

- Modify: `server/src/controllers/management/categories.controller.js`

Add import, export, template, and error-file handlers.

- [ ] **Add imports at top of file**

```javascript
import categoryImportService from "../../services/management/categoryImport.service.js";
import logService from "../../services/management/log.service.js";
```

- [ ] **Add 4 new methods before the closing `}` of `categoryController`**

```javascript
    importCategories: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn file .xlsx để import.'
                });
            }

            const parsedRows = await categoryImportService.parseFile(req.file.buffer);
            const result = await categoryImportService.importCategories(parsedRows);

            // Log the import action
            await logService.create({
                userId: req.user?.id,
                actionType: 'IMPORT',
                entityType: 'Categories',
                entityId: null,
                status: result.failed > 0 && result.success === 0 ? 'FAILED' : 'SUCCESS',
                details: { total: result.total, success: result.success, failed: result.failed },
                ipAddress: req.ip,
            });

            return res.status(200).json({
                success: true,
                message: `Import hoàn tất: ${result.success} thành công, ${result.failed} lỗi.`,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    exportCategories: async (req, res) => {
        try {
            const buffer = await categoryImportService.generateExport();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="danh-muc.xlsx"');
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    downloadTemplate: async (req, res) => {
        try {
            const buffer = await categoryImportService.generateTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="template-danh-muc.xlsx"');
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    downloadErrorFile: async (req, res) => {
        try {
            const { token } = req.params;
            const buffer = await categoryImportService.getErrorFile(token);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="danh-muc-loi.xlsx"');
            return res.send(buffer);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },
```

---

### Task 4: Add routes

**Files:**

- Modify: `server/src/routes/management/category.route.js`

- [ ] **Add import at top**

```javascript
import { uploadExcelFile } from "../../middlewares/fileUpload.middleware.js";
```

- [ ] **Add 4 new routes before `export default categoryRoute;`**

```javascript
    .post("/import", verifyToken, checkPermission("them-danh-muc"), uploadExcelFile,
      categoryController.importCategories)
    .get("/export", verifyToken, checkPermission("xem-danh-muc"),
      categoryController.exportCategories)
    .get("/template", verifyToken,
      categoryController.downloadTemplate)
    .get("/import/error-file/:token",
      categoryController.downloadErrorFile)
```

---

### Task 5: Create client API

**Files:**

- Create: `client/src/api/management/categoryImportApi.jsx`

- [ ] **Create the API file**

```javascript
import axiosClient from "@/lib/axiosClient";

const categoryImportApi = {
  import: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/management/category/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: () => {
    const url = `${import.meta.env.VITE_API_URL}/management/category/export`;
    const token = localStorage.getItem("accessToken");
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Export thất bại");
      return res.blob();
    });
  },

  downloadTemplate: () => {
    const url = `${import.meta.env.VITE_API_URL}/management/category/template`;
    const token = localStorage.getItem("accessToken");
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Tải template thất bại");
      return res.blob();
    });
  },
};

export default categoryImportApi;
```

---

### Task 6: Create ImportModal component

**Files:**

- Create: `client/src/pages/Admin/categories/components/ImportModal.jsx`

- [ ] **Create new directory and file**

```bash
New-Item -ItemType Directory -Path "client/src/pages/Admin/categories/components" -Force
```

- [ ] **Create ImportModal.jsx**

```javascript
import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import categoryImportApi from "@/api/management/categoryImportApi";

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
      handlePreview(f);
    } else {
      toast.error("Chỉ hỗ trợ file .xlsx");
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      handlePreview(f);
    }
  };

  const handlePreview = async (f) => {
    setLoading(true);
    try {
      const res = await categoryImportApi.import(f);
      setPreview(res.data);
    } catch (err) {
      toast.error(err.message || "Đọc file thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await categoryImportApi.import(file);
      toast.success(res.message || "Import thành công");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Import thất bại");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await categoryImportApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-danh-muc.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Tải template thất bại");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await categoryImportApi.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "danh-muc.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export thành công");
    } catch (err) {
      toast.error("Export thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D121F] border border-slate-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={22} className="text-sky-400" />
            <h2 className="text-lg font-semibold text-white">
              Import danh mục
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Download template + export buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 transition-colors"
            >
              <Download size={16} /> Tải template mẫu
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <Download size={16} /> Export dữ liệu
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-sky-400 bg-sky-500/5"
                : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload size={36} className="mx-auto mb-3 text-slate-500" />
            <p className="text-sm font-medium text-slate-300">
              Kéo thả file Excel vào đây
            </p>
            <p className="text-xs text-slate-500 mt-1">
              hoặc nhấn để chọn file
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Hỗ trợ: .xlsx (tối đa 5MB, 1,000 dòng)
            </p>
            {file && (
              <p className="mt-3 text-sm text-sky-400 font-medium flex items-center justify-center gap-2">
                <FileSpreadsheet size={16} /> {file.name}
              </p>
            )}
          </div>

          {/* Preview result */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Đang đọc file...</span>
            </div>
          )}

          {preview && !loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    {preview.success}
                  </span>
                  <span className="text-slate-400">thành công</span>
                </div>
                {preview.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-amber-400 font-medium">
                      {preview.failed}
                    </span>
                    <span className="text-slate-400">lỗi</span>
                  </div>
                )}
                <div className="text-sm text-slate-500">
                  Tổng:{" "}
                  <span className="font-medium text-slate-300">
                    {preview.total}
                  </span>{" "}
                  dòng
                </div>
              </div>

              {/* Error list */}
              {preview.errors?.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 max-h-40 overflow-y-auto">
                  {preview.errors.map((err, i) => (
                    <p
                      key={i}
                      className="text-xs text-amber-300 flex items-start gap-2 py-0.5"
                    >
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>
                        Dòng {err.row}: <strong>{err.field}</strong> —{" "}
                        {err.message}
                      </span>
                    </p>
                  ))}
                </div>
              )}

              {/* Download error file button */}
              {preview.errorFileUrl && (
                <a
                  href={preview.errorFileUrl}
                  className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={14} /> Tải file lỗi
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            disabled={
              !file ||
              loading ||
              importing ||
              (preview && preview.success === 0)
            }
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : null}
            {importing
              ? "Đang import..."
              : `Import${preview ? ` ${preview.success} dòng` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
```

---

### Task 7: Update categories index page

**Files:**

- Modify: `client/src/pages/Admin/categories/index.jsx`

- [ ] **Add import at top**

```javascript
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, RefreshCw, Upload, Download } from "lucide-react";
```

- [ ] **Add ImportModal import**

```javascript
import ImportModal from "./components/ImportModal";
```

- [ ] **Add state after existing state declarations (~line 43)**

```javascript
const [isImportOpen, setIsImportOpen] = useState(false);
```

- [ ] **Add import/export buttons after existing BtnAdd (after line ~157)**

Replace this:

```jsx
<BtnAdd
  route={"/management/categories/create"}
  className="w-[30%]"
  name="Thêm danh mục"
/>
```

With:

```jsx
        <button
          onClick={() => setIsImportOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 transition-colors"
        >
          <Upload size={16} /> Import
        </button>
        <BtnAdd
          route={"/management/categories/create"}
          className="w-[30%]"
          name="Thêm danh mục"
        />
```

- [ ] **Add ImportModal and import success handler before closing `</>`**

Before the `<ConfirmDelete>` component:

```jsx
<ImportModal
  isOpen={isImportOpen}
  onClose={() => setIsImportOpen(false)}
  onSuccess={() => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    revalidator.revalidate();
  }}
/>
```

---

### Task 8: Verify the implementation

- [ ] **Check server syntax**

```bash
cd server && node --check src/index.js
```

Expected: no output (syntax OK)

- [ ] **Check client build**

```bash
cd client && npm run build 2>&1
```

Expected: Build completes with no errors

- [ ] **Start server and test endpoints**

```bash
# Terminal 1
cd server && npm run dev
```

```bash
# Terminal 2 - test template download
curl -o template.xlsx http://localhost:5000/api/v1/management/category/template -H "Authorization: Bearer $(cat /path/to/token)"
```

Expected: template.xlsx downloaded successfully with correct structure

- [ ] **Cleanup temp files**

Remove the mockup HTML:

```bash
Remove-Item -LiteralPath ".hive/import-mockup.html" -Force
```
