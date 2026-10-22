import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopMechanics, getTopProducts } from "../../../services/ApiService";
// import { getTopDealers } from "../../../services/ApiService"; // commented out — Top Workshops not applicable (only mechanics earn points)

interface MechanicItem {
    rank: number;
    name: string;
    city: string;
    workshopName?: string | null;
    points: number;
    formattedPoints: string;
}

interface DealerItem {
    rank: number;
    name: string;
    shopName: string;
    city: string;
    subtitle?: string;
    points: number;
    formattedPoints: string;
}

interface ProductItem {
    rank: number;
    productName: string;
    skuCode?: string;
    successCount: number;
    salesAmount: number;
    percentage: number;
    formattedPercentage: string;
}

const TopRankingsRow: React.FC = () => {
    const [mechanics, setMechanics] = useState<MechanicItem[]>([]);
    // const [dealers, setDealers] = useState<DealerItem[]>([]); // commented out — Top Workshops card hidden
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllRankings();
    }, []);

    const fetchAllRankings = async () => {
        try {
            setLoading(true);
            const [mechRes, prodRes] = await Promise.all([
                getTopMechanics(5),
                // getTopDealers(5), // commented out — Top Workshops card hidden
                getTopProducts(5),
            ]);

            setMechanics(mechRes?.data?.data || []);
            // setDealers(dealerRes?.data?.data || []); // commented out
            setProducts(prodRes?.data?.data || []);
        } catch (error) {
            console.error("Error fetching top rankings:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* ── CARD 1: TOP MECHANICS ── */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-gray-800">Top Mechanics</h3>
                        <Link
                            to="/reports?report=qr"
                            state={{ report: "qr" }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 transition-colors group cursor-pointer"
                            id="top-mechanics-show-more"
                            title="View QR Transaction Report"
                        >
                            <span>Show More</span>
                            <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                        </Link>
                    </div>
                    {loading ? (
                        <div className="space-y-4 py-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className="h-9 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : mechanics.length === 0 ? (
                        <p className="text-xs text-gray-400">No data available</p>
                    ) : (
                        <div className="space-y-4">
                            {mechanics.map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <span className="text-xs font-semibold text-gray-400 w-3 text-center flex-shrink-0">
                                            {m.rank || i + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {m.workshopName ? `${m.workshopName} · ${m.city}` : m.city}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex-shrink-0">
                                        {m.formattedPoints || `${m.points?.toLocaleString()} pts`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* {!loading && mechanics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                        <Link
                            to="/reports?report=qr"
                            state={{ report: "qr" }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                            <span>View More</span>
                            <i className="fas fa-chevron-right text-[10px]"></i>
                        </Link>
                    </div>
                )} */}
            </div>

            {/*
            ── CARD 2: TOP DEALERS / WORKSHOPS (commented out) ──
            Workshops do not earn points directly — only mechanics under them do.
            This card can be restored later if workshop-level aggregation is implemented.

            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-5">Top Dealers</h3>
                    ...
                </div>
            </div>
            */}

            {/* ── CARD 2 (was CARD 3): TOP PRODUCTS ── */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-5">Top Products</h3>
                    {loading ? (
                        <div className="space-y-4 py-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className="h-9 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <p className="text-xs text-gray-400">No data available</p>
                    ) : (
                        <div className="space-y-4">
                            {products.map((p, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-gray-900 truncate pr-2">{p.productName}</span>
                                        <span className="font-medium text-gray-400 flex-shrink-0">{p.formattedPercentage || `${p.percentage}%`}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.max(2, p.percentage))}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopRankingsRow;
