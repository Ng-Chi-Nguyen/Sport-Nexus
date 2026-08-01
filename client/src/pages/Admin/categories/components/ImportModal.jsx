import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import categoryImportApi from "@/api/management/categoryImportApi";
import { useTranslation } from "react-i18next";

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "category" });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
      handlePreview(f);
    } else {
      toast.error(t("only_xlsx"));
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      handlePreview(f);
    }
  };

  const handlePreview = async (f) => {
    setLoading(true);
    setPreview(null);
    try {
      const res = await categoryImportApi.preview(f);
      setPreview(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || t("file_read_failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await categoryImportApi.import(file);
      toast.success(res.message || t("import_success"));
      onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || t("import_failed");
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await categoryImportApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-danh-muc.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download template error:", err);
      toast.error(err?.message || t("template_download_failed"));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await categoryImportApi.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "danh-muc.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t("export_success"));
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err?.message || t("export_failed"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D121F] border border-slate-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={22} className="text-sky-400" />
            <h2 className="text-lg font-semibold text-white">
              {t("import_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 transition-colors"
            >
              <Download size={16} /> {t("import_template")}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <Download size={16} /> {t("export_data")}
            </button>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-sky-400 bg-sky-500/5"
                : "border-slate-700 hover:border-slate-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload size={36} className="mx-auto mb-3 text-slate-500" />
            <p className="text-sm font-medium text-slate-300">
              {t("drag_drop")}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t("click_select")}
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {t("support_note")}
            </p>
            {file && (
              <p className="mt-3 text-sm text-sky-400 font-medium flex items-center justify-center gap-2">
                <FileSpreadsheet size={16} /> {file.name}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">{t("reading_file")}</span>
            </div>
          )}

          {preview && !loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    {preview.success}
                  </span>
                  <span className="text-slate-400">{t("success_count")}</span>
                </div>
                {preview.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-amber-400 font-medium">
                      {preview.failed}
                    </span>
                    <span className="text-slate-400">{t("error_count")}</span>
                  </div>
                )}
                <div className="text-sm text-slate-500">
                  {t("total_count")}{" "}
                  <span className="font-medium text-slate-300">
                    {preview.total}
                  </span>{" "}
                  {t("total_rows")}
                </div>
              </div>

              {preview.errors?.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 max-h-40 overflow-y-auto">
                  {preview.errors.map((err, i) => (
                    <p
                      key={i}
                      className="text-xs text-amber-300 flex items-start gap-2 py-0.5"
                    >
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>
                        {t("row_error", { row: err.row })} <strong>{err.field}</strong> —{" "}
                        {err.message}
                      </span>
                    </p>
                  ))}
                </div>
              )}

              {preview.errorFileUrl && (
                <a
                  href={preview.errorFileUrl}
                  className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={14} /> {t("download_error_file")}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleImport}
            disabled={
              !file ||
              loading ||
              importing ||
              (preview && preview.success === 0)
            }
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : null}
            {importing
              ? t("importing")
              : preview
                ? t("import_rows", { count: preview.success })
                : t("import_btn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
