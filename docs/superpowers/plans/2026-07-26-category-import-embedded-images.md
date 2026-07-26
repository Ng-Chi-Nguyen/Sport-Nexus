# Category Import Embedded Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow category import templates to accept pasted/embedded Excel images directly and upload them to Supabase during import.

**Architecture:** Keep workbook formatting in `categoryImport.workbook.js` and parsing/upload logic in `categoryImport.service.js`. The template will instruct users to insert images into the `Categories` sheet, while the parser will read embedded images anchored to the image column, convert them into uploadable buffers when needed, and persist the resulting public URLs.

**Tech Stack:** Node.js, ExcelJS, Sharp, Supabase Storage, Express

---

### Task 1: Regression coverage for embedded image import

**Files:**

- Create: `server/test/categoryImport.import-images.test.js`
- Modify: `server/src/configs/supabase.config.js` only if test setup needs a safe stub path

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import sharp from "sharp";
import categoryImportService from "../src/services/management/categoryImport.service.js";
import { supabase } from "../src/configs/supabase.config.js";

test("parseFile uploads an embedded image from the Categories sheet", async () => {
  const originalStorage = supabase.storage;
  const uploads = [];
  supabase.storage = {
    from: () => ({
      upload: async (fileName, buffer, options) => {
        uploads.push({ fileName, buffer, options });
        return { data: {}, error: null };
      },
      getPublicUrl: (fileName) => ({
        data: { publicUrl: `https://cdn.example/${fileName}` },
      }),
    }),
  };

  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Categories");
    ws.columns = [
      { header: "Tên danh mục", key: "name", width: 35 },
      { header: "Ảnh", key: "image", width: 18 },
      { header: "Trạng thái", key: "is_active", width: 18 },
    ];
    ws.addRow({ name: "Giày chạy bộ", image: "", is_active: "Hoạt động" });

    const imageBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: { r: 0, g: 128, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });
    ws.addImage(imageId, {
      tl: { col: 1.05, row: 1.05 },
      ext: { width: 40, height: 40 },
      editAs: "oneCell",
    });

    const parsed = await categoryImportService.parseFile(
      await workbook.xlsx.writeBuffer(),
    );

    assert.equal(parsed[0].image, "https://cdn.example/excel_import");
    assert.equal(uploads.length, 1);
    assert.equal(parsed[0].errors.length, 0);
  } finally {
    supabase.storage = originalStorage;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test server/test/categoryImport.import-images.test.js`
Expected: FAIL because `parseFile` still needs cleanup/import support for the embedded image flow.

- [ ] **Step 3: Write minimal implementation**

```js
import ExcelJS from "exceljs";

// keep existing embedded-image extraction, but make row mapping stable for sheet images in column B
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/test/categoryImport.import-images.test.js`
Expected: PASS with exactly one upload and a public image URL on the parsed row.

- [ ] **Step 5: Commit**

```bash
git add server/test/categoryImport.import-images.test.js server/src/services/management/categoryImport.service.js
git commit -m "fix: import embedded category images"
```

### Task 2: Template and guidance update

**Files:**

- Modify: `server/src/services/management/categoryImport.workbook.js`
- Modify: `server/src/services/management/categoryImport.service.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { buildCategoryTemplateBuffer } from "../src/services/management/categoryImport.workbook.js";

test("template instructs users to insert images directly into the sheet", async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await buildCategoryTemplateBuffer());

  const ws = workbook.getWorksheet("Hướng dẫn");
  const text = [
    ws.getCell("A3").value,
    ws.getCell("B3").value,
    ws.getCell("A6").value,
    ws.getCell("B6").value,
  ].join(" ");
  assert.match(text, /ảnh/i);
  assert.doesNotMatch(text, /URL ảnh/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test server/test/categoryImport.template.test.js`
Expected: FAIL until the guidance text is updated.

- [ ] **Step 3: Write minimal implementation**

```js
// replace URL-based wording with direct image insertion wording and widen the image column / row heights
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/test/categoryImport.template.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/services/management/categoryImport.workbook.js server/src/services/management/categoryImport.service.js
git commit -m "chore: update category import template guidance"
```

### Task 3: Full backend verification

**Files:**

- Modify: any files changed above only

- [ ] **Step 1: Run the server test suite**

Run: `node --test server/test/*.test.js`
Expected: PASS.

- [ ] **Step 2: Run syntax checks**

Run: `node --check server/src/services/management/categoryImport.service.js` and `node --check server/src/services/management/categoryImport.workbook.js`
Expected: both exit cleanly.

- [ ] **Step 3: Manually sanity-check workbook generation**

Run: `npm run dev --prefix server`
Expected: backend starts, template download works, and a workbook created from the template is ready for pasted images.

- [ ] **Step 4: Commit**

```bash
git add server/src/services/management/categoryImport.service.js server/src/services/management/categoryImport.workbook.js server/test/*.test.js
git commit -m "feat: import embedded category images"
```
