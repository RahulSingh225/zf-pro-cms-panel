import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { mapBlockedMemberScanRow } from "../../../../utils/reportExport";
import { getBlockedMemberQrScanReport } from "../../../../services/ApiService";

const BlockedMemberScanReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [username, setUsername] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productCode, setProductCode] = useState("");
    const [productName, setProductName] = useState("");
    const [scanStatus, setScanStatus] = useState("");

    const [tableData, setTableData] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const formatCell = (value: any) => {
        if (value === null || value === undefined || value === "") return "-";
        return value;
    };

    const columns: Column[] = [
        { key: "userName", label: "User Name" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "district", label: "District" },
        { key: "state", label: "State" },
        {
            key: "dateOfJoining",
            label: "Date of Joining",
            format: (value: any) => {
                if (!value || value === "-") return "-";
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "scanId", label: "Scan ID" },
        {
            key: "dateOfScan",
            label: "Date of Scan",
            format: (value: any) => {
                if (!value || value === "-") return "-";
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "productCategory", label: "Product Category" },
        { key: "productCode", label: "Product Code" },
        { key: "productName", label: "Product Name" },
        { key: "productDescription", label: "Product Description" },
        { key: "qrDetails", label: "QR Details" },
        { key: "basePoint", label: "Base Point" },
        { key: "extraBonusPoint", label: "Extra Bonus Point" },
        { key: "totalPoints", label: "Total Points" },
        { key: "scanStatus", label: "Scan Status" }
    ];

    const fetchTableData = async (currentPage: number, isExport = false) => {
        try {
            if (!isExport) setLoading(true);
            const payload: any = {
                limit: isExport ? totalRows || 10000 : pageSize,
                skip: isExport ? 0 : (currentPage - 1) * pageSize,
            };

            if (fromDate) payload.fromDate = new Date(fromDate).toISOString();
            if (toDate) {
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999);
                payload.toDate = toDateObj.toISOString();
            }
            if (username) payload.username = username;
            if (mobileNumber) payload.mobileNumber = mobileNumber;
            if (district) payload.district = district;
            if (state) payload.state = state;
            if (serialNumber) payload.serialNumber = serialNumber;
            if (productCategory) payload.productCategory = productCategory;
            if (productCode) payload.productCode = productCode;
            if (productName) payload.productName = productName;
            if (scanStatus) payload.scanStatus = scanStatus;

            const response = await getBlockedMemberQrScanReport(payload);

            if (response?.data?.code === 200) {
                if (isExport) {
                    return response?.data?.data?.reportList || [];
                } else {
                    const mapped = (response?.data?.data?.reportList || []).map((item: any) => {
                        const row: any = {};
                        Object.keys(item).forEach(k => { row[k] = formatCell(item[k]); });
                        return row;
                    });
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
            console.error("Error fetching blocked member qr scan report:", error);
            if (!isExport) {
                setTableData([]);
                setTotalRows(0);
            }
        } finally {
            if (!isExport) setLoading(false);
        }
    };

    useEffect(() => {
        const canFetchDate = (!fromDate && !toDate) || (fromDate && toDate);
        if (!canFetchDate) return;

        const textFilters = [username, mobileNumber, district, state, serialNumber, productCategory, productCode, productName];
        const hasInvalidText = textFilters.some(filter => filter !== undefined && filter.length > 0 && filter.length < 3);

        if (hasInvalidText) return;

        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, fromDate, toDate, username, mobileNumber, district, state, serialNumber, productCategory, productCode, productName, scanStatus]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);
        return (data || []).map(mapBlockedMemberScanRow);
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Blocked Member Scan Report</h2>
                    <p className="text-gray-500 text-sm">Scan history of blocked members</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="Blocked Member Scan Report" />
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg items-center gap-4">
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">From Date</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">To Date</label>
                        <input
                            type="date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">User Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">District</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">State</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Serial Number</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Category</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Code</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Product Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Scan Status</label>
                        <select
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={scanStatus}
                            onChange={(e) => setScanStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="Success">Success</option>
                            <option value="Failure">Failure</option>
                        </select>
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

export default BlockedMemberScanReport;

