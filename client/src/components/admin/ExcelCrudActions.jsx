import { useState } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import excelCrudImportApi from "@/api/management/excelCrudImportApi";
import ExcelCrudImportModal from "./ExcelCrudImportModal";
import ShowToast from "@/components/ui/toast";

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

const ExcelCrudActions = ({
  basePath,
  title,
  onSuccess,
  templateFileName,
  exportFileName,
  sheetNote,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });

  const handleTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await excelCrudImportApi.template(basePath);
      downloadBlob(res, templateFileName || "template.xlsx");
      ShowToast("success", t("template_success"));
    } catch (err) {
      ShowToast("error", err?.message || t("template_error"));
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await excelCrudImportApi.export(basePath);
      downloadBlob(res, exportFileName || "export.xlsx");
      ShowToast(t("success", "export_success"));
    } catch (err) {
      ShowToast("error", err?.message || t("export_error"));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <button
          onClick={handleTemplate}
          disabled={templateLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {templateLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          {templateLoading ? t("loading") : t("template")}
        </button>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {exportLoading ? t("exporting") : t("export")}
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Upload size={16} /> {t("import")}
        </button>
      </div>

      <ExcelCrudImportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
        title={title}
        basePath={basePath}
        sheetNote={sheetNote}
      />
    </>
  );
};

export default ExcelCrudActions;
