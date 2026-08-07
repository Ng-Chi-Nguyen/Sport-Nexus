import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import excelCrudImportApi from "@/api/management/excelCrudImportApi";
import ShowToast from "@/components/ui/toast";

const ExcelCrudImportModal = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  basePath,
  sheetNote,
}) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });

  if (!isOpen) return null;

  const handlePreview = async (f) => {
    setLoading(true);
    setPreview(null);
    try {
      const res = await excelCrudImportApi.preview(basePath, f);
      setPreview(res);
    } catch (err) {
      ShowToast(
        "error",
        err?.response?.data?.message || err.message || t("read_file_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    handlePreview(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      ShowToast("error", t("only_support_xlsx"));
      return;
    }
    setFile(f);
    handlePreview(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await excelCrudImportApi.import(basePath, file);
      ShowToast("success", res.message || t("import_success"));
      onSuccess?.();
      onClose();
    } catch (err) {
      ShowToast(
        "error",
        err?.response?.data?.message || err.message || t("import_error"),
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Nền modal sáng sủa hơn: Dùng slate-900 / dark:slate-900 với viền sáng hơn */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <FileSpreadsheet
              size={22}
              className="text-sky-500 dark:text-sky-400"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              {sheetNote ? (
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                  {sheetNote}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
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
                ? "border-sky-500 bg-sky-500/10"
                : "border-gray-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-slate-500 bg-gray-50/50 dark:bg-slate-800/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload
              size={36}
              className="mx-auto mb-3 text-gray-400 dark:text-slate-400"
            />
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
              {t("drop_file_here")}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {t("or_click_select")}
            </p>
            {sheetNote ? (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {sheetNote}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {t("supported_formats")}
              </p>
            )}
            {file && (
              <p className="mt-3 text-sm text-sky-600 dark:text-sky-400 font-semibold flex items-center justify-center gap-2">
                <FileSpreadsheet size={16} /> {file.name}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-600 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin text-sky-500" />
              <span className="text-sm font-medium">{t("reading_file")}</span>
            </div>
          ) : null}

          {preview && !loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle
                    size={16}
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {preview.success}
                  </span>
                  <span className="text-gray-600 dark:text-slate-300">
                    {t("success_suffix")}
                  </span>
                </div>
                {preview.failed > 0 ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertTriangle
                      size={16}
                      className="text-amber-500 dark:text-amber-400"
                    />
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {preview.failed}
                    </span>
                    <span className="text-gray-600 dark:text-slate-300">
                      {t("error_suffix")}
                    </span>
                  </div>
                ) : null}
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {t("total_label")}{" "}
                  <span className="font-semibold text-gray-900 dark:text-slate-200">
                    {preview.total}
                  </span>{" "}
                  {t("rows_suffix")}
                </div>
              </div>

              {preview.errors?.length > 0 ? (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl p-3 max-h-40 overflow-y-auto">
                  {preview.errors.map((err, index) => (
                    <p
                      key={index}
                      className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 py-0.5"
                    >
                      <span className="text-amber-600 dark:text-amber-400 shrink-0 font-bold">
                        •
                      </span>
                      <span>
                        {t("row_label")} {err.row}:{" "}
                        <strong className="text-amber-900 dark:text-amber-200">
                          {err.field}
                        </strong>{" "}
                        — {err.message}
                      </span>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : null}
            {importing
              ? t("importing")
              : `${t("import")}${
                  preview ? ` (${preview.success} ${t("rows_suffix")})` : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelCrudImportModal;
