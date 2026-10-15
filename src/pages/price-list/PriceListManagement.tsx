import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Switch,
    FormControlLabel,
    Chip,
    CircularProgress,
    Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import CustomTable, { Column } from "../../components/CustomTable";
import TopBar from "../../layouts/top-bar";
import {
    getAllPriceLists,
    addPriceList,
    editPriceList,
    deletePriceList
} from "../../services/ApiService";

export interface PriceListItem {
    priceListId: number;
    title: string | null;
    description: string | null;
    pricelistFile: string;
    fileUrl?: string;
    isActive: boolean;
    createdAt: string;
    createdBy?: number;
    createdByUserRole?: string;
    updatedAt?: string;
    updatedBy?: number;
    updatedByUserRole?: string;
}

const PriceListManagement: React.FC = () => {
    const [priceLists, setPriceLists] = useState<PriceListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Modal state for Add/Edit
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PriceListItem | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPriceLists = useCallback(async (currentPage = page, searchQuery = search) => {
        try {
            setLoading(true);
            const res = await getAllPriceLists(currentPage, pageSize, searchQuery);
            if (res?.data?.data) {
                setPriceLists(res.data.data);
                setTotalRows(res.data.pagination?.total || res.data.data.length);
            } else if (Array.isArray(res?.data)) {
                setPriceLists(res.data);
                setTotalRows(res.data.length);
            }
        } catch (error: any) {
            console.error("Error fetching price lists:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch price lists");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);

    useEffect(() => {
        fetchPriceLists(page, search);
    }, [fetchPriceLists, page, search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handleOpenAdd = () => {
        setIsEditMode(false);
        setSelectedItem(null);
        setTitle("");
        setDescription("");
        setIsActive(true);
        setFile(null);
        setFileError(null);
        setOpenModal(true);
    };

    const handleOpenEdit = (item: PriceListItem) => {
        setIsEditMode(true);
        setSelectedItem(item);
        setTitle(item.title || "");
        setDescription(item.description || "");
        setIsActive(item.isActive);
        setFile(null);
        setFileError(null);
        setOpenModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (!selected.name.toLowerCase().endsWith(".pdf") && selected.type !== "application/pdf") {
                setFileError("Only PDF files (.pdf) are allowed.");
                setFile(null);
                return;
            }
            if (selected.size > 50 * 1024 * 1024) {
                setFileError("File size exceeds 50MB limit.");
                setFile(null);
                return;
            }
            setFileError(null);
            setFile(selected);
            if (!title) {
                setTitle(selected.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditMode && !file) {
            setFileError("Please select a PDF file to upload.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            if (title.trim()) formData.append("title", title.trim());
            if (description.trim()) formData.append("description", description.trim());
            formData.append("isActive", String(isActive));
            if (file) {
                formData.append("file", file);
            }

            if (isEditMode && selectedItem) {
                await editPriceList(selectedItem.priceListId, formData);
                toast.success("Price list updated successfully");
            } else {
                await addPriceList(formData);
                toast.success("Price list created successfully");
            }

            setOpenModal(false);
            fetchPriceLists();
        } catch (err: any) {
            console.error("Save price list error:", err);
            toast.error(err?.response?.data?.message || "Failed to save price list");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item: PriceListItem) => {
        try {
            const formData = new FormData();
            formData.append("isActive", String(!item.isActive));
            await editPriceList(item.priceListId, formData);
            toast.success(`Price list marked as ${!item.isActive ? "Active" : "Inactive"}`);
            fetchPriceLists();
        } catch (err: any) {
            console.error("Status toggle error:", err);
            toast.error(err?.response?.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async (item: PriceListItem) => {
        if (!window.confirm(`Are you sure you want to deactivate and remove "${item.title || item.pricelistFile}"?`)) {
            return;
        }

        try {
            await deletePriceList(item.priceListId);
            toast.success("Price list removed successfully");
            fetchPriceLists();
        } catch (err: any) {
            console.error("Delete price list error:", err);
            toast.error(err?.response?.data?.message || "Failed to remove price list");
        }
    };

    const columns: Column[] = [
        {
            key: "priceListId",
            label: "ID",
            render: (item: PriceListItem) => (
                <span className="font-mono text-xs text-gray-500 font-semibold">#{item.priceListId}</span>
            )
        },
        {
            key: "title",
            label: "Document Details",
            render: (item: PriceListItem) => (
                <div className="max-w-xs">
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                        <PictureAsPdfIcon fontSize="small" className="text-red-500" />
                        <span>{item.title || "Untitled Document"}</span>
                    </div>
                    {item.description ? (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                    ) : null}
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                        File: {item.pricelistFile}
                    </div>
                </div>
            )
        },
        {
            key: "fileUrl",
            label: "PDF File",
            render: (item: PriceListItem) => (
                <div>
                    {item.fileUrl ? (
                        <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition"
                        >
                            <OpenInNewIcon fontSize="inherit" />
                            <span>View / Download</span>
                        </a>
                    ) : (
                        <span className="text-xs text-gray-400 italic">No URL available</span>
                    )}
                </div>
            )
        },
        {
            key: "isActive",
            label: "Status",
            render: (item: PriceListItem) => (
                <div className="flex items-center gap-2">
                    <Chip
                        label={item.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={item.isActive ? "success" : "default"}
                        variant={item.isActive ? "filled" : "outlined"}
                    />
                    <Tooltip title={item.isActive ? "Deactivate" : "Activate"}>
                        <Switch
                            size="small"
                            checked={item.isActive}
                            onChange={() => handleToggleStatus(item)}
                            color="success"
                        />
                    </Tooltip>
                </div>
            )
        },
        {
            key: "createdByUserRole",
            label: "Created By",
            render: (item: PriceListItem) => (
                <div className="text-xs">
                    <span className="font-medium text-gray-800 capitalize">
                        {item.createdByUserRole ? item.createdByUserRole.replace("_", " ") : "Evolve Admin"}
                    </span>
                    {item.createdBy ? (
                        <span className="block text-[11px] text-gray-400">User ID: #{item.createdBy}</span>
                    ) : null}
                </div>
            )
        },
        {
            key: "createdAt",
            label: "Created Date",
            render: (item: PriceListItem) => (
                <div className="text-xs text-gray-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "-"}
                </div>
            )
        },
        {
            key: "updatedAt",
            label: "Last Updated",
            render: (item: PriceListItem) => (
                <div className="text-xs text-gray-600">
                    {item.updatedAt ? (
                        <div>
                            <span>{new Date(item.updatedAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}</span>
                            {item.updatedByUserRole && (
                                <span className="block text-[11px] text-gray-400 capitalize">
                                    By: {item.updatedByUserRole.replace("_", " ")}
                                </span>
                            )}
                        </div>
                    ) : "-"}
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (item: PriceListItem) => (
                <div className="flex items-center gap-1">
                    <Tooltip title="Edit Price List">
                        <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                            className="text-blue-600 hover:bg-blue-50"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete / Deactivate">
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }
    ];

    const activeCount = priceLists.filter(p => p.isActive).length;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <TopBar title="Price List Management" />

            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                {/* Header & Metric Cards */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Price List & Catalogues</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage PDF price lists stored in S3 (<code className="bg-gray-100 px-1 py-0.5 rounded text-xs">price-list-pdfs</code>).
                            Changes sync live with the ZF Mobile App.
                        </p>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAdd}
                            className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm normal-case"
                        >
                            Add Price List PDF
                        </Button>
                    </div>
                </div>

                {/* Metric Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Documents</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{totalRows}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <PictureAsPdfIcon fontSize="small" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active in Mobile App</span>
                            <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold">
                            ✓
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Access Scope</span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">Evolve Admin Only</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold">
                            ROLE 8
                        </div>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-96">
                        <TextField
                            size="small"
                            placeholder="Search by title, description or file..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: <SearchIcon fontSize="small" className="text-gray-400 mr-1" />
                            }}
                        />
                        <Button type="submit" variant="outlined" size="small" className="normal-case">
                            Search
                        </Button>
                        {search && (
                            <Button type="button" variant="text" size="small" onClick={handleClearSearch} className="normal-case text-gray-500">
                                Clear
                            </Button>
                        )}
                    </form>

                    <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchPriceLists()}
                        className="text-gray-600 normal-case"
                    >
                        Refresh
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                    <CustomTable
                        columns={columns}
                        data={priceLists}
                        loading={loading}
                        pageSize={pageSize}
                        totalRows={totalRows}
                        currentPage={page}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={openModal} onClose={() => !submitting && setOpenModal(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="font-bold text-gray-900 text-lg">
                            {isEditMode ? "Edit Price List" : "Add New Price List PDF"}
                        </span>
                        <IconButton size="small" onClick={() => setOpenModal(false)} disabled={submitting}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent className="space-y-4 pt-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Document Title *
                            </label>
                            <TextField
                                size="small"
                                fullWidth
                                required
                                placeholder="e.g. TRW Braking Systems Price List 2026"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Description
                            </label>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Detailed summary of the price list catalogue, brands, products..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                PDF Document {isEditMode ? "(Optional: select new PDF to replace)" : "*"}
                            </label>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition bg-slate-50">
                                <CloudUploadIcon className="text-gray-400 text-3xl mb-1" />
                                <div className="text-sm font-medium text-gray-700">
                                    {file ? (
                                        <span className="text-blue-600 font-semibold">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    ) : (
                                        <span>Click to select PDF or drag and drop</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">PDF files up to 50MB (stored in S3: price-list-pdfs/)</p>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="pricelist-pdf-upload"
                                />
                                <label
                                    htmlFor="pricelist-pdf-upload"
                                    className="mt-3 inline-block px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 shadow-2xs"
                                >
                                    Browse Files
                                </label>
                            </div>

                            {fileError && (
                                <p className="text-xs text-red-600 mt-1 font-medium">{fileError}</p>
                            )}
                            {isEditMode && selectedItem && !file && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Current file: <span className="font-mono text-gray-700">{selectedItem.pricelistFile}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label={
                                    <span className="text-sm font-medium text-gray-800">
                                        Make Active (Visible in ZF Mobile App)
                                    </span>
                                }
                            />
                        </div>
                    </DialogContent>

                    <DialogActions className="border-t border-gray-100 p-4">
                        <Button
                            variant="outlined"
                            onClick={() => setOpenModal(false)}
                            disabled={submitting}
                            className="normal-case text-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            className="bg-blue-700 hover:bg-blue-800 text-white normal-case shadow-none"
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {submitting ? "Saving..." : isEditMode ? "Update Price List" : "Upload & Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default PriceListManagement;
