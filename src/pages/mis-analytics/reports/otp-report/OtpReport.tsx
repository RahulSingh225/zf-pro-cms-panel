import React, { useState, useEffect } from "react";

import CustomTable, { Column } from "../../../../components/CustomTable";
import ExporterButton from "../../../../components/ExportButton";
import { formatOtpType, mapOtpRow } from "../../../../utils/reportExport";

// API
import { getAdminOtpReport, getRoles, getUserList } from "../../../../services/ApiService";

const OtpReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // OTP Filters
    const [isVerified, setIsVerified] = useState("");

    // User Filters
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");   // ⭐ NEW — User dropdown filter
    const [blockStatus, setBlockStatus] = useState("");

    // Dropdown data
    const [roleOptions, setRoleOptions] = useState<any[]>([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);

    // Address Filters
    const [currentCity, setCurrentCity] = useState("");
    const [currentDistrict, setCurrentDistrict] = useState("");
    const [currentPincode, setCurrentPincode] = useState("");
    const [currentState, setCurrentState] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [branchId, setBranchId] = useState("");

    // Search
    const [search, setSearch] = useState("");

    // Table Data
    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const formatCell = (value: any) => {
        if (!value && value !== 0) return "-";
        return value;
    };

    // =======================================
    //   TABLE COLUMNS
    // =======================================
    const columns: Column[] = [
        { key: "userCode", label: "User Unique Code" },
        { key: "otp", label: "OTP" },
        { key: "userName", label: "User Name" },
        { key: "userMobile", label: "Mobile" },
        { key: "userEmail", label: "Email" },
        { key: "otpType", label: "OTP Type", format: (value: any) => formatOtpType(value) },
        { key: "isVerified", label: "Verified" },
        { key: "expiryAt", label: "Expiry Time" },
        { key: "createdAt", label: "Created At" },
        { key: "currentCity", label: "City" },
        { key: "currentDistrict", label: "District" },
        { key: "currentState", label: "State" },
        { key: "zoneId", label: "Zone" },
        { key: "branchId", label: "Branch" },
    ];

    // =======================================
    //          FETCH OTP REPORT
    // =======================================
    const fetchReport = async () => {
        try {
            const params: any = {
                page,
                limit: pageSize,
            };

            // Dates
            if (fromDate) params.dateFrom = fromDate;
            if (toDate) params.dateTo = toDate;

            // OTP filter
            if (isVerified) params.isVerified = isVerified;

            // User filters
            if (userRole) params.userRole = userRole;
            if (userId) params.userId = userId;  // ⭐ Add user filter here
            if (blockStatus) params.blockStatus = blockStatus;

            // Address filters
            if (currentCity) params.currentCity = currentCity;
            if (currentDistrict) params.currentDistrict = currentDistrict;
            if (currentPincode) params.currentPincode = currentPincode;
            if (currentState) params.currentState = currentState;
            if (zoneId) params.zoneId = zoneId;
            if (branchId) params.branchId = branchId;

            // Search
            if (search.length >= 3) params.search = search;

            const res = await getAdminOtpReport(params);

            const mapped = res.data.data.map((item: any) => ({
                userCode: item.userCode,
                otpId: item.otpId,
                otp: item.otp,
                userId: item.userId,
                userName: item.userName,
                userMobile: item.userMobile,
                userEmail: item.userEmail,
                otpType: formatOtpType(item.otpType),
                isVerified: item.isVerified ? "Yes" : "No",
                expiryAt: formatCell(item.expiryAt),
                createdAt: formatCell(item.createdAt),

                currentCity: item.currentCity,
                currentDistrict: item.currentDistrict,
                currentState: item.currentState,
                zoneId: item.zoneId,
                branchId: item.branchId,
            }));

            setTableData(mapped);
            setTotalRows(res.data.total);

        } catch (err) {
            console.error("OTP REPORT ERROR:", err);
        }
    };

    // ======================================
    //  FETCH ROLES FOR DROPDOWN
    // ======================================
    const fetchRoles = async () => {
        try {
            const res = await getRoles();
            const raw = res.data.data || [];

            const mapped = raw.map((x: any) => ({
                label: x.roleName,
                value: x.roleId.toString(),
            }));

            setRoleOptions([{ label: "All", value: "" }, ...mapped]);
        } catch (err) {
            console.error("Failed to load roles", err);
        }
    };

    // ======================================
    //  FETCH USERS FOR USER DROPDOWN
    // ======================================
    const fetchUsers = async () => {
        try {
            const response = await getUserList({
                page: 1,
                limit: 500,
                role: [1, 2, 3], // You can adjust
            });

            const raw = response.data.data || [];

            const mapped = raw.map((u: any) => ({
                label: u.userName || u.displayName,
                value: u.userId.toString(),
            }));

            setUserOptions([{ label: "All", value: "" }, ...mapped]);
        } catch (err) {
            console.error("User list fetch failed:", err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    // Fetch OTPs when filters change
    useEffect(() => {
        fetchReport();
    }, [
        page,
        fromDate,
        toDate,
        isVerified,
        userRole,
        userId,
        blockStatus,
        currentCity,
        currentDistrict,
        currentPincode,
        currentState,
        zoneId,
        branchId,
    ]);

    // Debounced Search
    useEffect(() => {
        if (search.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (search.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 400);
            return () => clearTimeout(timeout);
        }
    }, [search]);

    // =======================================
    //        EXPORT ALL ROWS
    // =======================================
    const fileExporter = async () => {
        try {
            const res = await getAdminOtpReport({
                page: 1,
                limit: totalRows
            });

            return res.data.data.map(mapOtpRow);
        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full overflow-x-hidden">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">OTP Report</h2>
                    <p className="text-gray-500 text-sm">OTP activity and verification history</p>
                </div>

                <ExporterButton exporter={fileExporter} reportName="OTP Report" />
            </div>

            {/* FILTERS */}
            <div className="mt-6">
                <div className="flex bg-gray-50 p-4 rounded-lg flex-wrap gap-4">

                    <FilterDate label="From Date" value={fromDate} setValue={setFromDate} />
                    <FilterDate label="To Date" value={toDate} setValue={setToDate} />

                    <FilterDropdown
                        label="Is Verified"
                        value={isVerified}
                        setValue={setIsVerified}
                        options={[
                            { label: "All", value: "" },
                            { label: "Verified", value: "true" },
                            { label: "Not Verified", value: "false" },
                        ]}
                    />

                    {/* ⭐ ROLE DROPDOWN */}
                    <FilterDropdown
                        label="User Role"
                        value={userRole}
                        setValue={setUserRole}
                        options={roleOptions}
                    />

                    {/* ⭐ USER DROPDOWN */}
                    <FilterDropdown
                        label="User Name"
                        value={userId}
                        setValue={setUserId}
                        options={userOptions}
                    />

                    {/* Address Filters */}
                    <FilterSmallInput label="City" value={currentCity} setValue={setCurrentCity} />
                    <FilterSmallInput label="District" value={currentDistrict} setValue={setCurrentDistrict} />
                    <FilterSmallInput label="Pincode" value={currentPincode} setValue={setCurrentPincode} />
                    <FilterSmallInput label="State" value={currentState} setValue={setCurrentState} />
                    <FilterSmallInput label="Zone ID" value={zoneId} setValue={setZoneId} />
                    <FilterSmallInput label="Branch ID" value={branchId} setValue={setBranchId} />

                    <FilterSmallInput label="Search" value={search} setValue={setSearch} />
                </div>
            </div>

            {/* TABLE */}
            <div className="mt-6">
                <CustomTable
                    data={tableData}
                    columns={columns}
                    pageSize={pageSize}
                    totalRows={totalRows}
                    currentPage={page}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default OtpReport;

/* --------------------------
   Reusable Inputs
--------------------------- */

const FilterSmallInput = ({ label, value, setValue }: any) => (
    <div className="w-[200px]">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input
            type="text"
            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    </div>
);

const FilterDate = ({ label, value, setValue }: any) => (
    <div className="w-[200px]">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input
            type="date"
            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    </div>
);

const FilterDropdown = ({ label, value, setValue, options }: any) => (
    <div className="w-[200px]">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <select
            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm bg-white"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);
