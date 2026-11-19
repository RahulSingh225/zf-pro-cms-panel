import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
    getApplicationLoginReport,
    getregisteredUsersReport,
    getQrTransactionReport,
    getAdminreferralReport,
    getBankDetailsReport,
    getKycReport,
    getProductWiseReport,
    getCategoryReport,
    getErrorTransactionReport,
    getBlockedMemberReport,
    getBlockedMemberQrScanReport,
    getAnomalyTransactionsReport,
    getShockReplacementReport,
    getRedemptionHistory,
    getAdminOtpReport,
} from "../../services/ApiService";
import {
    ReportName,
    buildExportSheetRows,
    mapApplicationLoginRow,
    mapRegisteredUserRow,
    mapQrTransactionRow,
    mapRedemptionRow,
    mapReferralRow,
    mapOtpRow,
    mapBankDetailsRow,
    mapKycRow,
    mapProductWiseRow,
    mapCategoryRow,
    mapErrorTransactionRow,
    mapBlockedMemberRow,
    mapBlockedMemberScanRow,
    mapAnomalyTransactionRow,
    mapShockReplacementRow,
} from "../../utils/reportExport";

// Icons from react-icons
import {
    FiDownload,
    FiFilter,
    FiUserCheck,
    FiUsers,
    FiGrid,
    FiRepeat,
    FiShare2,
    FiKey,
    FiCreditCard,
    FiShield,
    FiPackage,
    FiLayers,
    FiAlertCircle,
    FiUserX,
    FiAlertTriangle,
    FiTool,
    FiX,
} from "react-icons/fi";

interface ExportCardConfig {
    id: string;
    // Same as the MIS & Analytics reportName — used for the card title, file name and sheet name
    title: ReportName;
    subtitle: string;
    icon: React.ReactNode;
    // Returns rows already mapped exactly like the MIS & Analytics export
    fetcher: (filters: any) => Promise<any[]>;
}

// Max rows fetched per report (MIS & Analytics uses the table's total count)
const EXPORT_LIMIT = 10000;

