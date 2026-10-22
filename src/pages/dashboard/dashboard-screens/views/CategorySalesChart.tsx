import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { getSalesByCategory } from "../../../../services/ApiService";

interface CategorySalesChartProps {
    filters?: { [key: string]: any };
}

interface CategoryData {
    category: string;
    amount: number;
    formattedAmount?: string;
}

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ filters }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getSalesByCategory(filters);
                const apiData = res?.data?.data?.categories;
                if (isMounted) {
                    if (Array.isArray(apiData)) {
                        setCategories(apiData);
                    } else {
                        setCategories([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching category scans:", error);
                if (isMounted) setCategories([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [filters]);

    useEffect(() => {
        if (loading || !chartRef.current || categories.length === 0) return;

        let chart = echarts.getInstanceByDom(chartRef.current);
        if (!chart) {
            chart = echarts.init(chartRef.current);
        }

        const labels = categories.map((c) => c.category);
        const values = categories.map((c) => c.amount);

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any) => {
                    const item = params[0];
                    return `<div class="font-sans">
                        <span class="font-semibold text-gray-800">${item.name}</span><br/>
                        Scans: <span class="font-bold text-blue-600">${item.value}</span>
                    </div>`;
                },
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "18%",
                top: "12%",
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: labels,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: "#94A3B8",
                    fontSize: 11,
                    fontWeight: 500,
                    interval: 0,       // force show all labels
                    rotate: 20,        // slight tilt to prevent overlap
                    overflow: "truncate",
                    width: 80,
                },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                splitLine: {
                    lineStyle: {
                        color: "#F1F5F9",
                        type: "dashed",
                    },
                },
                axisLabel: {
                    color: "#94A3B8",
                    fontSize: 12,
                    formatter: (val: number) => Math.round(val).toString(),
                },
            },
            series: [
                {
                    type: "bar",
                    data: values,
                    barWidth: "35%",
                    itemStyle: {
                        borderRadius: [8, 8, 0, 0],
                        color: (params: any) => {
                            const total = values.length;
                            if (total > 3 && params.dataIndex >= total - 2) {
                                return "#F04438"; // Coral Red
                            }
                            return "#1E64E2"; // Vibrant Blue
                        },
                    },
                },
            ],
        };

        chart.setOption(option, true);

        const resizeObserver = new ResizeObserver(() => chart?.resize());
        resizeObserver.observe(chartRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [categories, loading]);

    return (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 w-full flex flex-col justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Scans By Product Category
            </h2>

            {loading ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                    Loading category scans...
                </div>
            ) : categories.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                    No scans data available by category
                </div>
            ) : (
                <div ref={chartRef} className="w-full h-72" />
            )}
        </div>
    );
};

export default CategorySalesChart;
