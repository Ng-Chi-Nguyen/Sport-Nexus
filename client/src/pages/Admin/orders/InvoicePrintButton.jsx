import { useRef, useState } from "react";
import { Loader2, Printer, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import managementInvoiceApi from "@/api/management/invoiceApi";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import { printElement } from "@/utils/printUtils";

const InvoicePrintButton = ({ orderId }) => {
  const { t } = useTranslation("translation", { keyPrefix: "invoice" });
  const [invoice, setInvoice] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const receiptRef = useRef(null);

  const openInvoice = async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const response = await managementInvoiceApi.getInvoiceByOrderId(orderId);
      setInvoice(response?.data || null);
    } catch {
      setInvoice(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    printElement(receiptRef.current, {
      title: `${t("detail.receipt_title", "Hóa đơn")} ${invoice?.invoice_number || ""}`,
      pageSize: "80mm auto",
      containerWidth: "80mm",
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openInvoice}
        className="p-2 bg-slate-100 text-slate-600 hover:text-sky-600 border border-slate-200 hover:border-sky-500/40 dark:bg-[#111827] dark:text-slate-400 dark:hover:text-sky-400 dark:border-slate-800 dark:hover:border-sky-500/30 rounded-lg transition-all duration-150"
        title={t("detail.print_invoice", "In hóa đơn")}
      >
        <Printer size={14} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("detail.print_invoice", "In hóa đơn")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                title={t("detail.close", "Đóng")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-sky-600" size={24} />
                </div>
              ) : invoice ? (
                <div
                  ref={receiptRef}
                  className="mx-auto w-full max-w-[450px] bg-white p-6 font-mono text-xs leading-relaxed text-black"
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold tracking-widest">
                      SPORTNEXUS
                    </p>
                    <p className="mt-1">
                      {t(
                        "detail.store_subtitle",
                        "Cửa hàng thể thao chính hãng",
                      )}
                    </p>
                    <p>123 Nguyễn Huệ, Q.1, TP.HCM</p>
                    <p>Hotline: 1900 0000</p>
                  </div>
                  <div className="my-4 border-t border-dashed border-black" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>{t("detail.receipt_number", "Hóa đơn:")}</span>
                      <b>{invoice.invoice_number}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("detail.receipt_date", "Ngày:")}</span>
                      <span>
                        {invoice.issued_at
                          ? formatFullDateTime(invoice.issued_at)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("detail.receipt_customer", "Khách:")}</span>
                      <b>{invoice.customer_name || "-"}</b>
                    </div>
                    {invoice.customer_phone && (
                      <div className="flex justify-between">
                        <span>{t("detail.receipt_phone", "ĐT:")}</span>
                        <span>{invoice.customer_phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="my-4 border-t border-dashed border-black" />
                  <div className="space-y-3">
                    {invoice.order?.OrderItems?.map((item) => {
                      const variant = item.product_variant;
                      const attributes = variant?.VariableAttributes?.map(
                        (attribute) =>
                          `${attribute.attributeKey?.name}: ${attribute.value}`,
                      ).join(", ");
                      return (
                        <div key={item.id}>
                          <p className="font-bold">
                            {variant?.product?.name ||
                              t("detail.default_product_name", "Sản phẩm")}
                          </p>
                          {attributes && (
                            <p className="text-[10px] text-gray-600">
                              {attributes}
                            </p>
                          )}
                          <div className="mt-0.5 flex justify-between">
                            <span>
                              {item.quantity} x{" "}
                              {formatCurrency(item.price_at_purchase)}
                            </span>
                            <b>
                              {formatCurrency(
                                Number(item.price_at_purchase) *
                                  Number(item.quantity),
                              )}
                            </b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="my-4 border-t border-dashed border-black" />
                  <div className="space-y-1.5">
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
                    <div className="flex justify-between border-t border-black/10 pt-2 text-sm font-black">
                      <span>{t("detail.total_caps", "TỔNG CỘNG")}</span>
                      <span>{formatCurrency(invoice.total_amount)}</span>
                    </div>
                  </div>
                  <div className="my-4 border-t border-dashed border-black" />
                  <p className="text-center">
                    {t(
                      "detail.thank_you_message",
                      "Cảm ơn quý khách đã mua hàng tại SportNexus!",
                    )}
                  </p>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-slate-500">
                  {t("detail.no_invoice_found", "Không tìm thấy hóa đơn")}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("detail.close", "Đóng")}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={!invoice || isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={16} />
                {t("detail.print_invoice", "In hóa đơn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoicePrintButton;
