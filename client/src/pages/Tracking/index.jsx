import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, MapPin, Loader2 } from "lucide-react";
import shippingApi from "@/api/customer/shippingApi";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SHIPPING_STATUS_LABELS } from "@/constants/order";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const TrackingPage = () => {
  const [params] = useSearchParams();
  const initialCode = params.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setShipment(null);
    try {
      const res = await shippingApi.track(code.trim());
      if (!res.success) throw new Error(res.message || "Không tìm thấy vận đơn");
      setShipment(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Không tìm thấy vận đơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) handleTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIndex = shipment
    ? shipment.timeline.findIndex((s) => s.status === shipment.status)
    : -1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Breadcrumbs
            data={[
              { title: "Trang chủ", route: "/" },
              { title: "Tra cứu vận đơn", route: "" },
            ]}
          />
        </div>

        <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
          <h1 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
            <PackageSearch size={20} className="text-sky-500" />
            Tra cứu vận đơn
          </h1>

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Nhập mã vận đơn (vd: SN1908234567)"
              className="flex-1 px-3 py-2 border rounded text-sm bg-slate-50 border-slate-300 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleTrack}
              disabled={loading || !code.trim()}
              className="px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 rounded text-sm font-medium disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              Tra cứu
            </button>
          </div>

          {error && (
            <p className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3">
              {error}
            </p>
          )}

          {shipment && (
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pb-4 border-b border-slate-200 dark:border-slate-800 text-sm">
                <span>
                  Mã vận đơn:{" "}
                  <b className="text-sky-600 dark:text-sky-400">{shipment.tracking_code}</b>
                </span>
                <span>
                  Trạng thái: <b>{SHIPPING_STATUS_LABELS[shipment.status] || shipment.status}</b>
                </span>
                <span>
                  Giao cho: {shipment.recipient_name} • {shipment.recipient_phone}
                </span>
                <span className="w-full text-slate-500 dark:text-slate-400">
                  {shipment.detail_address}, {shipment.ward_name}, {shipment.province_name}
                </span>
              </div>

              <div className="py-5 space-y-0">
                {(shipment.timeline || []).map((step, idx) => {
                  const done = idx <= currentIndex;
                  const active = idx === currentIndex && shipment.status !== "CANCELLED";
                  const isLast = idx === shipment.timeline.length - 1;
                  return (
                    <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                      {!isLast && (
                        <span
                          className={`absolute left-[7px] top-5 bottom-0 w-px ${
                            done ? "bg-emerald-500/50" : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      )}
                      <span
                        className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                          active
                            ? "bg-sky-500 border-sky-200 dark:border-sky-700 shadow-[0_0_8px_rgba(14,165,233,0.6)]"
                            : done
                              ? "bg-emerald-500 border-emerald-200 dark:border-emerald-700"
                              : "bg-white dark:bg-[#0D121F] border-slate-300 dark:border-slate-700"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          done ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {SHIPPING_STATUS_LABELS[step.status] || step.status}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDate(step.time)}
                      </p>
                      {step.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {step.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;