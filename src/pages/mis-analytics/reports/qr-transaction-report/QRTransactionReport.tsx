import React, { useState, useEffect } from "react";

import CustomTable, { Column } from "../../../../components/CustomTable";
import { getQrTransactionReport } from "../../../../services/ApiService";
import ExporterButton from "../../../../components/ExportButton";

const QRTransactionReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [userName, setUserName] = useState("");
    const [userMobile, setUserMobile] = useState("");
    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const formatCell = (value: any) => {
        if (value === null || value === undefined || value === "") return "-";
        return value;
    };

    const columns: Column[] = [
        { key: "transactionId", label: "Transaction ID" },
        { key: "transactionDate", label: "Transaction Date" },
        { key: "amount", label: "Amount" },
        { key: "paymentStatus", label: "Payment Status" },
        { key: "qrCodeId", label: "QR Code ID" },
        { key: "partNumber", label: "Part Number" },
        { key: "partName", label: "Part Name" },
        { key: "userCode", label: "User ID" },
        { key: "userName", label: "User Name" },
        { key: "gender", label: "Gender" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "latitude", label: "Latitude" },
        { key: "longitude", label: "Longitude" },
        { key: "address", label: "Address" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "country", label: "Country" },
        { key: "workshopName", label: "Workshop Name" }
    ];

    const fetchReport = async () => {
        try {
            const payload: any = {
                skip: (page - 1) * pageSize,
                limit: pageSize,
                status: "Success"
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (userName.length >= 3) payload.userName = userName;
            if (userMobile.length >= 3) payload.userMobile = userMobile;

            const res = await getQrTransactionReport(payload);

            const mapped = res.data.data.reportList.map((item: any) => ({
                transactionId: formatCell(item.transactionId),
                transactionDate: formatCell(item.transactionDate),
                amount: formatCell(item.amount),
                paymentStatus: formatCell(item.paymentStatus),
                qrCodeId: formatCell(item.qrCodeId),
                partNumber: formatCell(item.partNumber),
                partName: formatCell(item.partName),
                userCode: formatCell(item.userCode),
                userName: formatCell(item.userName),
                gender: formatCell(item.gender),
                email: formatCell(item.email),
                phone: formatCell(item.phone),
                latitude: formatCell(item.latitude),
                longitude: formatCell(item.longitude),
                address: formatCell(item.address),
                city: formatCell(item.city),
                state: formatCell(item.state),
                country: formatCell(item.country),
                workshopName: formatCell(item.workshopName),
            }));

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
                status: "Success"
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (userName.length >= 3) payload.userName = userName;
            if (userMobile.length >= 3) payload.userMobile = userMobile;

            const res = await getQrTransactionReport(payload);

            const mapped = res.data.data.reportList.map((item: any) => ({
                transactionId: formatCell(item.transactionId),
                transactionDate: formatCell(item.transactionDate),
                amount: formatCell(item.amount),
                paymentStatus: formatCell(item.paymentStatus),
                qrCodeId: formatCell(item.qrCodeId),
                partNumber: formatCell(item.partNumber),
                partName: formatCell(item.partName),
                userCode: formatCell(item.userCode),
                userName: formatCell(item.userName),
                gender: formatCell(item.gender),
                email: formatCell(item.email),
                phone: formatCell(item.phone),
                latitude: formatCell(item.latitude),
                longitude: formatCell(item.longitude),
                address: formatCell(item.address),
                city: formatCell(item.city),
                state: formatCell(item.state),
                country: formatCell(item.country),
                workshopName: formatCell(item.workshopName),
            }));

            return mapped;
        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full overflow-x-hidden">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">QR Transaction Report</h2>
                    <p className="text-gray-500 text-sm">QR transactions overview</p>
                </div>

                <ExporterButton
                    exporter={fileExporter}
                    reportName="QR Transaction Report"
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
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <div className="w-[220px]">
                        <label htmlFor="userName" className="text-sm font-medium text-gray-600">
                            User Name
                        </label>
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
                        <label htmlFor="userMobile" className="text-sm font-medium text-gray-600">
                            User Mobile
                        </label>
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

export default QRTransactionReport;