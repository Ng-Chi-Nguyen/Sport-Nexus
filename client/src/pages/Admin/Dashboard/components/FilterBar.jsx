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
    <section className="rounded-2xl border border-slate-900 bg-[#0D121F]/60 p-3 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              activePreset === p.key
                ? "border-sky-400 bg-sky-500/15 text-sky-300"
                : "border-slate-800 bg-slate-900/70 text-slate-300 hover:text-sky-300"
            }`}
          >
            {p.label}
          </button>
        ))}
        <input
          type="date"
          value={currentFrom}
          onChange={(e) => applyRange(e.target.value, currentTo)}
          className="w-32 rounded-lg border border-slate-800 bg-[#0B1220] px-2 py-1 text-xs text-slate-100 outline-none"
        />
        <span className="text-xs text-slate-500">→</span>
        <input
          type="date"
          value={currentTo}
          onChange={(e) => applyRange(currentFrom, e.target.value)}
          className="w-32 rounded-lg border border-slate-800 bg-[#0B1220] px-2 py-1 text-xs text-slate-100 outline-none"
        />
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-[#0B1220] p-0.5">
          {["day", "week", "month"].map((g) => (
            <button
              key={g}
              onClick={() =>
                setSearchParams(buildDashboardGroupParams(searchParams, g))
              }
              className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                currentGroupBy === g
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400"
              }`}
            >
              {g === "day" ? "Ngày" : g === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>
        <button
          onClick={() => revalidator.revalidate()}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-sky-300"
        >
          <RefreshCw
            size={12}
            className={revalidator.state === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>
    </section>
  );
};
