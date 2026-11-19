import * as XLSX from "xlsx";
import { ExporterType } from "../types/Export";
import DownloadIcon from "@mui/icons-material/Download";
import { buildExportSheetRows } from "../utils/reportExport";

const ExporterButton = ({
    exporter,
    reportName,
}: ExporterType) => {

    const downloadExcel = async () => {
        try {
            const data = await exporter();
            if (!data?.length) return;

            const rows = buildExportSheetRows(reportName, data);
            if (!rows) {
                console.warn("❗ Export mapping not found for:", reportName);
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, `${reportName}.xlsx`);

        } catch (e) {
            console.error("EXPORT ERROR:", e);
        }
    };

    return (
        <button
            className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 bg-white hover:bg-green-50 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm"
            onClick={downloadExcel}
            title="Export to Excel"
        >
            <DownloadIcon fontSize="small" />
            Export
        </button>

    );
};

export default ExporterButton;
