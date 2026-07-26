import { useState } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import excelCrudImportApi from "@/api/management/excelCrudImportApi";
import ExcelCrudImportModal from "./ExcelCrudImportModal";

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

  const handleTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await excelCrudImportApi.template(basePath);
      downloadBlob(res, templateFileName || "template.xlsx");
      toast.success("Tải template thành công");
    } catch (err) {
      toast.error(err?.message || "Tải template thất bại");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await excelCrudImportApi.export(basePath);
      downloadBlob(res, exportFileName || "export.xlsx");
      toast.success("Export thành công");
    } catch (err) {
      toast.error(err?.message || "Export thất bại");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <button onClick={handleTemplate} disabled={templateLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-xl hover:bg-sky-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {templateLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          {templateLoading ? "Đang tải..." : "Template"}
        </button>
        <button onClick={handleExport} disabled={exportLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {exportLoading ? "Đang xuất..." : "Export"}
        </button>
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl hover:opacity-90 transition-opacity">
          <Upload size={16} /> Import
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
