import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import TopBar from '../../layouts/top-bar';
import CustomTable, { Column } from '../../components/CustomTable';
import { uploadProductCatalogue, getProductCatalogueCategories } from '../../services/ApiService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkippedRow {
    excelRow: number;
    reason: string;
}

interface SheetResult {
    sheetName: string;
    categoryName: string;
    categoryCode: string;
    rowCount: number;
    distinctPartCount: number;
    distinctMakers: string[];
    skippedRowCount: number;
    warnings: string[];
    error?: string;
}

interface UploadResult {
    dryRun: boolean;
    mode: string;
    errors: string[];
    sheets: SheetResult[];
    insertedCount?: number;
    affectedCategories?: string[];
}

interface CategoryItem {
    categoryCode: string;
    categoryName: string;
    skuCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductCatalogueUpload: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload form state
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState<'replace_categories' | 'replace_all'>('replace_categories');

    // Preview / upload state
    const [previewResult, setPreviewResult] = useState<UploadResult | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

    // Categories table state
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // ─── Fetch current categories ─────────────────────────────────────────────

    const fetchCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const res = await getProductCatalogueCategories();
            const data = res?.data?.data ?? res?.data ?? [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            toast.error(err?.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // ─── File handling ────────────────────────────────────────────────────────

    const handleFileSelect = (selected: File | null) => {
        if (!selected) return;
        if (!selected.name.toLowerCase().endsWith('.xlsx')) {
            toast.error('Only .xlsx files are accepted');
            return;
        }
        setFile(selected);
        setPreviewResult(null);
        setUploadResult(null);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files?.[0] ?? null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files?.[0] ?? null);
    };

    // ─── Preview (dry run) ────────────────────────────────────────────────────

    const handlePreview = async () => {
        if (!file) {
            toast.error('Please select an .xlsx file first');
            return;
        }
        try {
            setPreviewLoading(true);
            setPreviewResult(null);
            setUploadResult(null);

            const formData = new FormData();
            formData.append('file', file);

            const res = await uploadProductCatalogue(formData, { dryRun: true, mode });
            const result: UploadResult = res?.data?.data ?? res?.data;
            setPreviewResult(result);

            if (result?.errors?.length) {
                toast.error(`Preview has ${result.errors.length} blocking error(s). Fix before uploading.`);
            } else {
                toast.success('Preview complete — review the results below');
            }
        } catch (err: any) {
            console.error('Preview error:', err);
            const errorData = err?.response?.data;
            if (errorData?.data) {
                setPreviewResult(errorData.data);
            }
            toast.error(errorData?.message || 'Preview failed');
        } finally {
            setPreviewLoading(false);
        }
    };

    // ─── Confirm upload ───────────────────────────────────────────────────────

    const handleConfirmUpload = async () => {
        if (!file) return;
        setConfirmDialogOpen(false);
        try {
            setUploadLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await uploadProductCatalogue(formData, { dryRun: false, mode });
            const result: UploadResult = res?.data?.data ?? res?.data;
            setUploadResult(result);
            toast.success(
                `Upload successful — ${result?.insertedCount ?? 0} rows inserted across ${result?.affectedCategories?.length ?? 0} category(ies)`
            );
            await fetchCategories();
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const hasBlockingErrors = Boolean(
        previewResult?.errors?.length || previewResult?.sheets?.some((s) => s.error)
    );

    const categoryColumns: Column[] = [
        {
            key: 'categoryCode',
            label: 'Code',
            render: (item: CategoryItem) => (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    {item.categoryCode}
                </code>
            ),
        },
        { key: 'categoryName', label: 'Category Name' },
        {
            key: 'skuCount',
            label: 'Distinct Parts',
            render: (item: CategoryItem) => (
                <span className="font-semibold text-blue-700">{item.skuCount}</span>
            ),
        },
    ];

    const displayResult = uploadResult ?? previewResult;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <TopBar title="Upload Product Catalogue" />

            <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Product Catalogue Upload
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload an Excel (.xlsx) file — each <strong>sheet</strong> becomes a product{' '}
                        <strong>category</strong>. Expected columns:{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">Part number</code>,{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">Brand</code>,{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">Model</code>,{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">product description</code>.
                    </p>
                </div>

                {/* ── Upload Form ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-semibold text-gray-800">Step 1 — Select File & Mode</h2>

                    {/* Mode selector */}
                    <FormControl>
                        <FormLabel className="text-sm font-medium text-gray-700">Upload mode</FormLabel>
                        <RadioGroup
                            row
                            value={mode}
                            onChange={(e) =>
                                setMode(e.target.value as 'replace_categories' | 'replace_all')
                            }
                        >
                            <FormControlLabel
                                value="replace_categories"
                                control={<Radio size="small" />}
                                label={
                                    <span className="text-sm">
                                        <strong>Replace categories in file</strong>
                                        <span className="text-gray-500 ml-1">
                                            (only deletes rows for the categories present in this file)
                                        </span>
                                    </span>
                                }
                            />
                            <FormControlLabel
                                value="replace_all"
                                control={<Radio size="small" color="error" />}
                                label={
                                    <span className="text-sm">
                                        <strong className="text-red-700">Replace everything</strong>
                                        <span className="text-gray-500 ml-1">
                                            (deletes ALL existing catalogue rows first)
                                        </span>
                                    </span>
                                }
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Drag-and-drop zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-slate-50 hover:border-blue-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CloudUploadIcon className="text-gray-400 mb-2" style={{ fontSize: 40 }} />
                        {file ? (
                            <div>
                                <p className="text-sm font-semibold text-blue-700">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Click or drag & drop an .xlsx file here
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">Max 10 MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                    </div>

                    {/* Preview button */}
                    <div className="flex gap-3">
                        <Button
                            variant="contained"
                            onClick={handlePreview}
                            disabled={!file || previewLoading || uploadLoading}
                            startIcon={
                                previewLoading ? <CircularProgress size={16} color="inherit" /> : null
                            }
                            className="normal-case bg-blue-700 hover:bg-blue-800 text-white shadow-none"
                        >
                            {previewLoading ? 'Previewing…' : 'Preview (dry run)'}
                        </Button>

                        {file && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                    setFile(null);
                                    setPreviewResult(null);
                                    setUploadResult(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="normal-case text-gray-500"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Preview / Upload Results ── */}
                {displayResult && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-800">
                                Step 2 —{' '}
                                {displayResult.dryRun
                                    ? 'Preview Results (no data written)'
                                    : '✅ Upload Results'}
                            </h2>
                            {displayResult.dryRun && !hasBlockingErrors && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => setConfirmDialogOpen(true)}
                                    disabled={uploadLoading}
                                    startIcon={
                                        uploadLoading ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : null
                                    }
                                    className="normal-case shadow-none"
                                >
                                    {uploadLoading ? 'Uploading…' : 'Confirm Upload'}
                                </Button>
                            )}
                        </div>

                        {/* Success summary (after real upload) */}
                        {!displayResult.dryRun && displayResult.insertedCount !== undefined && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                                <CheckCircleOutlineIcon className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-800">
                                        Upload successful
                                    </p>
                                    <p className="text-sm text-green-700 mt-0.5">
                                        <strong>{displayResult.insertedCount}</strong> rows inserted across{' '}
                                        <strong>{displayResult.affectedCategories?.length ?? 0}</strong>{' '}
                                        category(ies). Mode:{' '}
                                        <code className="text-xs bg-green-100 px-1 rounded">
                                            {displayResult.mode}
                                        </code>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Blocking errors */}
                        {displayResult.errors?.length > 0 && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ErrorOutlineIcon className="text-red-600" fontSize="small" />
                                    <span className="text-sm font-semibold text-red-800">
                                        Blocking Errors — fix these before uploading
                                    </span>
                                </div>
                                <ul className="list-disc list-inside space-y-1">
                                    {displayResult.errors.map((e, i) => (
                                        <li key={i} className="text-sm text-red-700">
                                            {e}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Per-sheet table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            'Sheet Name',
                                            'Category',
                                            'Code',
                                            'Rows',
                                            'Parts',
                                            'Makers',
                                            'Skipped',
                                            'Status',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {displayResult.sheets.map((sheet, idx) => (
                                        <tr
                                            key={idx}
                                            className={
                                                sheet.error
                                                    ? 'bg-red-50'
                                                    : sheet.warnings?.length
                                                    ? 'bg-yellow-50'
                                                    : ''
                                            }
                                        >
                                            <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">
                                                {sheet.sheetName}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {sheet.categoryName || '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {sheet.categoryCode ? (
                                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                                        {sheet.categoryCode}
                                                    </code>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {sheet.error ? '—' : sheet.rowCount}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {sheet.error ? '—' : sheet.distinctPartCount}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {sheet.error
                                                    ? '—'
                                                    : sheet.distinctMakers?.length ?? 0}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {sheet.error ? '—' : sheet.skippedRowCount ?? 0}
                                            </td>
                                            <td className="px-4 py-2">
                                                {sheet.error ? (
                                                    <Chip
                                                        label="Skipped"
                                                        size="small"
                                                        color="error"
                                                        title={sheet.error}
                                                    />
                                                ) : sheet.warnings?.length ? (
                                                    <Chip
                                                        icon={<WarningAmberIcon style={{ fontSize: 14 }} />}
                                                        label={`${sheet.warnings.length} warning(s)`}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        title={sheet.warnings.join('\n')}
                                                    />
                                                ) : (
                                                    <Chip label="OK" size="small" color="success" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Warnings detail */}
                        {displayResult.sheets.some((s) => s.warnings?.length > 0) && (
                            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <WarningAmberIcon className="text-yellow-600" fontSize="small" />
                                    <span className="text-sm font-semibold text-yellow-800">Warnings</span>
                                </div>
                                {displayResult.sheets
                                    .filter((s) => s.warnings?.length > 0)
                                    .map((s, i) => (
                                        <div key={i} className="mb-2">
                                            <p className="text-xs font-semibold text-yellow-800">
                                                {s.sheetName}
                                            </p>
                                            <ul className="list-disc list-inside mt-0.5">
                                                {s.warnings.map((w, j) => (
                                                    <li key={j} className="text-xs text-yellow-700">
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Confirm button (bottom) */}
                        {displayResult.dryRun && !hasBlockingErrors && (
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => setConfirmDialogOpen(true)}
                                    disabled={uploadLoading}
                                    startIcon={
                                        uploadLoading ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : null
                                    }
                                    className="normal-case shadow-none"
                                >
                                    {uploadLoading ? 'Uploading…' : 'Confirm Upload'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Current Categories ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">
                                Current Categories
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Ordered by upload order (insertion order of first row).
                            </p>
                        </div>
                        <Button
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={fetchCategories}
                            disabled={categoriesLoading}
                            className="normal-case text-gray-600"
                        >
                            Refresh
                        </Button>
                    </div>

                    {categories.length === 0 && !categoriesLoading ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                            No categories found. Upload a catalogue to get started.
                        </p>
                    ) : (
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <CustomTable
                                columns={categoryColumns}
                                data={categories}
                                loading={categoriesLoading}
                                pageSize={categories.length || 10}
                                totalRows={categories.length}
                                currentPage={1}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => !uploadLoading && setConfirmDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="font-bold text-gray-900">
                    Confirm Catalogue Upload
                </DialogTitle>
                <DialogContent>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            You are about to upload{' '}
                            <strong>{file?.name}</strong> in{' '}
                            <strong>
                                {mode === 'replace_all'
                                    ? '"Replace everything"'
                                    : '"Replace categories in file"'}
                            </strong>{' '}
                            mode.
                        </p>
                        {mode === 'replace_all' ? (
                            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                                ⚠️ <strong>All existing catalogue data will be permanently deleted</strong>{' '}
                                before the new data is inserted.
                            </div>
                        ) : (
                            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                                ⚠️ Existing rows for the following categories will be deleted and
                                replaced:{' '}
                                <strong>
                                    {previewResult?.sheets
                                        .filter((s) => !s.error)
                                        .map((s) => s.categoryName)
                                        .join(', ')}
                                </strong>
                            </div>
                        )}
                        <p className="text-sm text-gray-600">
                            Total rows to insert:{' '}
                            <strong>
                                {previewResult?.sheets
                                    .filter((s) => !s.error)
                                    .reduce((sum, s) => sum + s.rowCount, 0) ?? 0}
                            </strong>
                        </p>
                    </div>
                </DialogContent>
                <DialogActions className="p-4 border-t border-gray-100">
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                        className="normal-case text-gray-600"
                        disabled={uploadLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmUpload}
                        disabled={uploadLoading}
                        startIcon={
                            uploadLoading ? <CircularProgress size={16} color="inherit" /> : null
                        }
                        className="normal-case shadow-none"
                    >
                        {uploadLoading ? 'Uploading…' : 'Yes, Upload Now'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProductCatalogueUpload;

