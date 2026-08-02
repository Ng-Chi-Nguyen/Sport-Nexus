import { useRef } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { printElement } from "@/utils/printUtils";
import { ArrowLeft, Printer } from "lucide-react";

const INVOICE_LABELS = {
  Pending: "Chờ xử lý",
  Completed: "Đã hoàn thành",
  Cancelled: "Đã hủy",
};

const INVOICE_BADGE = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const InvoiceDetail = () => {
  const { invoice } = useLoaderData();
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const receipt = receiptRef.current;
    if (!receipt) return;

    printElement(receipt, {
      title: `Hóa đơn ${invoice?.invoice_number || ""}`,
      pageSize: "80mm 200mm",
      containerWidth: "80mm",
      containerHeight: "200mm",
    });
  };

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Hóa đơn", route: "/hoa-don" },
            {
              title: invoice ? invoice.invoice_number : "Chi tiết",
              route: "",
            },
          ]}
        />

        {!invoice ? (
          <div className="text-center py-16 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Không tìm thấy hóa đơn
            </p>
            <Link
              to="/hoa-don"
              className="text-sky-600 dark:text-sky-400 hover:underline mt-3 inline-block font-semibold text-sm"
            >
              Quay lại danh sách
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
                Quay lại hóa đơn
              </Link>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer"
              >
                <Printer size={16} />
                In hóa đơn
              </button>
            </div>

            <div className="flex flex-col items-center">
              {/* Phiếu hóa đơn kiểu siêu thị */}
              <div
                ref={receiptRef}
                id="invoice-receipt"
                className="w-full max-w-[340px] bg-white text-black font-mono text-[11px] leading-snug px-4 py-5 shadow-xl"
              >
                <div className="text-center">
                  <p className="text-base font-bold tracking-widest">
                    SPORTNEXUS
                  </p>
                  <p className="text-[10px] mt-0.5">
                    Cửa hàng thể thao chính hãng
                  </p>
                  <p className="text-[10px]">123 Nguyễn Huệ, Q.1, TP.HCM</p>
                  <p className="text-[10px]">Hotline: 1900 0000</p>
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Hóa đơn:</span>
                    <span className="font-bold">
                      {invoice.invoice_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày:</span>
                    <span>
                      {invoice.issued_at
                        ? formatFullDateTime(invoice.issued_at)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <span>{INVOICE_LABELS[invoice.status] || invoice.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Khách:</span>
                    <span className="font-bold">
                      {invoice.customer_name || "—"}
                    </span>
                  </div>
                  {invoice.customer_phone && (
                    <div className="flex justify-between">
                      <span>ĐT:</span>
                      <span>{invoice.customer_phone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="space-y-1.5">
                  {invoice.order?.OrderItems?.map((item) => {
                    const variant = item.product_variant;
                    const attributes = variant?.VariableAttributes?.map(
                      (attr) => `${attr.attributeKey?.name}: ${attr.value}`,
                    ).join(", ");
                    return (
                      <div key={item.id}>
                        <p className="font-bold">
                          {variant?.product?.name || "Sản phẩm"}
                        </p>
                        {attributes && (
                          <p className="text-[10px]">{attributes}</p>
                        )}
                        <div className="flex justify-between">
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

                <div className="border-t border-dashed border-black my-2" />

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>Giảm giá</span>
                      <span>
                        -{formatCurrency(invoice.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT ({Number(invoice.vat_rate) * 100}%)</span>
                    <span>{formatCurrency(invoice.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1">
                    <span>TỔNG CỘNG</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-2" />

                <div className="text-center">
                  <p className="text-[10px]">
                    Cảm ơn quý khách đã mua hàng tại SportNexus!
                  </p>
                  <p className="text-[10px] mt-1">
                    Hàng đã mua chỉ đổi trả khi còn hóa đơn
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
