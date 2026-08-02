const printElement = (element, options = {}) => {
  const {
    title = "Print",
    pageSize = "105mm 45mm",
    containerWidth = "100mm",
    containerHeight = "40mm",
  } = options;

  const elementHTML = element?.outerHTML ?? element;
  if (!elementHTML) return;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

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

          @page {
            size: ${pageSize};
            margin: 0;
          }

          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-container {
            width: ${containerWidth};
            height: ${containerHeight};
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .print-container > div {
            width: 100% !important;
            height: 100% !important;
            box-shadow: none !important;
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
          setTimeout(() => {
            window.print();
            window.close();
          }, 300);
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export { printElement };
