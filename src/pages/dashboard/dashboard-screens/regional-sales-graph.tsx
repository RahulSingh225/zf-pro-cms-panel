// src/pages/dashboard/dashboard-screens/regional-sales-graph.tsx
// Zone Performance Graph – 3 bars per zone: Registrations | Active Members | Scans

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { getZonePerformance } from "../../../services/ApiService";

interface ZoneData {
  zone: string;
  registrations: number;
  active: number;
  scans: number;
}

const RegionalSalesGraph: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch zone performance data ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getZonePerformance();
        const apiData = res?.data?.data;
        if (Array.isArray(apiData)) {
          setZones(apiData);
        }
      } catch (error) {
        console.error("Failed to fetch zone performance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Render / update echarts whenever data changes ───────────────────────
  useEffect(() => {
    if (loading || !chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const labels = zones.map((z) => z.zone);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        data: ["Registrations", "Active Members", "Scans"],
        top: 6,
        textStyle: { color: "#374151", fontSize: 12 },
        itemWidth: 12,
        itemHeight: 12,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "14%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLine: { lineStyle: { color: "#E5E7EB" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#6B7280",
          fontSize: 13,
          fontWeight: 500,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#9CA3AF",
          fontSize: 11,
          formatter: (value: number) =>
            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value),
        },
        splitLine: { lineStyle: { color: "#F1F5F9" } },
      },
      series: [
        {
          name: "Registrations",
          type: "bar",
          barGap: "10%",
          barCategoryGap: "35%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#3B82F6" },
              { offset: 1, color: "#2563EB" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: false,
          },
          data: zones.map((z) => z.registrations),
        },
        {
          name: "Active Members",
          type: "bar",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#10B981" },
              { offset: 1, color: "#059669" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: zones.map((z) => z.active),
        },
        {
          name: "Scans",
          type: "bar",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#F97316" },
              { offset: 1, color: "#EA580C" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: zones.map((z) => z.scans),
        },
      ],
    };

    chartInstance.current.setOption(option, true);

    const resizeObserver = new ResizeObserver(() =>
      chartInstance.current?.resize()
    );
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [zones, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Zone Wise Performance
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Registration vs Active Members vs Scans — by Zone
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm animate-pulse">
          Loading zone performance...
        </div>
      ) : zones.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No zone data available
        </div>
      ) : (
        <div ref={chartRef} className="w-full" style={{ height: "280px" }} />
      )}
    </div>
  );
};

export default RegionalSalesGraph;
