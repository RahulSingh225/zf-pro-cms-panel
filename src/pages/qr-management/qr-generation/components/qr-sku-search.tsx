import React, { FC, useState } from "react";
import { Barcode, Boxes, Loader2, Network, Package, QrCode, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getSkuByCode } from "../../../../services/ApiService";

export interface SkuDetails {
    skuId: number;
    skuName: string;
    skuCode: string;
    categoryId: number;
    categoryName: string | null;
    subCategoryId: number;
    subCategoryName: string | null;
}

interface QRSkuSearchProps {
    isSubmitting?: boolean;
    // Returns true when generation was queued successfully (used to reset the quantity)
    onGenerate: (skuCode: string, quantity: number) => Promise<boolean>;
}

const PLACEHOLDER = "Auto Populated";

const Tile: FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#174A8B]">
                {icon}
            </div>
            <span className="text-base font-semibold text-gray-900">{title}</span>
        </div>
        {children}
    </div>
);

const ValuePill: FC<{ value?: string | null }> = ({ value }) => (
    <div
        title={value || PLACEHOLDER}
        className={`h-10 flex items-center justify-center rounded-lg border px-3 text-sm font-semibold truncate ${value ? "border-[#1440B8] text-gray-900 bg-blue-50/40" : "border-[#1440B8] text-[#1440B8]"
            }`}
    >
        <span className="truncate">{value || PLACEHOLDER}</span>
    </div>
);

const QRSkuSearch: FC<QRSkuSearchProps> = ({ isSubmitting = false, onGenerate }) => {
    const [searchCode, setSearchCode] = useState("");
    const [sku, setSku] = useState<SkuDetails | null>(null);
    const [quantity, setQuantity] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        const code = searchCode.trim();
        if (!code) {
            toast.error("Please enter an SKU code");
            return;
        }

        setIsSearching(true);
        setSku(null);
        try {
            const response = await getSkuByCode(code);
            setSku(response.data.data);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                toast.error("No active SKU found for this code");
            } else {
                console.error("Error fetching SKU by code:", err);
                toast.error(err?.response?.data?.message || "Failed to fetch SKU details");
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerate = async () => {
        if (!sku) {
            toast.error("Search for a valid SKU code first");
            return;
        }
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            toast.error("Enter a valid quantity");
            return;
        }
        const ok = await onGenerate(sku.skuCode, qty);
        if (ok) setQuantity("");
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-3">
                <h2 className="text-xl font-bold text-gray-900">SKU Code</h2>
                <form
                    className="relative w-full max-w-xs"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                >
                    <input
                        type="text"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        placeholder="Search Code"
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        aria-label="Search SKU code"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-[#1440B8] disabled:opacity-60"
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Tile icon={<Package className="h-5 w-5" />} title="Category">
                    <ValuePill value={sku?.categoryName} />
                </Tile>

                <Tile icon={<Network className="h-5 w-5" />} title="Subcategory">
                    <ValuePill value={sku?.subCategoryName} />
                </Tile>

                <Tile icon={<Barcode className="h-5 w-5" />} title="SKU">
                    <ValuePill value={sku ? sku.skuName : null} />
                </Tile>

                <Tile icon={<Boxes className="h-5 w-5" />} title="No Of QR's">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter Quantity"
                            disabled={!sku}
                            className="h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={!sku || isSubmitting}
                            className="h-10 shrink-0 px-4 inline-flex items-center gap-2 rounded-lg bg-[#1440B8] text-sm font-semibold text-white hover:bg-[#10349A] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <QrCode className="h-4 w-4" />
                            Generate QR
                        </button>
                    </div>
                </Tile>
            </div>
        </div>
    );
};

export default QRSkuSearch;
