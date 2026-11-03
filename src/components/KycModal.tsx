import React, { useState, useEffect, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { updateKycRecords, getUserKycsByUserId } from "../services/ApiService";
import { UserDetails } from "../types/User";
import { ROLES } from "../values/constants";

type KYCStatus = "Pending" | "Approved" | "Network-Approved" | "Rejected" | "Completed";

interface KycDocument {
    detailId: number;
    kycType: string;
    kycDoc: string;
    docStatus: KYCStatus;
    kycCreatedAt: string;
    kycUpdatedAt: string | null;
    comment: string | null;
    workshopName?: string;
}

interface KycModalProps {
    isOpen: boolean;
    onClose: () => void;
    mechanicName: string;
    mechanicId: string;
    kycDocuments: KycDocument[];
    preferredRetailerList?: {
        retailerId: number;
        mobile: string;
        name: string;
        pincode: number;
        workshopName?: string;
    }[];
    loggedUser: UserDetails
}

const KycModal: React.FC<KycModalProps> = ({ isOpen, onClose, mechanicName, mechanicId, kycDocuments, preferredRetailerList = [], loggedUser }) => {
    const [comments, setComments] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<Record<number, boolean>>({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [localKycDocuments, setLocalKycDocuments] = useState<KycDocument[]>(kycDocuments);
    const [localPreferred, setLocalPreferred] = useState<typeof preferredRetailerList>(preferredRetailerList);

    const fetchDocuments = useCallback(async () => {
        if (!mechanicId) return;
        try {
            const response = await getUserKycsByUserId(Number(mechanicId), 1, 1);
            if (response.data.success) {
                const data = response.data.data;
                setLocalKycDocuments(data?.kycDocuments || []);
                setLocalPreferred(data?.preferredRetailerList || []);
            }
        } catch (error) {
            console.error("Error fetching KYC documents:", error);
            toast.error("Failed to fetch KYC documents");
        }
    }, [mechanicId]);

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
            setComments({});
        }
    }, [isOpen, fetchDocuments]);

    if (!isOpen) return null;

    const handleCommentChange = (detailId: number, value: string) => {
        setComments(prev => ({
            ...prev,
            [detailId]: value
        }));
    };

    const handleStatusUpdate = async (detailId: number, status: "Approved" | "Rejected" | "Completed") => {
        setLoading(prev => ({ ...prev, [detailId]: true }));

        try {
            const updates = [
                {
                    detailId,
                    status,
                    ...(comments[detailId] && { comment: comments[detailId] })
                }
            ];

            await updateKycRecords(updates);

            // Show success message
            toast.success(`Document ${status == 'Completed' ? 'Approved' : status.toLowerCase()} successfully!`);

            // Clear comment for this detailId
            setComments(prev => {
                const newComments = { ...prev };
                delete newComments[detailId];
                return newComments;
            });

            // Refresh documents
            await fetchDocuments();
        } catch (error) {
            console.error("Error updating KYC record:", error);
            toast.error("Failed to update document status. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, [detailId]: false }));
        }
    };

    const getDocumentLabel = (kycType: string): string => {
        const labels: Record<string, string> = {
            "aadhaar-front": "Aadhaar Front",
            "aadhaar-back": "Aadhaar Back",
            "pan-front": "PAN Image",
            "pan-number": "PAN Number",
            "preferred-retailers": "Preferred Retailers",
            "user-profile": "Profile Picture",
            "profile-picture": "Profile Picture"
        };
        return labels[kycType] || kycType;
    };

    const getDocumentIcon = (kycType: string) => {
        if (kycType.includes("aadhaar")) {
            return <InsertDriveFileIcon className="text-blue-600" fontSize="small" />;
        } else if (kycType.includes("pan")) {
            return <InsertDriveFileIcon className="text-purple-600" fontSize="small" />;
        } else if (kycType.includes("profile")) {
            return <InsertDriveFileIcon className="text-indigo-600" fontSize="small" />;
        } else {
            return <InsertDriveFileIcon className="text-green-600" fontSize="small" />;
        }
    };

    const getStatusBadge = (status: KYCStatus) => {
        const statusStyles = {
            Pending: "bg-orange-100 text-orange-600",
            Approved: "bg-green-100 text-green-600",
            Completed: "bg-green-100 text-green-600",
            Rejected: "bg-red-100 text-red-600",
        };

        return (
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${statusStyles[status]}`}>
                {status === 'Completed' ? 'Approved' : status === 'Network-Approved' ? 'NT Approved' : status}
            </span>
        );
    };

    const renderDocumentDetails = (doc: KycDocument) => {
        if (doc.kycType === "pan-number") {
            return (
                <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono font-semibold text-gray-900">
                    {doc.kycDoc}
                </span>
            );
        } else if (doc.kycType === "preferred-retailers") {
            return (
                <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900">
                    {doc.kycDoc} Retailer(s)
                </span>
            );
        } else {
            return (
                <button
                    type="button"
                    className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition flex items-center gap-2"
                    onClick={() => {
                        // Open image modal with the provided URL (doc.kycDoc)
                        if (doc.kycDoc) {
                            setImageUrl(doc.kycDoc);
                            setImageModalOpen(true);
                        } else {
                            toast.error("Image URL not available");
                        }
                    }}
                >
                    <VisibilityIcon fontSize="small" />
                    View Image
                </button>
            );
        }
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setImageUrl(null);
    };

    // Exclude the preferred-retailers doc from the main documents table; it is handled separately below
    const nonPreferredDocs = localKycDocuments.filter(d => d.kycType !== "preferred-retailers");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Documents</h2>
                <p className="text-sm text-gray-600 mb-6">{mechanicName} (ID: {mechanicId})</p>

                {/* KYC Documents Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document Type</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th> */}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Comment</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {nonPreferredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No KYC documents found
                                    </td>
                                </tr>
                            ) : (
                                nonPreferredDocs.map((doc) => (
                                    <tr key={doc.detailId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getDocumentIcon(doc.kycType)}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {getDocumentLabel(doc.kycType)}
                                                </span>
                                            </div>
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            {getStatusBadge(doc.docStatus)}
                                        </td> */}
                                        <td className="px-6 py-4">
                                            {renderDocumentDetails(doc)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {doc.kycType === "user-profile" || doc.kycType === "profile-picture" ? (
                                                <span className="text-sm text-gray-400 font-medium">â€”</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Add comment"
                                                        value={comments[doc.detailId] || doc.comment || ""}
                                                        onChange={(e) => handleCommentChange(doc.detailId, e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        disabled={
                                                        (loggedUser?.userRoleId == ROLES.REGION_MANAGER && doc.docStatus !== "Pending") ||
                                                        (loggedUser?.userRoleId == ROLES.NETWORK_TEAM && doc.docStatus !== "Approved") ||
                                                        (loggedUser?.userRoleId == ROLES.MARKETING_MANAGER && doc.docStatus !== "Network-Approved")
                                                    }
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {doc.kycType === "user-profile" || doc.kycType === "profile-picture" ? (
                                                <span className="text-sm text-gray-400 font-medium">â€”</span>
                                            ) : (loggedUser?.userRoleId == ROLES.REGION_MANAGER && doc.docStatus === "Pending") ||
                                            (loggedUser?.userRoleId == ROLES.NETWORK_TEAM && doc.docStatus === "Approved") ||
                                            (loggedUser?.userRoleId == ROLES.MARKETING_MANAGER && doc.docStatus === "Network-Approved") ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const status = loggedUser?.userRoleId == ROLES.MARKETING_MANAGER
                                                                ? "Completed"
                                                                : loggedUser?.userRoleId == ROLES.NETWORK_TEAM
                                                                ? "Approved"  // backend maps Approved -> Network-Approved for NT
                                                                : "Approved";
                                                            handleStatusUpdate(doc.detailId, status as any);
                                                        }}
                                                        disabled={loading[doc.detailId]}
                                                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[doc.detailId] ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusUpdate(doc.detailId, "Rejected")}
                                                        disabled={loading[doc.detailId]}
                                                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[doc.detailId] ? "..." : "Reject"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">
                                                    {doc.docStatus === "Completed" ? "MM Approved" : doc.docStatus === "Network-Approved" ? "NT Approved" : doc.docStatus === "Approved" ? "RM Approved" : "Rejected"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mapped Retailers - show mapped retailers from API and provide a single approve/reject+comment control */}
                {localPreferred && localPreferred.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Mapped Workshop</h3>
                            {/* show status of preferred-retailers doc if present */}
                            {/* {(() => {
                                const prefDoc = localKycDocuments.find(d => d.kycType === "preferred-retailers");
                                return prefDoc ? getStatusBadge(prefDoc.docStatus) : null;
                            })()} */}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Workshop ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Workshop Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mobile</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pincode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {localPreferred.map((r) => (
                                        <tr key={r.retailerId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{r.retailerId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{r.workshopName || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{r.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{r.mobile}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{r.pincode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Single comment + actions for preferred-retailers doc */}
                        {(() => {
                            const prefDoc = localKycDocuments.find(d => d.kycType === "preferred-retailers");
                            if (!prefDoc) return null;

                            return (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Add comment"
                                                value={comments[prefDoc.detailId] || prefDoc.comment || ""}
                                                onChange={(e) => handleCommentChange(prefDoc.detailId, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                disabled={
                                                (loggedUser?.userRoleId == ROLES.REGION_MANAGER && prefDoc.docStatus !== "Pending") ||
                                                (loggedUser?.userRoleId == ROLES.NETWORK_TEAM && prefDoc.docStatus !== "Approved") ||
                                                (loggedUser?.userRoleId == ROLES.MARKETING_MANAGER && prefDoc.docStatus !== "Network-Approved")
                                            }
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            {(loggedUser?.userRoleId == ROLES.REGION_MANAGER && prefDoc.docStatus === "Pending") ||
                                            (loggedUser?.userRoleId == ROLES.NETWORK_TEAM && prefDoc.docStatus === "Approved") ||
                                            (loggedUser?.userRoleId == ROLES.MARKETING_MANAGER && prefDoc.docStatus === "Network-Approved") ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const status = loggedUser?.userRoleId == ROLES.MARKETING_MANAGER
                                                                ? "Completed"
                                                                : "Approved";
                                                            handleStatusUpdate(prefDoc.detailId, status as any);
                                                        }}
                                                        disabled={loading[prefDoc.detailId]}
                                                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[prefDoc.detailId] ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusUpdate(prefDoc.detailId, "Rejected")}
                                                        disabled={loading[prefDoc.detailId]}
                                                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading[prefDoc.detailId] ? "..." : "Reject"}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">{prefDoc.docStatus}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                        Close
                    </button>
                </div>
                {/* Image view modal */}
                {imageModalOpen && imageUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4 relative">
                            <button
                                type="button"
                                onClick={closeImageModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                aria-label="Close image modal"
                            >
                                <CloseIcon />
                            </button>
                            <div className="flex items-center justify-center">
                                <img src={imageUrl} alt="KYC Document" className="max-w-full max-h-[80vh] object-contain" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KycModal;
