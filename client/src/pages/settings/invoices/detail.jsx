import { useRef } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { printElement } from "@/utils/printUtils";
import { ArrowLeft, Printer } from "lucide-react";
import { INVOICE_STATUS_KEYS } from "@/constants/invoice";
import { useTranslation } from "react-i18next";

const InvoiceDetail = () => {
  const { t } = useTranslation("translation", { keyPrefix: "invoice" });

  const { invoice } = useLoaderData();
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const receipt = receiptRef.current;
    if (!receipt) return;

    printElement(receipt, {
      title: `${t("detail.receipt_title", "Hóa đơn")} ${invoice?.invoice_number || ""}`,
      pageSize: "80mm auto",
      containerWidth: "80mm",
    });
  };

  const INVOICE_LABELS = {
    Pending: t(`detail.${INVOICE_STATUS_KEYS.Pending}`),
    Completed: t(`detail.${INVOICE_STATUS_KEYS.Completed}`),
    Cancelled: t(`detail.${INVOICE_STATUS_KEYS.Cancelled}`),
  };

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-16 md:mt-12 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: t("home"), route: "/" },
            { title: t("invoice"), route: "/hoa-don" },
            {
              title: invoice
                ? invoice.invoice_number
                : t("detail.detail", "Chi tiết"),
              route: "",
            },
          ]}
        />

        {!invoice ? (
          <div className="text-center py-16 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t("detail.no_invoice_found", "Không tìm thấy hóa đơn")}
            </p>
            <Link
              to="/hoa-don"
              className="text-sky-600 dark:text-sky-400 hover:underline mt-3 inline-block font-semibold text-sm"
            >
              {t("detail.back_to_list", "Quay lại danh sách")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="no-print flex items-center justify-between flex-wrap gap-3">
              <Link
                to="/hoa-don"
                className="inline-flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
              >
                <ArrowLeft size={16} />
                {t("detail.back_to_invoices", "Quay lại hóa đơn")}
              </Link>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer rounded-md shadow-sm"
              >
                <Printer size={16} />
                {t("detail.print_invoice", "In hóa đơn")}
              </button>
            </div>

            <div className="flex flex-col items-center">
              {/* Phiếu hóa đơn responsive tối ưu cho điện thoại và máy tính */}
              <div
                ref={receiptRef}
                id="invoice-receipt"
                className="mt-2 sm:mt-[-50px] w-full max-w-[450px] bg-white text-black font-mono text-xs sm:text-sm leading-relaxed p-4 sm:p-8 shadow-xl mx-auto rounded-lg overflow-hidden border border-slate-200 sm:border-none"
              >
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold tracking-widest">
                    SPORTNEXUS
                  </p>
                  <p className="text-[11px] sm:text-xs mt-1">
                    {t("detail.store_subtitle", "Cửa hàng thể thao chính hãng")}
                  </p>
                  <p className="text-[11px] sm:text-xs">
                    123 Nguyễn Huệ, Q.1, TP.HCM
                  </p>
                  <p className="text-[11px] sm:text-xs">Hotline: 1900 0000</p>
                </div>

                <div className="border-t border-dashed border-black my-3 sm:my-4" />

                <div className="space-y-1.5 text-[11px] sm:text-xs">
                  <div className="flex justify-between">
                    <span>{t("detail.receipt_number", "Hóa đơn:")}</span>
                    <span className="font-bold">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("detail.receipt_date", "Ngày:")}</span>
                    <span>
                      {invoice.issued_at
                        ? formatFullDateTime(invoice.issued_at)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("detail.receipt_status", "Trạng thái:")}</span>
                    <span>
                      {INVOICE_LABELS[invoice.status] || invoice.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("detail.receipt_customer", "Khách:")}</span>
                    <span className="font-bold">
                      {invoice.customer_name || "—"}
                    </span>
                  </div>
                  {invoice.customer_phone && (
                    <div className="flex justify-between">
                      <span>{t("detail.receipt_phone", "ĐT:")}</span>
                      <span>{invoice.customer_phone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-black my-3 sm:my-4" />

                <div className="space-y-3 text-[11px] sm:text-xs">
                  {invoice.order?.OrderItems?.map((item) => {
                    const variant = item.product_variant;
                    const attributes = variant?.VariableAttributes?.map(
                      (attr) => `${attr.attributeKey?.name}: ${attr.value}`,
                    ).join(", ");
                    return (
                      <div key={item.id}>
                        <p className="font-bold text-[13px] sm:text-sm">
                          {variant?.product?.name ||
                            t("detail.default_product_name", "Sản phẩm")}
                        </p>
                        {attributes && (
                          <p className="text-[10px] sm:text-[11px] text-gray-600">
                            {attributes}
                          </p>
                        )}
                        <div className="flex justify-between mt-0.5">
                          <span>
                            {item.quantity} x{" "}
                            {formatCurrency(item.price_at_purchase)}
                          </span>
                          <span className="font-bold">
                            {formatCurrency(
                              Number(item.price_at_purchase) *
                                Number(item.quantity),
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-dashed border-black my-3 sm:my-4" />

                <div className="space-y-1.5 text-[11px] sm:text-xs">
                  <div className="flex justify-between">
                    <span>{t("detail.subtotal", "Tạm tính")}</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>{t("detail.discount", "Giảm giá")}</span>
                      <span>-{formatCurrency(invoice.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT ({Number(invoice.vat_rate) * 100}%)</span>
                    <span>{formatCurrency(invoice.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-black pt-2 border-t border-black/10">
                    <span>{t("detail.total_caps", "TỔNG CỘNG")}</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-3 sm:my-4" />

                <div className="text-center">
                  <p className="text-[11px] sm:text-xs font-medium">
                    {t(
                      "detail.thank_you_message",
                      "Cảm ơn quý khách đã mua hàng tại SportNexus!",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
