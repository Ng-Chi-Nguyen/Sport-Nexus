import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
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
    color: "text-slate-400",
  };
  const ActionIcon = config.icon;
  const isDelete = log.action_type === "DELETE";
  const entityLink = isDelete
    ? null
    : entityLinks[log.entity_type]?.(log.entity_id);
  const entityName = entityNames[log.entity_type] || log.entity_type;
  const displayId = log.entity_id ? `#${log.entity_id}` : "";

  const time = formatFullDateTime(log.timestamp);

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
        log.status === "FAILED"
          ? "border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10"
          : "border-slate-800/50 bg-[#0D121F]/60 hover:bg-slate-800/30"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="">{log.id}</div>
      <div className={`shrink-0 mt-0.5 ${config.color}`}>
        <ActionIcon size={18} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-slate-500 text-xs font-mono shrink-0">
            {time}
          </span>
          <span className="text-slate-300 font-medium truncate">
            {log.user?.full_name || log.user?.email || "Hệ thống"}
          </span>
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-slate-400">{entityName}</span>
          {entityLink ? (
            <Link
              to={entityLink}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-400 hover:text-sky-300 font-medium underline-offset-2 hover:underline"
            >
              {displayId}
            </Link>
          ) : (
            <span className="text-slate-400 font-medium">{displayId}</span>
          )}
          {log.status === "FAILED" && (
            <span className="inline-flex items-center gap-1 text-xs text-rose-400">
              <XCircle size={12} /> Thất bại
            </span>
          )}
          {log.status === "SUCCESS" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle size={12} /> Thành công
            </span>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pl-0 space-y-2">
            {renderDetails(log)}
            <div className="text-xs text-slate-500">
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
      <div className="text-xs text-rose-300 bg-rose-500/10 rounded-lg p-3 font-mono">
        {errorMsg}
      </div>
    );
  }

  if (log.action_type === "DELETE") {
    return (
      <div className="text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3">
        <div className="font-medium text-slate-300 mb-1">Dữ liệu đã xoá:</div>
        <pre className="whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(changes[0]?.from || changes[0], null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      {changes.map((change, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-500">{change.field}:</span>
          {change.from !== undefined && (
            <span className="line-through text-rose-400/70">
              {String(change.from)}
            </span>
          )}
          {change.from !== undefined && change.to !== undefined && (
            <span className="text-slate-600">→</span>
          )}
          {change.to !== undefined && (
            <span className="text-emerald-400">{String(change.to)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default LogEntry;
