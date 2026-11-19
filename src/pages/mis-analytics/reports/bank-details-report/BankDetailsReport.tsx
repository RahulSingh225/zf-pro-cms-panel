import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { mapBankDetailsRow } from "../../../../utils/reportExport";
import { getBankDetailsReport } from "../../../../services/ApiService";
import { BankDetailsReportKeys } from "../../../../utils/ExportKeyMappings";


const BankDetailsReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");
    const [name, setName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [accountType, setAccountType] = useState("");
    const [upiId, setUpiId] = useState("");

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
        { key: "userId", label: "User ID" },
        { key: "uniqueCode", label: "Unique Code" },
        { key: "name", label: "Name" },
        { key: "roleName", label: "Role Name" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "bankName", label: "Bank Name" },
        { key: "accountNumber", label: "Account Number" },
        { key: "ifscCode", label: "IFSC Code" },
        { key: "accountType", label: "Account Type" },
        { key: "branchName", label: "Branch Name" },
        { key: "bankAddress", label: "Bank Address" },
        { key: "upiId", label: "UPI ID" }
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
            if (uniqueCode) payload.uniqueCode = uniqueCode;
            if (name) payload.name = name;
            if (roleName) payload.roleName = roleName;
            if (mobileNumber) payload.mobileNumber = mobileNumber;
            if (bankName) payload.bankName = bankName;
            if (accountNumber) payload.accountNumber = accountNumber;
            if (ifscCode) payload.ifscCode = ifscCode;
            if (accountType) payload.accountType = accountType;
            if (upiId) payload.upiId = upiId;

            const response = await getBankDetailsReport(payload);

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
            console.error("Error fetching bank details report:", error);
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

        const textFilters = [uniqueCode, name, roleName, mobileNumber, bankName, accountNumber, ifscCode, accountType, upiId];
        const hasInvalidText = textFilters.some(filter => filter !== undefined && filter.length > 0 && filter.length < 3);

        if (hasInvalidText) return;

        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, fromDate, toDate, uniqueCode, name, roleName, mobileNumber, bankName, accountNumber, ifscCode, accountType, upiId]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);
        return (data || []).map(mapBankDetailsRow);
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Bank Details Report</h2>
                    <p className="text-gray-500 text-sm">User bank account details</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="Bank Details Report" />
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
                        <label className="text-sm font-medium text-gray-600">Unique Code</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={uniqueCode}
                            onChange={(e) => setUniqueCode(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Role Name</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
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
                        <label className="text-sm font-medium text-gray-600">Account Type</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
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

export default BankDetailsReport;
