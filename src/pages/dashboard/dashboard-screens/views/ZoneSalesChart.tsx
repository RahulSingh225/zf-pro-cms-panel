import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { getRegionalSalesPerformance } from "../../../../services/ApiService";

interface ZoneSalesChartProps {
    filters?: { [key: string]: any };
}

interface ZoneData {
    zone: string;
    amount: number;
    formattedAmount?: string;
}

const ZoneSalesChart: React.FC<ZoneSalesChartProps> = ({ filters }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [zones, setZones] = useState<ZoneData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getRegionalSalesPerformance(filters);
                const apiData = res?.data?.data?.regions;
                if (isMounted) {
                    if (Array.isArray(apiData)) {
                        setZones(apiData);
                    } else {
                        setZones([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching zone scans:", error);
                if (isMounted) setZones([]);
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
        if (loading || !chartRef.current || zones.length === 0) return;

        let chart = echarts.getInstanceByDom(chartRef.current);
        if (!chart) {
            chart = echarts.init(chartRef.current);
        }

        const labels = zones.map((z) => z.zone);
        const values = zones.map((z) => z.amount);

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any) => {
                    const item = params[0];
                    return `<div class="font-sans">
                        <span class="font-semibold text-gray-800">${item.name} Zone</span><br/>
                        Scans: <span className="font-bold text-amber-500">${item.value}</span>
                    </div>`;
                },
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "10%",
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
                    fontSize: 12,
                    fontWeight: 500,
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
                        color: "#F59E0B", // Golden Amber
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
    }, [zones, loading]);

    return (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 w-full flex flex-col justify-between">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Zone Scans
            </h2>

            {loading ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                    Loading zone scans...
                </div>
            ) : zones.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                    No zone scans data available
                </div>
            ) : (
                <div ref={chartRef} className="w-full h-72" />
            )}
        </div>
    );
};

export default ZoneSalesChart;
