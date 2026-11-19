import React, { useState, useEffect } from "react";
import CustomTable, { Column } from "../../../../components/CustomTable";
import { getApplicationLoginReport } from "../../../../services/ApiService";
import ExporterButton from "../../../../components/ExportButton";
import { mapApplicationLoginRow } from "../../../../utils/reportExport";

const ApplicationLoginReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [userName, setUserName] = useState("");
    const [userMobile, setUserMobile] = useState("");

    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const columns: Column[] = [
        { key: "userName", label: "User Name" },
        { key: "userCode", label: "User ID" },
        { key: "userMobile", label: "User Mobile" },
        { key: "firstLogin", label: "First Login Date & Time" },
        { key: "lastLogin", label: "Last Login Date & Time" },
        { key: "loginDevice", label: "Login Device" },
        { key: "logoutDate", label: "Logout Date & Time" },
        { key: "welcomePoints", label: "Welcome Points Earned" },
        { key: "totalScannedPoints", label: "Total Scanned Points" },
        { key: "totalRewardPoints", label: "Total Reward Points" },
        { key: "totalRedeemedPoints", label: "Total Redeemed Points" },
        { key: "totalBalancePoints", label: "Total Balance Points" }
    ];

    const fetchReport = async () => {
        try {
            const payload: any = {
                skip: (page - 1) * pageSize,
                limit: pageSize,
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (userName.length >= 3) payload.userName = userName;
            if (userMobile.length >= 3) payload.userMobile = userMobile;

            const res = await getApplicationLoginReport(payload);

            const mapped = res.data.data.reportList.map(mapApplicationLoginRow);

            setTableData(mapped);
            setTotalRows(res.data.data.totalCount);
        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [page, fromDate, toDate]);

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

            const res = await getApplicationLoginReport(payload);

            return res.data.data.reportList.map(mapApplicationLoginRow);
        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200 w-full overflow-x-hidden">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Application Login Report</h2>
                    <p className="text-gray-500 text-sm">Login activity overview</p>
                </div>

                <ExporterButton exporter={fileExporter} reportName="Application Login Report" />
            </div>

            <div className="mt-6">
                <div className="flex bg-gray-50 p-4 rounded-lg items-center gap-2">

                    <div className="w-[220px]">
                        <label htmlFor="fromDate" className="text-sm font-medium text-gray-600">From Date</label>
                        <input
                            id="fromDate"
                            type="date"
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
                        <label htmlFor="userMobile" className="text-sm font-medium text-gray-600">User Mobile</label>
                        <input
                            id="userMobile"
                            type="text"
                            placeholder="Enter mobile number"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={userMobile}
                            onChange={(e) => setUserMobile(e.target.value)}
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
                />
            </div>
        </div>
    );
};

export default ApplicationLoginReport;