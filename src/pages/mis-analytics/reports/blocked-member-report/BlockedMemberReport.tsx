import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { mapBlockedMemberRow } from "../../../../utils/reportExport";
import { getBlockedMemberReport } from "../../../../services/ApiService";
import { BlockedMemberReportKeys } from "../../../../utils/ExportKeyMappings";


const BlockedMemberReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [username, setUsername] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [userType, setUserType] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [upiId, setUpiId] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [bankName, setBankName] = useState("");
    const [status, setStatus] = useState("");

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
        { key: "userType", label: "User Type" },
        { key: "district", label: "District" },
        { key: "state", label: "State" },
        {
            key: "dateOfJoining",
            label: "Date of Joining",
            format: (value: any) => {
                if (!value) return 'N/A';
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "totalEarnedPoints", label: "Total Earned Points" },
        { key: "redeemedPoints", label: "Redeemed Points" },
        {
            key: "redemptionRequestDate",
            label: "Redemption Request Date",
            format: (value: any) => {
                if (!value) return 'N/A';
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        {
            key: "redemptionProcessedDate",
            label: "Redemption Processed Date",
            format: (value: any) => {
                if (!value) return 'N/A';
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "redemptionDetails", label: "Redemption Details" },
        { key: "upiId", label: "UPI ID" },
        { key: "accountNumber", label: "Account Number" },
        { key: "accountHolderName", label: "Account Holder Name" },
        { key: "ifscCode", label: "IFSC Code" },
        { key: "bankName", label: "Bank Name" },
        { key: "status", label: "Status" }
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
            if (userType) payload.userType = userType;
            if (district) payload.district = district;
            if (state) payload.state = state;
            if (upiId) payload.upiId = upiId;
            if (accountNumber) payload.accountNumber = accountNumber;
            if (accountHolderName) payload.accountHolderName = accountHolderName;
            if (ifscCode) payload.ifscCode = ifscCode;
            if (bankName) payload.bankName = bankName;
            if (status) payload.status = status;

            const response = await getBlockedMemberReport(payload);

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
            console.error("Error fetching blocked member report:", error);
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

        const textFilters = [username, mobileNumber, userType, district, state, upiId, accountNumber, accountHolderName, ifscCode, bankName];
        const hasInvalidText = textFilters.some(filter => filter !== undefined && filter.length > 0 && filter.length < 3);

        if (hasInvalidText) return;

        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, fromDate, toDate, username, mobileNumber, userType, district, state, upiId, accountNumber, accountHolderName, ifscCode, bankName, status]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);
        return (data || []).map(mapBlockedMemberRow);
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Blocked Member Report</h2>
                    <p className="text-gray-500 text-sm">Report of members who have been blocked</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="Blocked Member Report" />
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
                        <label className="text-sm font-medium text-gray-600">User Type</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
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
                        <label className="text-sm font-medium text-gray-600">UPI ID</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Account Number</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Account Holder Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">IFSC Code</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Bank Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <select
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="temporary_block">Temporary Block</option>
                            <option value="permanent_block">Permanent Block</option>
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

export default BlockedMemberReport;
