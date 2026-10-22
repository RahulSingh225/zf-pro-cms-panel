import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { getKycReport } from "../../../../services/ApiService";
import { KycReportKeys } from "../../../../utils/ExportKeyMappings";
import ViewImageModal from "../../../../pages/tickets/components/ViewImageModal";

const KycReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const kycDocStatusParam = searchParams.get("kycDocStatus") || "";

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");
    const [name, setName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [emailId, setEmailId] = useState("");
    const [status, setStatus] = useState("");
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [zone, setZone] = useState("");
    const [kycDocStatus, setKycDocStatus] = useState(kycDocStatusParam);

    const [tableData, setTableData] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    // Sync state with URL search param
    useEffect(() => {
        setKycDocStatus(kycDocStatusParam);
    }, [kycDocStatusParam]);

    const handleKycDocStatusChange = (newStatus: string) => {
        setKycDocStatus(newStatus);
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (newStatus) {
                params.set("kycDocStatus", newStatus);
            } else {
                params.delete("kycDocStatus");
            }
            return params;
        });
        setPage(1); // Reset page on filter change
    };

    // View Image Modal States
    const [viewImageModalOpen, setViewImageModalOpen] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

    const handleViewImage = (url: string) => {
        setViewImageUrl(url);
        setViewImageModalOpen(true);
    };

    const formatCell = (value: any) => {
        if (value === null || value === undefined || value === "") return "-";
        return value;
    };

    const formatStatus = (value: any) => {
        if (value === "active_members") return "Active User";
        if (value === "digilocker") return "Digilocker Pending";
        if (value === "kyc") return "KYC Document Upload Pending";
        if (value === "incomplete-registration") return "Address and Profile";
        if (value === "tds-consent") return "TDS Consent Pending";
        if (value === "kyc-admin") return "Approval Pending";
        if (value === "kyc-regional-manager" || value === "Regional Manager Approval Pending" || value === "Regional Head Pending") return "Regional Head Pending";
        if (value === "kyc-marketing-manager" || value === "Marketing Manager Approval Pending" || value === "Marketing Head Pending") return "Marketing Head Pending";
        return formatCell(value);
    };

    // Validates and formats a DOB value; returns '-' for invalid or implausible dates
    const formatDob = (value: any): string => {
        if (!value || value === '-' || value === 'N/A') return '-';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '-';
        const year = d.getFullYear();
        // Reject clearly invalid years (before 1900 or in the future)
        if (year < 1900 || year > new Date().getFullYear()) return '-';
        // DD-MM-YYYY format — avoids Excel auto-parsing as a date serial
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${year}`;
    };

    // Formats the KYC doc status to a human-readable title-cased string
    const formatKycDocStatus = (value: any): string => {
        if (!value || value === '-') return '-';
        // Already well-formatted values from DB (e.g. "Approved By Market Head")
        return String(value)
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    };

    const columns: Column[] = [
        { key: "userId", label: "User ID" },
        { key: "uniqueCode", label: "Unique Code" },
        { key: "name", label: "Name" },
        { key: "roleName", label: "Role Name" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "workshopName", label: "Workshop Name" },
        { key: "zone", label: "Zone" },
        // { key: "workshopAddress", label: "Workshop Address" },
        { key: "emailId", label: "Email ID" },
        { key: "status", label: "Status" },
        { key: "kycVerified", label: "KYC Verified" },
        // { key: "dateOfBirth", label: "Date of Birth", format: (value: any) => formatDob(value) },
        { key: "dateOfBirth", label: "Date of Birth", format: (value: any) => value ? new Date(value).toISOString().split('T')[0] : 'N/A' },
        // { key: "dateOfBirth", label: "Date of Birth", format: (value: any) => formatDob(value) },
        {
            key: "createdAt",
            label: "Created At",
            format: (value: any) => {
                if (!value) return 'N/A';
                const d = new Date(value);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
        },
        { key: "aadhaarNumber", label: "Aadhaar Number" },
        {
            key: "aadhaarFrontImage",
            label: "Aadhaar Front Image",
            render: (row: any) => (
                (row.aadhaarFrontImage || row.aadhaarFront) ? (
                    <button
                        onClick={() => handleViewImage(row.aadhaarFrontImage || row.aadhaarFront)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-transparent border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        View Image
                    </button>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )
            )
        },
        {
            key: "aadhaarBackImage",
            label: "Aadhaar Back Image",
            render: (row: any) => (
                (row.aadhaarBackImage || row.aadhaarBack) ? (
                    <button
                        onClick={() => handleViewImage(row.aadhaarBackImage || row.aadhaarBack)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-transparent border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        View Image
                    </button>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )
            )
        },
        {
            key: "panFrontImage",
            label: "PAN Front Image",
            render: (row: any) => (
                (row.panFrontImage || row.panFront) ? (
                    <button
                        onClick={() => handleViewImage(row.panFrontImage || row.panFront)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-transparent border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        View Image
                    </button>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )
            )
        },
        {
            key: "profileImage",
            label: "Profile Image",
            render: (row: any) => (
                row.profileImage ? (
                    <button
                        onClick={() => handleViewImage(row.profileImage)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-transparent border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        View Image
                    </button>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )
            )
        },
        { key: "kycDocStatus", label: "KYC Doc Status", format: (value: any) => formatKycDocStatus(value) }
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
            if (emailId) payload.emailId = emailId;
            if (status) payload.status = status;
            if (aadhaarNumber) payload.aadhaarNumber = aadhaarNumber;
            if (kycDocStatus) payload.kycDocStatus = kycDocStatus;
            if (zone) payload.zone = zone;

            const response = await getKycReport(payload);

            if (response?.data?.code === 200) {
                if (isExport) {
                    return response?.data?.data?.reportList || [];
                } else {
                    const mapped = (response?.data?.data?.reportList || []).map((item: any) => {
                        const row: any = {};
                        Object.keys(item).forEach(k => {
                            if (k === "status") {
                                row[k] = formatStatus(item[k]);
                            } else {
                                row[k] = formatCell(item[k]);
                            }
                        });
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
            console.error("Error fetching KYC report:", error);
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

        const textFilters = [uniqueCode, name, roleName, mobileNumber, emailId, aadhaarNumber];
        const hasInvalidText = textFilters.some(filter => filter !== undefined && filter.length > 0 && filter.length < 3);

        if (hasInvalidText) return;

        const timeout = setTimeout(() => {
            fetchTableData(page);
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, fromDate, toDate, uniqueCode, name, roleName, mobileNumber, emailId, status, aadhaarNumber, kycDocStatus, zone]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        const data = await fetchTableData(1, true);

        const formatExportDate = (val: any) => {
            if (!val) return "-";
            const d = new Date(val);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        const exportData = data.map((item: any) => ({
            userId: formatCell(item.userId),
            uniqueCode: formatCell(item.uniqueCode),
            name: formatCell(item.name),
            workshopName: formatCell(item.workshopName),
            zone: formatCell(item.zone),
            roleName: formatCell(item.roleName),
            mobileNumber: formatCell(item.mobileNumber),
            emailId: formatCell(item.emailId),
            status: formatStatus(item.status),
            kycVerified: formatCell(item.kycVerified),
            dob: formatDob(item.dateOfBirth ?? item.dob),
            createdAt: formatExportDate(item.createdAt),
            aadhaarNumber: formatCell(item.aadhaarNumber),
            aadhaarFront: formatCell(item.aadhaarFrontImage ?? item.aadhaarFront),
            aadhaarBack: formatCell(item.aadhaarBackImage ?? item.aadhaarBack),
            panFront: formatCell(item.panFrontImage ?? item.panFront),
            profileImage: formatCell(item.profileImage),
            kycDocStatus: formatKycDocStatus(item.kycDocStatus),
        }));

        return exportData;
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">KYC Report</h2>
                    <p className="text-gray-500 text-sm">User KYC status and details</p>
                </div>
                <ExporterButton exporter={fileExporter} reportName="KYC Report" />
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
                        <label className="text-sm font-medium text-gray-600">Email ID</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={emailId}
                            onChange={(e) => setEmailId(e.target.value)}
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
                            <option value="active_members">Active User</option>
                            <option value="digilocker">Digilocker pending</option>
                            <option value="kyc">KYC document upload pending</option>
                            <option value="incomplete-registration">Address and profile</option>
                            <option value="Regional Head Pending">Regional Head Pending</option>
                            <option value="Marketing Head Pending">Marketing Head Pending</option>
                            <option value="tds-consent">TDS consent is pending</option>
                        </select>
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Aadhaar Number</label>
                        <input
                            type="text"
                            placeholder="Enter 3 characters"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">KYC Doc Status</label>
                        <select
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={kycDocStatus}
                            onChange={(e) => handleKycDocStatusChange(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="Approved By Market Head">Approved By Market Head</option>
                            <option value="Approved By Regional Head">Approved By Regional Head</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Zone</label>
                        <select
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="West">West</option>
                            <option value="South">South</option>
                            <option value="North">North</option>
                            <option value="East">East</option>
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

            {/* View Image Modal */}
            <ViewImageModal
                isOpen={viewImageModalOpen}
                onClose={() => setViewImageModalOpen(false)}
                imageUrl={viewImageUrl}
            />
        </div>
    );
};

export default KycReport;
