import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import CustomTable, { Column } from "../../../../components/CustomTable";
import { getregisteredUsersReport } from "../../../../services/ApiService";
import ExporterButton from "../../../../components/ExportButton";
import { formatDoj, mapRegisteredUserRow } from "../../../../utils/reportExport";

const RegisteredUsersReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = searchParams.get("status") || "";

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [userName, setUserName] = useState("");
    const [userMobile, setUserMobile] = useState("");
    const [status, setStatus] = useState(statusParam);
    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Sync state with URL search param
    useEffect(() => {
        setStatus(statusParam);
    }, [statusParam]);

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (newStatus) {
                params.set("status", newStatus);
            } else {
                params.delete("status");
            }
            return params;
        });
        setPage(1); // Reset page on filter change
    };

    const columns: Column[] = [
        // { key: "userId", label: "User ID" },
        { key: "uniqueCode", label: "Unique Code" },
        { key: "roleName", label: "Role Name" },
        { key: "status", label: "Status" },
        { key: "email", label: "Email" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "fullName", label: "Full Name" },
        { key: "aadhaarMasked", label: "Aadhaar Number (masking)" },
        { key: "panNumber", label: "PAN Number" },
        { key: "aadhaarStatus", label: "Aadhaar Status" },
        { key: "gender", label: "Gender" },
        { key: "age", label: "Age" },
        { key: "country", label: "Country" },
        { key: "state", label: "State" },
        { key: "city", label: "City" },
        { key: "pincode", label: "Pincode" },
        { key: "zone", label: "Zone" },
        { key: "mappedRetailers", label: "Mapped Retailers" },
        { key: "workshopName", label: "Workshop Name" },
        {
            key: "dateOfJoining",
            label: "Date of Joining",
            format: (value: any) => formatDoj(value)
        }
    ];

    const fetchReport = async () => {
        try {
            const payload: any = {
                limit: pageSize,
                skip: (page - 1) * pageSize
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (userName.length >= 3) payload.userName = userName;
            if (userMobile.length >= 3) payload.userMobile = userMobile;
            if (status) payload.status = status;

            const res = await getregisteredUsersReport(payload);

            const mapped = res.data.data.reportList.map(mapRegisteredUserRow);

            setTableData(mapped);
            setTotalRows(res.data.data.totalCount);

        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    // Fetch on page/date change/status change
    useEffect(() => {
        fetchReport();
    }, [page, fromDate, toDate, status]);

    // userName typing
    useEffect(() => {
        if (userName.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (userName.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [userName]);

    // userMobile typing
    useEffect(() => {
        if (userMobile.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (userMobile.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [userMobile]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const fileExporter = async () => {
        try {
            const payload: any = {
                skip: 0,
                limit: totalRows,
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (userName.length >= 3) payload.userName = userName;
            if (userMobile.length >= 3) payload.userMobile = userMobile;
            if (status) payload.status = status;

            const res = await getregisteredUsersReport(payload);

            return res.data.data.reportList.map(mapRegisteredUserRow);

        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full overflow-x-hidden">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Registered Users Report</h2>
                    <p className="text-gray-500 text-sm">List of registered users</p>
                </div>

                <ExporterButton
                    exporter={fileExporter}
                    reportName="Registered Users Report"
                />
            </div>

            <div className="mt-6">

                <div className="flex bg-gray-50 p-4 rounded-lg flex-wrap items-end gap-4">

                    <div className="w-[220px]">
                        <label htmlFor="fromDate" className="text-sm font-medium text-gray-600">From Date</label>
                        <input
                            id="fromDate"
                            type="date"
                            title="Select from date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="toDate" className="text-sm font-medium text-gray-600">To Date</label>
                        <input
                            id="toDate"
                            type="date"
                            title="Select to date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="userName" className="text-sm font-medium text-gray-600">User Name</label>
                        <input
                            id="userName"
                            type="text"
                            placeholder="Enter user name"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="userMobile" className="text-sm font-medium text-gray-600">Mobile Number</label>
                        <input
                            id="userMobile"
                            type="text"
                            placeholder="Enter mobile number"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userMobile}
                            onChange={(e) => setUserMobile(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="status" className="text-sm font-medium text-gray-600">Status</label>
                        <select
                            id="status"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="active_members">Active User</option>
                            <option value="digilocker">Digilocker pending</option>
                            <option value="kyc">KYC document upload pending</option>
                            <option value="incomplete-profile">Address and profile</option>
                            <option value="kyc-admin">Admin Approval Pending</option>
                            <option value="tds-consent">TDS consent is pending</option>
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
                />
            </div>

        </div>
    );
};

export default RegisteredUsersReport;