import React, { useState, useEffect } from "react";

import CustomTable, { Column } from "../../../../components/CustomTable";
import { getRedemptionHistory, getDeliveryStatuses, updateDeliveryStatus } from "../../../../services/ApiService";
import ExporterButton from "../../../../components/ExportButton";
import { mapRedemptionRow } from "../../../../utils/reportExport";
import ViewImageModal from "../../../tickets/components/ViewImageModal";
import { toast } from "react-toastify";

const RedemptionReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("");
    const [redemptionRef, setRedemptionRef] = useState("");

    const [tableData, setTableData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Update Status Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedRedemption, setSelectedRedemption] = useState<any>(null);
    const [deliveryStatuses, setDeliveryStatuses] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image View Modal State
    const [viewImageModalOpen, setViewImageModalOpen] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    const columns: Column[] = [
        { key: "redemptionRef", label: "Redemption ID" },
        { key: "userName", label: "User Full Name" },
        { key: "userCode", label: "User Unique Code" },
        { key: "redeemedPoints", label: "Redeemed Points" },
        { key: "redemptionMode", label: "Redemption Mode" },
        {
            key: "redemptionStatus",
            label: "Status",
            render: (row: any) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${row.statusColor}`}
                >
                    {row.redemptionStatus}
                </span>
            )
        },
        { key: "userMobile", label: "User Mobile Number" },
        { key: "userRole", label: "User Type" },
        { key: "dateOfJoining", label: "Date of Joining" },
        { key: "totalEarnedPoints", label: "Total Earned Points" },
        { key: "createdAt", label: "Redemption Request Date" },
        { key: "redemptionProcessedDate", label: "Redemption Processed Date" },
        { key: "redemptionDetails", label: "Redemption Details" },
        {
            key: "actions",
            label: "Actions",
            render: (row: any) => {
                if (row.redemptionMode !== "Market Products") {
                    return null;
                }
                return (
                    <div className="relative">
                        <button
                            onClick={() => setActiveMenuId(activeMenuId === row.redemptionId ? null : row.redemptionId)}
                            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {activeMenuId === row.redemptionId && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-50 py-1">
                                <button
                                    onClick={() => {
                                        handleOpenUpdateModal(row);
                                        setActiveMenuId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <i className="fas fa-edit mr-2 text-blue-500"></i> Update Status
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
        }
    ];

    const getStatusColor = (value: string) => {
        if (value === "APPROVED") return "bg-green-100 text-green-600";
        if (value === "PENDING") return "bg-yellow-100 text-yellow-600";
        if (value === "REJECTED") return "bg-red-100 text-red-600";
        return "";
    };

    const fetchReport = async () => {
        try {
            const payload: any = {
                limit: pageSize,
                skip: (page - 1) * pageSize
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (status) payload.status = [status];
            if (redemptionRef.length >= 3) payload.redemptionRef = [redemptionRef];

            const res = await getRedemptionHistory(payload);

            const mapped = res.data.reportList.map((item: any) => ({
                ...mapRedemptionRow(item),
                statusColor: getStatusColor(item.redemptionStatus),
            }));

            setTableData(mapped);
            setTotalRows(res.data.totalCount);

        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [page, fromDate, toDate, status]);

    useEffect(() => {
        if (redemptionRef.length === 0) {
            setPage(1);
            fetchReport();
            return;
        }
        if (redemptionRef.length >= 3) {
            const timeout = setTimeout(() => {
                setPage(1);
                fetchReport();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [redemptionRef]);

    const onPageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleOpenUpdateModal = async (redemption: any) => {
        setSelectedRedemption(redemption);
        setSelectedStatus(redemption.redemptionStatus); // Set initial status
        setIsUpdateModalOpen(true);
        setActiveMenuId(null);

        // Fetch statuses if not already fetched
        if (deliveryStatuses.length === 0) {
            try {
                const statuses = await getDeliveryStatuses();
                if (statuses && Array.isArray(statuses.data)) {
                    setDeliveryStatuses(statuses.data);
                }
            } catch (error) {
                console.error("Failed to fetch delivery statuses", error);
                toast.error("Failed to load delivery statuses");
            }
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedRedemption || !selectedStatus) return;

        setIsSubmitting(true);
        try {
            await updateDeliveryStatus({
                status: selectedStatus,
                redemptionId: selectedRedemption.redemptionId
            });
            toast.success("Redemption status updated successfully");
            setIsUpdateModalOpen(false);
            fetchReport(); // Refresh data
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fileExporter = async () => {
        try {
            const payload: any = {
                skip: 0,
                limit: totalRows,
            };

            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;
            if (status) payload.status = [status];
            if (redemptionRef.length >= 3) payload.redemptionRef = [redemptionRef];

            const res = await getRedemptionHistory(payload);

            return res.data.reportList.map(mapRedemptionRow);
        } catch (err) {
            console.error("EXPORT ERROR:", err);
            return [];
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 w-full overflow-x-hidden">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Redemption Report</h2>
                    <p className="text-gray-500 text-sm">View all redemption activity details</p>
                </div>

                <ExporterButton
                    exporter={fileExporter}
                    reportName="Redemption Report"
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

                    <div className="w-[200px]">
                        <label htmlFor="statusSelect" className="text-sm font-medium text-gray-600">
                            Status
                        </label>
                        <select
                            id="statusSelect"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>

                    <div className="w-[240px]">
                        <label htmlFor="redemptionRefInput" className="text-sm font-medium text-gray-600">
                            Redemption Ref
                        </label>
                        <input
                            id="redemptionRefInput"
                            type="text"
                            placeholder="Enter Reference ID"
                            className="w-full px-2 py-1.5 mt-1 border rounded-md text-sm"
                            value={redemptionRef}
                            onChange={(e) => setRedemptionRef(e.target.value)}
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

            {/* Update Status Modal */}
            {isUpdateModalOpen && selectedRedemption && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Update Delivery Status</h3>
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Products List</h4>
                            <div className="space-y-3">
                                {selectedRedemption.products && selectedRedemption.products.length > 0 ? (
                                    selectedRedemption.products.map((product: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="relative group">
                                                <img
                                                    src={product.image || "https://placehold.co/100x100?text=No+Image"}
                                                    alt={product.productName}
                                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image"; }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        setViewImageUrl(product.image);
                                                        setViewImageModalOpen(true);
                                                    }}
                                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 rounded-md"
                                                >
                                                    <i className="fas fa-eye text-white drop-shadow-md"></i>
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{product.productName}</p>
                                                <p className="text-xs text-gray-500 mt-1">Product ID: {product.productId}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    product.deliveryStatus === 'Shipping' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {product.deliveryStatus || "Pending"}
                                                </span>
                                                <p className="text-sm font-medium text-gray-900 mt-1">₹{product.value}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                        No products found for this redemption.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Update Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    {deliveryStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting || !selectedStatus}
                            >
                                {isSubmitting && <i className="fas fa-circle-notch fa-spin mr-2"></i>}
                                {isSubmitting ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Image Modal */}
            <ViewImageModal
                isOpen={viewImageModalOpen}
                onClose={() => setViewImageModalOpen(false)}
                imageUrl={viewImageUrl || ""}
                title="Product Image"
            />

        </div>
    );
};

export default RedemptionReport;