export const DataExport: React.FC = () => {
    // Filter State
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [zone, setZone] = useState("");
    const [status, setStatus] = useState("");

    const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
    const [isExportingFull, setIsExportingFull] = useState(false);

    const zonesList = ["West", "South", "North", "East", "Central"];

    // Build payload params based on active filters
    const getActiveFilterParams = () => {
        const payload: Record<string, any> = {};
        if (fromDate) payload.fromDate = new Date(fromDate).toISOString();
        if (toDate) {
            const toDateObj = new Date(toDate);
            toDateObj.setHours(23, 59, 59, 999);
            payload.toDate = toDateObj.toISOString();
        }
        if (zone) payload.zone = zone;
        if (status) payload.status = status;
        return payload;
    };

    const hasActiveFilters = !!(fromDate || toDate || zone || status);

    const clearFilters = () => {
        setFromDate("");
        setToDate("");
        setZone("");
        setStatus("");
    };

    // Report cards — names, API payloads and row mapping match MIS & Analytics
    const exportCards: ExportCardConfig[] = [
        {
            id: "application-login",
            title: "Application Login Report",
            subtitle: "User login activity, dates & devices",
            icon: <FiUserCheck />,
            fetcher: async (params) => {
                const res = await getApplicationLoginReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapApplicationLoginRow);
            },
        },
        {
            id: "registered-users",
            title: "Registered Users Report",
            subtitle: "Registered user profile details & status",
            icon: <FiUsers />,
            fetcher: async (params) => {
                const res = await getregisteredUsersReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapRegisteredUserRow);
            },
        },
        {
            id: "qr-transaction",
            title: "QR Transaction Report",
            subtitle: "QR scan transactions & point allocations",
            icon: <FiGrid />,
            fetcher: async (params) => {
                const res = await getQrTransactionReport({ skip: 0, limit: EXPORT_LIMIT, status: "Success", ...params });
                return (res?.data?.data?.reportList || []).map(mapQrTransactionRow);
            },
        },
        {
            id: "redemptions",
            title: "Redemption Report",
            subtitle: "Reward redemption requests & status",
            icon: <FiRepeat />,
            fetcher: async (params) => {
                const res = await getRedemptionHistory({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.reportList || res?.data?.data?.reportList || []).map(mapRedemptionRow);
            },
        },
        {
            id: "referrals",
            title: "Referrals Report",
            subtitle: "User referral invites & points earned",
            icon: <FiShare2 />,
            fetcher: async (params) => {
                const res = await getAdminreferralReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapReferralRow);
            },
        },
        {
            id: "otp",
            title: "OTP Report",
            subtitle: "OTP requests & verification logs",
            icon: <FiKey />,
            fetcher: async (params) => {
                const res = await getAdminOtpReport({ page: 1, limit: EXPORT_LIMIT, ...params });
                // OTP API returns a flat array at res.data.data (not .reportList)
                const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
                return raw.map(mapOtpRow);
            },
        },
        {
            id: "bank-details",
            title: "Bank Details Report",
            subtitle: "Bank account, IFSC & UPI details",
            icon: <FiCreditCard />,
            fetcher: async (params) => {
                const res = await getBankDetailsReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapBankDetailsRow);
            },
        },
        {
            id: "kyc",
            title: "KYC Report",
            subtitle: "User KYC verification status & details",
            icon: <FiShield />,
            fetcher: async (params) => {
                const res = await getKycReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapKycRow);
            },
        },
        {
            id: "product-wise",
            title: "Product Wise Report",
            subtitle: "Product scan count & points breakdown",
            icon: <FiPackage />,
            fetcher: async (params) => {
                const res = await getProductWiseReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapProductWiseRow);
            },
        },
        {
            id: "category",
            title: "Category Report",
            subtitle: "Category scan counts & bonus points",
            icon: <FiLayers />,
            fetcher: async (params) => {
                const res = await getCategoryReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapCategoryRow);
            },
        },
        {
            id: "error-transaction",
            title: "Error Transaction Report",
            subtitle: "Failed scan logs & error diagnostics",
            icon: <FiAlertCircle />,
            fetcher: async (params) => {
                const res = await getErrorTransactionReport({ skip: 0, limit: EXPORT_LIMIT, status: "Failure", ...params });
                return (res?.data?.data?.reportList || []).map(mapErrorTransactionRow);
            },
        },
        {
            id: "blocked-member",
            title: "Blocked Member Report",
            subtitle: "Blocked accounts & activity summary",
            icon: <FiUserX />,
            fetcher: async (params) => {
                const res = await getBlockedMemberReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapBlockedMemberRow);
            },
        },
        {
            id: "blocked-member-scan",
            title: "Blocked Member Scan Report",
            subtitle: "Scan attempts by blocked members",
            icon: <FiGrid />,
            fetcher: async (params) => {
                const res = await getBlockedMemberQrScanReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapBlockedMemberScanRow);
            },
        },
        {
            id: "anomaly-transactions",
            title: "Anomaly Transactions Report",
            subtitle: "Data quality anomalies for review",
            icon: <FiAlertTriangle />,
            fetcher: async (params) => {
                const res = await getAnomalyTransactionsReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapAnomalyTransactionRow);
            },
        },
        {
            id: "shock-replacement",
            title: "Shock Replacement Report",
            subtitle: "Shock absorber replacements & SKUs",
            icon: <FiTool />,
            fetcher: async (params) => {
                const res = await getShockReplacementReport({ skip: 0, limit: EXPORT_LIMIT, ...params });
                return (res?.data?.data?.reportList || []).map(mapShockReplacementRow);
            },
        },
    ];

    // Export single card to CSV or Excel — same rows, sheet name and file name as MIS & Analytics
    const handleExportCard = async (card: ExportCardConfig, format: "csv" | "excel") => {
        setLoadingCards((prev) => ({ ...prev, [card.id]: true }));
        try {
            const params = getActiveFilterParams();
            const data = await card.fetcher(params);
            if (!data || data.length === 0) {
                toast.warn(`No data found for ${card.title}`);
                return;
            }

            const rows = buildExportSheetRows(card.title, data) || [];
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            if (format === "csv") {
                XLSX.writeFile(workbook, `${card.title}.csv`, { bookType: "csv" });
            } else {
                XLSX.writeFile(workbook, `${card.title}.xlsx`, { bookType: "xlsx" });
            }
            toast.success(`${card.title} downloaded successfully (${format.toUpperCase()})`);
        } catch (error) {
            console.error(`Export error for ${card.title}:`, error);
            toast.error(`Failed to export ${card.title}`);
        } finally {
            setLoadingCards((prev) => ({ ...prev, [card.id]: false }));
        }
    };

    // Export Full Pack: one Excel workbook with a sheet per report (sheet named after the MIS report)
    const handleExportFullPack = async () => {
        setIsExportingFull(true);
        toast.info("Generating full export pack, please wait...");
        try {
            const params = getActiveFilterParams();
            const workbook = XLSX.utils.book_new();
            let addedSheets = 0;

            for (const card of exportCards) {
                try {
                    const data = await card.fetcher(params);
                    if (data && data.length > 0) {
                        const rows = buildExportSheetRows(card.title, data) || [];
                        const worksheet = XLSX.utils.json_to_sheet(rows);
                        XLSX.utils.book_append_sheet(workbook, worksheet, card.title.slice(0, 31));
                        addedSheets++;
                    }
                } catch (e) {
                    console.warn(`Could not include ${card.title} in full pack:`, e);
                }
            }

            if (addedSheets === 0) {
                toast.warn("No data available across reports for full pack");
                return;
            }

            XLSX.writeFile(workbook, `ZF ProPoints Full Data Export Pack.xlsx`, { bookType: "xlsx" });
            toast.success("Full data export pack downloaded successfully!");
        } catch (error) {
            console.error("Error generating full pack:", error);
            toast.error("Failed to generate full export pack");
        } finally {
            setIsExportingFull(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-6 max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Data Export</h1>
                </div>

                <button
                    onClick={handleExportFullPack}
                    disabled={isExportingFull}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-60 justify-center cursor-pointer"
                >
                    <FiDownload className="text-base" />
                    {isExportingFull ? "Generating full pack..." : "Export full pack"}
                </button>
            </div>

            {/* Filter Bar */}
            {/* <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <FiFilter className="text-sm" />
                        <span>Scope Filters</span>
                    </div>

                    <div className="w-[180px]">
                        <input
                            type="date"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From Date"
                        />
                    </div>

                    <div className="w-[180px]">
                        <input
                            type="date"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To Date"
                        />
                    </div>

                    <select
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-blue-500 cursor-pointer min-w-[130px]"
                    >
                        <option value="">All Zones</option>
                        {zonesList.map((z) => (
                            <option key={z} value={z}>{z}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1 cursor-pointer ml-auto"
                        >
                            <FiX className="text-xs" />
                            Clear Filters
                        </button>
                    )}
                </div>
            </div> */}


            {/* Grid of 15 Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {exportCards.map((card) => {
                    const isLoading = !!loadingCards[card.id];

                    return (
                        <div
                            key={card.id}
                            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                            {/* Card Header: Icon + Title + Subtitle */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                                    {card.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-semibold text-gray-800 truncate" title={card.title}>
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                        {card.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer: CSV & Excel Buttons */}
                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleExportCard(card, "csv")}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50/70 text-green-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                >
                                    <FiDownload className="text-xs text-green-600" />
                                    CSV
                                </button>

                                <button
                                    onClick={() => handleExportCard(card, "excel")}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50/70 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                >
                                    <FiDownload className="text-xs" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DataExport;
