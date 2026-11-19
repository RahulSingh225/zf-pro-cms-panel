import React, { useState, useEffect } from "react";

import CustomTable, { Column } from "../../../../components/CustomTable";
import { getAdminreferralReport } from "../../../../services/ApiService";
import ExporterButton from "../../../../components/ExportButton";
import { mapReferralRow } from "../../../../utils/reportExport";

const ReferralsReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [referralCode, setReferralCode] = useState("");
    const [receiverMobileNumber, setReceiverMobileNumber] = useState("");

    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const columns: Column[] = [
        { key: "senderUniqueCode", label: "Sender Unique Code" },
        { key: "senderMobileNumber", label: "Sender Mobile Number" },
        { key: "senderName", label: "Sender Name" },
        { key: "receiverUniqueCode", label: "Receiver Unique Code" },
        { key: "receiverMobileNumber", label: "Receiver Mobile Number" },
        { key: "receiverName", label: "Receiver Name" },
        { key: "referralCode", label: "Referral Code" },
        { key: "pointsEarnedBySender", label: "Points Earned by Sender" },
        { key: "pointsEarnedByReceiver", label: "Points Earned by Receiver" },
        { key: "dateOfReferral", label: "Date of Referral" }
    ];

    const fetchReport = async () => {
        try {
            const payload: any = {
                limit: pageSize,
                skip: (page - 1) * pageSize
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (referralCode.length >= 3) payload.referralCode = referralCode;
            if (receiverMobileNumber.length >= 3) payload.receiverMobileNumber = receiverMobileNumber;

            const res = await getAdminreferralReport(payload);

            const mapped = res.data.data.reportList.map(mapReferralRow);

            setTableData(mapped);
            setTotalRows(res.data.data.totalCount);

        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    // Fetch on page and date change
    useEffect(() => {
        fetchReport();
    }, [page, fromDate, toDate]);

    // referralCode typing behavior
    useEffect(() => {
        if (referralCode.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (referralCode.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [referralCode]);

    // receiverMobileNumber typing behavior
    useEffect(() => {
        if (receiverMobileNumber.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (receiverMobileNumber.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [receiverMobileNumber]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    // EXPORT FUNCTION
    const fileExporter = async () => {
        try {
            const payload: any = {
                skip: 0,
                limit: totalRows,
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (referralCode.length >= 3) payload.referralCode = referralCode;
            if (receiverMobileNumber.length >= 3) payload.receiverMobileNumber = receiverMobileNumber;

            const res = await getAdminreferralReport(payload);

            return res.data.data.reportList.map(mapReferralRow);

        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full overflow-x-hidden">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Referrals Report</h2>
                    <p className="text-gray-500 text-sm">Referral activity overview</p>
                </div>

                <ExporterButton
                    exporter={fileExporter}
                    reportName="Referrals Report"
                />
            </div>

            <div className="mt-6">
                <div className="flex bg-gray-50 p-4 rounded-lg items-center gap-2">

                    <div className="w-[220px]">
                        <label htmlFor="fromDate" className="text-sm font-medium text-gray-600">
                            From Date
                        </label>
                        <input
                            id="fromDate"
                            type="date"
                            title="Select start date"
                            aria-label="From Date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="toDate" className="text-sm font-medium text-gray-600">
                            To Date
                        </label>
                        <input
                            id="toDate"
                            type="date"
                            title="Select end date"
                            aria-label="To Date"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Referral Code</label>
                        <input
                            type="text"
                            placeholder="Enter referral code"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label className="text-sm font-medium text-gray-600">Receiver Mobile</label>
                        <input
                            type="text"
                            placeholder="Enter mobile"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={receiverMobileNumber}
                            onChange={(e) => setReceiverMobileNumber(e.target.value)}
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

export default ReferralsReport;