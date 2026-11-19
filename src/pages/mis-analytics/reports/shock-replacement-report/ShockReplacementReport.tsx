import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { getShockReplacementReport } from "../../../../services/ApiService";
import { mapShockReplacementRow } from "../../../../utils/reportExport";

const ShockReplacementReport = () => {
    const [userId, setUserId] = useState("");
    const [tableData, setTableData] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const columns: Column[] = [
        { key: "id", label: "Record ID" },
        { key: "userName", label: "User Name" },
        { key: "skuCode", label: "SKU Code" },
        { key: "skuName", label: "SKU Name" },
        { key: "quantity", label: "Quantity" },
        { key: "createdAt", label: "Created At" },
        { key: "createdBy", label: "Created By" },
    ];

    const fetchTableData = async (currentPage: number, isExport = false) => {
        try {
            if (!isExport) setLoading(true);
            const payload: any = {
                limit: isExport ? totalRows || 10000 : pageSize,
                skip: isExport ? 0 : (currentPage - 1) * pageSize,
            };

            const parsedUserId = Number(userId);
            if (userId && !isNaN(parsedUserId) && parsedUserId > 0) {
                payload.userId = parsedUserId;
            }

            const response = await getShockReplacementReport(payload);

            if (response?.data?.code === 200) {
                const reportList = response?.data?.data?.reportList || [];
                const mapped = reportList.map(mapShockReplacementRow);

                if (isExport) {
                    return mapped;
                } else {
                    setTableData(mapped);
                    setTotalRows(response?.data?.data?.totalCount || 0);
                }
            } else {
                if (!isExport) {
                    setTableData([]);
                    setTotalRows(0);
                }
            }
        } catch (error) {
            console.error("Error fetching shock replacement report:", error);
            if (!isExport) {
                setTableData([]);
                setTotalRows(0);
            }
        } finally {
            if (!isExport) setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, userId]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);
        return data || [];
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Shock Replacement Report</h2>
                    <p className="text-gray-500 text-sm">Report on shock replacement configurations and selections</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="Shock Replacement Report" />
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg items-center gap-4">
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">User ID</label>
                        <input
                            type="number"
                            placeholder="Search by User ID"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userId}
                            onChange={(e) => {
                                setUserId(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <CustomTable
                    data={tableData}
                    columns={columns}
                    pageSize={pageSize}
                    totalRows={totalRows}
                    currentPage={page}
                    onPageChange={onPageChange}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ShockReplacementReport;
