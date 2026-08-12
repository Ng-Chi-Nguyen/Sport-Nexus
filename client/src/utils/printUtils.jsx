const printElement = (element, options = {}) => {
  const {
    title = "Hóa đơn",
    pageSize = "80mm auto",
    containerWidth = "76mm",
  } = options;

  const elementHTML = element?.outerHTML ?? element;
  if (!elementHTML) return;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

  // Lấy toàn bộ style hiện tại của ứng dụng để truyền vào bản in
  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("");
      } catch {
        return "";
      }
    })
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${styleSheets}

          /* Cấu hình bắt buộc để ép khổ máy in nhiệt */
          @page {
            size: ${pageSize};
            margin: 0 !important;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            width: 80mm;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .print-container {
            width: ${containerWidth};
            height: auto !important;
            margin: 0 auto !important;
            padding: 0 !important;
            /* Chống ngắt trang thừa */
            page-break-after: avoid;
            page-break-before: avoid;
          }

          .print-container > div {
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            margin: 0 !important;
            /* Thêm 1 chút padding dưới cùng để khi máy in cắt giấy không bị lẹm chữ */
            padding-bottom: 8mm !important;
          }

          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${elementHTML}
        </div>
        <script>
          // Đợi DOM render xong style rồi mới gọi lệnh in
          setTimeout(() => {
            window.print();
            window.close();
          }, 400);
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export { printElement };
