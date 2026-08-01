import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { actionConfig, entityNames } from "@/constants/management/log";
import { formatFullDateTime } from "@/utils/formatters";

const entityLinks = {
  Orders: (id) => `/management/orders/edit/${id}`,
  Products: (id) => `/management/products/edit/${id}`,
  Users: (id) => `/management/users/edit/${id}`,
  ProductVariants: (id) => `/management/product-variants/edit/${id}`,
  Coupons: (id) => `/management/coupons/edit/${id}`,
  Brands: (id) => `/management/brands/edit/${id}`,
  Categories: (id) => `/management/categories/edit/${id}`,
  Suppliers: (id) => `/management/suppliers/edit/${id}`,
};

const LogEntry = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const config = actionConfig[log.action_type] || {
    icon: Pencil,
    label: "đã tác động",
    color: "text-slate-500 dark:text-slate-400",
  };
  const ActionIcon = config.icon;
  const isDelete = log.action_type === "DELETE";
  const entityLink = isDelete
    ? null
    : entityLinks[log.entity_type]?.(log.entity_id);
  const entityName = entityNames[log.entity_type] || log.entity_type;
  const displayId = log.entity_id ? `#${log.entity_id}` : "";

  const time = formatFullDateTime(log.timestamp);

  // Style nền và viền theo trạng thái FAILED / SUCCESS
  const containerStyle =
    log.status === "FAILED"
      ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/5 dark:hover:bg-rose-500/10"
      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800/50 dark:bg-[#0D121F]/60 dark:hover:bg-slate-800/30";

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${containerStyle}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
        #{log.id}
      </div>

      <div className={`shrink-0 mt-0.5 ${config.color}`}>
        <ActionIcon size={18} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-mono shrink-0">
            {time}
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
            {log.user?.full_name || log.user?.email || "Hệ thống"}
          </span>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {entityName}
          </span>

          {entityLink ? (
            <Link
              to={entityLink}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium underline-offset-2 hover:underline"
            >
              {displayId}
            </Link>
          ) : (
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {displayId}
            </span>
          )}

          {log.status === "FAILED" && (
            <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <XCircle size={12} /> Thất bại
            </span>
          )}
          {log.status === "SUCCESS" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle size={12} /> Thành công
            </span>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pl-0 space-y-2 border-t pt-2 border-slate-200/60 dark:border-slate-800/60">
            {renderDetails(log)}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              IP: {log.ip_address || "N/A"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderDetails(log) {
  const details = log.details;

  if (!details || (Array.isArray(details) && details.length === 0)) {
    return null;
  }

  const changes = Array.isArray(details) ? details : [details];

  if (log.status === "FAILED") {
    const errorMsg = changes[0]?.error || "Lỗi không xác định";
    return (
      <div className="text-xs text-rose-700 bg-rose-100/70 border border-rose-200 dark:border-transparent dark:text-rose-300 dark:bg-rose-500/10 rounded-lg p-3 font-mono">
        {errorMsg}
      </div>
    );
  }

  if (log.action_type === "DELETE") {
    return (
      <div className="text-xs text-slate-700 bg-slate-100 border border-slate-200 dark:border-transparent dark:text-slate-400 dark:bg-slate-800/30 rounded-lg p-3">
        <div className="font-medium text-slate-800 dark:text-slate-300 mb-1">
          Dữ liệu đã xoá:
        </div>
        <pre className="whitespace-pre-wrap overflow-x-auto font-mono text-[11px]">
          {JSON.stringify(changes[0]?.from || changes[0], null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      {changes.map((change, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
        >
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {change.field}:
          </span>
          {change.from !== undefined && (
            <span className="line-through text-rose-600/80 dark:text-rose-400/70">
              {String(change.from)}
            </span>
          )}
          {change.from !== undefined && change.to !== undefined && (
            <span className="text-slate-400 dark:text-slate-600">→</span>
          )}
          {change.to !== undefined && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {String(change.to)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default LogEntry;
