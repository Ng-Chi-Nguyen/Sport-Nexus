import { useState } from "react";
import { useSearchParams, useRevalidator } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  buildDashboardGroupParams,
  buildDashboardRangeParams,
} from "@/utils/dashboard.utils";

const PRESETS = [
  { key: "1d", label: "Hôm nay", days: 1 },
  { key: "7d", label: "7 ngày", days: 7 },
  { key: "30d", label: "30 ngày", days: 30 },
  { key: "90d", label: "90 ngày", days: 90 },
];

const formatDateInput = (date) => date.toISOString().split("T")[0];

export const FilterBar = ({ meta = {} }) => {
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePreset, setActivePreset] = useState("30d");

  const currentFrom = searchParams.get("from") || meta.from || "";
  const currentTo = searchParams.get("to") || meta.to || "";
  const currentGroupBy = searchParams.get("group_by") || meta.group_by || "day";

  const applyRange = (nextFrom, nextTo) => {
    setSearchParams(buildDashboardRangeParams(searchParams, nextFrom, nextTo));
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.key);
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (preset.days - 1));
    applyRange(formatDateInput(start), formatDateInput(end));
  };

  return (
    <section
      className="rounded-2xl border transition-colors duration-200 p-3 shadow-sm backdrop-blur-md
                        bg-white border-slate-200 
                        dark:bg-[#0D121F]/60 dark:border-slate-900 dark:shadow-xl"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Nút Preset (Khoảng thời gian nhanh) */}
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activePreset === p.key
                ? "border-sky-500 bg-sky-50 text-sky-600 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-300"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-sky-300"
            }`}
          >
            {p.label}
          </button>
        ))}

        {/* Ô chọn ngày Từ */}
        <input
          type="date"
          value={currentFrom}
          onChange={(e) => {
            setActivePreset("");
            applyRange(e.target.value, currentTo);
          }}
          className="w-32 rounded-lg border px-2 py-1 text-xs outline-none transition-colors duration-200
                     bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500
                     dark:bg-[#0B1220] dark:border-slate-800 dark:text-slate-100 dark:focus:border-sky-500/50"
        />

        <span className="text-xs text-slate-400 dark:text-slate-500">→</span>

        {/* Ô chọn ngày Đến */}
        <input
          type="date"
          value={currentTo}
          onChange={(e) => {
            setActivePreset("");
            applyRange(currentFrom, e.target.value);
          }}
          className="w-32 rounded-lg border px-2 py-1 text-xs outline-none transition-colors duration-200
                     bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500
                     dark:bg-[#0B1220] dark:border-slate-800 dark:text-slate-100 dark:focus:border-sky-500/50"
        />

        {/* Nhóm nút chọn Group By (Ngày / Tuần / Tháng) */}
        <div
          className="flex items-center gap-0.5 rounded-lg border p-0.5 transition-colors duration-200
                        bg-slate-100 border-slate-200 
                        dark:bg-[#0B1220] dark:border-slate-800"
        >
          {["day", "week", "month"].map((g) => (
            <button
              key={g}
              onClick={() =>
                setSearchParams(buildDashboardGroupParams(searchParams, g))
              }
              className={`rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                currentGroupBy === g
                  ? "bg-white text-sky-600 shadow-sm font-semibold dark:bg-sky-500/15 dark:text-sky-300 dark:shadow-none"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {g === "day" ? "Ngày" : g === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>

        {/* Nút Làm mới (Refresh) */}
        <button
          onClick={() => revalidator.revalidate()}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer
                     border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900
                     dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-sky-300"
          title="Làm mới dữ liệu"
        >
          <RefreshCw
            size={12}
            className={
              revalidator.state === "loading" ? "animate-spin text-sky-500" : ""
            }
          />
        </button>
      </div>
    </section>
  );
};
