import React, { useEffect, useState } from "react";
import { GlobalFilterValues } from "../../dashboard-screens/GlobalFilters";
import CategorySalesChart from "./CategorySalesChart";
import ZoneSalesChart from "./ZoneSalesChart";
import { getZonePerformance } from "../../../../services/ApiService";
import { FaGlobeAsia } from "react-icons/fa";

interface Props {
    filters: GlobalFilterValues;
}

interface ZonePerfItem {
    zone: string;
    scans?: number;
    sales?: number;
    members?: number;
    registrations?: number;
    active?: number;
}

const ZonePerformanceCard: React.FC = () => {
    const [data, setData] = useState<ZonePerfItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getZonePerformance()
            .then((res) => {
                setData(res?.data?.data || []);
            })
            .catch((err) => console.error("Zone performance error:", err))
            .finally(() => setLoading(false));
    }, []);

    const totalScans = data.reduce((acc, item) => acc + (item.scans ?? item.sales ?? 0), 0);
    const totalMembers = data.reduce((acc, item) => acc + (item.registrations ?? item.members ?? 0), 0);
    const totalActive = data.reduce((acc, item) => acc + (item.active ?? 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaGlobeAsia className="text-blue-500" /> Zone Performance
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Zone-wise scans (successful scan transactions) &amp; member density
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <div>Total Scans: <span className="text-blue-600 font-bold">{totalScans.toLocaleString()}</span></div>
                    <div>Active: <span className="text-indigo-600 font-bold">{totalActive.toLocaleString()}</span></div>
                    <div>Total Members: <span className="text-green-600 font-bold">{totalMembers.toLocaleString()}</span></div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2">Zone</th>
                                <th className="pb-3 text-right">Scans</th>
                                <th className="pb-3 text-right">Active</th>
                                <th className="pb-3 text-right">Members</th>
                                <th className="pb-3 pr-2 text-right">Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((row) => {
                                const rowScans = row.scans ?? row.sales ?? 0;
                                const rowMembers = row.registrations ?? row.members ?? 0;
                                const rowActive = row.active ?? 0;
                                const share = totalScans > 0 ? Math.round((rowScans / totalScans) * 100) : 0;
                                return (
                                    <tr key={row.zone} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pl-2 font-medium text-gray-800 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                            {row.zone} Zone
                                        </td>
                                        <td className="py-3 text-right font-semibold text-gray-700">
                                            {rowScans.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right font-semibold text-gray-700">
                                            {rowActive.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right font-semibold text-gray-700">
                                            {rowMembers.toLocaleString()}
                                        </td>
                                        <td className="py-3 pr-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="bg-blue-500 h-full rounded-full"
                                                        style={{ width: `${share}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 w-8 text-right">
                                                    {share}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const SalesBusinessTab: React.FC<Props> = ({ filters }) => {
    return (
        <div className="space-y-6">
            {/* Top row: Sales by Category & Zone Sales side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategorySalesChart filters={filters} />
                <ZoneSalesChart filters={filters} />
            </div>

            {/* Bottom section: Zone Performance Table */}
            <ZonePerformanceCard />
        </div>
    );
};

export default SalesBusinessTab;
