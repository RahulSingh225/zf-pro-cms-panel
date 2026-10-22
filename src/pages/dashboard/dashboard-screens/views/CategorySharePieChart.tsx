import React, { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts";
import { getCategoryShare } from "../../../../services/ApiService";

interface CategoryShareItem {
    category: string;
    scanCount: number;
    percentage: number;
    formattedPercentage: string;
}

type TimeRange = "7d" | "30d" | "3m" | "6m" | "all";

interface RangeOption {
    label: string;
    value: TimeRange;
}

const RANGE_OPTIONS: RangeOption[] = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "All Time", value: "all" },
];

const COLOR_PALETTE = ["#1E64E2", "#F59E0B", "#10B981", "#8B5CF6", "#14B8A6", "#3B82F6", "#EC4899", "#6366F1"];

const getDateRange = (range: TimeRange): { dateFrom?: string; dateTo?: string } => {
    if (range === "all") return {};
    const now = new Date();
    const to = now.toISOString();
    const from = new Date(now);
    if (range === "7d") from.setDate(from.getDate() - 7);
    else if (range === "30d") from.setDate(from.getDate() - 30);
    else if (range === "3m") from.setMonth(from.getMonth() - 3);
    else if (range === "6m") from.setMonth(from.getMonth() - 6);
    return { dateFrom: from.toISOString(), dateTo: to };
};

const CategorySharePieChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const [categories, setCategories] = useState<CategoryShareItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<TimeRange>("all");

    const fetchData = useCallback(async (range: TimeRange) => {
        try {
            setLoading(true);
            const params = getDateRange(range);
            const res = await getCategoryShare(params);
            const apiData = res?.data?.data?.categories;
            if (Array.isArray(apiData)) {
                setCategories(apiData);
            }
        } catch (error) {
            console.error("Error fetching category share:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedRange);
    }, [selectedRange, fetchData]);

    useEffect(() => {
        if (!chartRef.current || categories.length === 0) return;

        // Always dispose old instance (it may be detached if loading toggled the div out of DOM)
        const existing = echarts.getInstanceByDom(chartRef.current);
        if (existing) existing.dispose();
        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const pieData = categories.map((item, idx) => ({
            name: item.category,
            value: item.percentage || item.scanCount,
            itemStyle: {
                color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
            },
        }));

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: "item",
                formatter: "{b}: <b>{c}%</b>",
            },
            legend: {
                orient: "vertical",
                right: "5%",
                top: "center",
                icon: "circle",
                itemGap: 12,
                formatter: (name: string) => {
                    const item = categories.find((c) => c.category === name);
                    const pct = item ? item.percentage : 0;
                    return `{name|${name}}  {pct|${pct}%}`;
                },
                textStyle: {
                    rich: {
                        name: {
                            color: "#475569",
                            fontSize: 13,
                            fontWeight: 500,
                        },
                        pct: {
                            color: "#0F172A",
                            fontSize: 13,
                            fontWeight: 700,
                        },
                    },
                },
            },
            series: [
                {
                    type: "pie",
                    radius: ["0%", "75%"],
                    center: ["35%", "50%"],
                    label: { show: false },
                    emphasis: {
                        scale: true,
                        scaleSize: 6,
                    },
                    data: pieData,
                },
            ],
        };

        chart.setOption(option);

        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [categories]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            chartInstance.current?.dispose();
        };
    }, []);

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 w-full flex flex-col">
            {/* Header with filter */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">Category Share</h2>
                <select
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:border-gray-300 transition-colors"
                >
                    {RANGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm animate-pulse">
                    Loading category share...
                </div>
            ) : categories.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                    No data for selected period
                </div>
            ) : (
                <div ref={chartRef} className="w-full h-72" />
            )}
        </div>
    );
};

export default CategorySharePieChart;
