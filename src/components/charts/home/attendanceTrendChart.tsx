import { useState, useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";
import { useAtom } from "jotai";
import { IoChevronDown } from "react-icons/io5";
import { LoadingLayout } from "../../layout";
import { periodAtom } from "../../../utils/atom/period";

export interface AttendanceTrendItem {
  month?: string;
  label?: string;
  attendance?: number;
  revenue?: number;
  value?: number;
  forecast?: number;
  [key: string]: unknown;
}

export interface AttendanceTrendChartProps {
  data?: unknown;
  isLoading?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  label?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  curve?: "natural" | "linear" | "monotoneX" | "step";
  valueFormatter?: (value: number | null) => string;
  showFilter?: boolean;
  onPeriodChange?: (period: string) => void;
}

export default function AttendanceTrendChart({
  data: propData,
  isLoading = false,
  dataKey = "attendance",
  xAxisKey = "month",
  label = "Attendance",
  color = "#7047EB",
  height = 280,
  showLegend = true,
  legendLabel,
  yAxisMax,
  valueFormatter,
  showFilter = false,
  onPeriodChange,
}: AttendanceTrendChartProps) {
  const [currentPeriod, setCurrentPeriod] = useAtom(periodAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLegend = legendLabel ?? currentPeriod;

  const ranges = [
    "Last 7 Days",
    "Last 14 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last Year",
    "All Time",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dataSource =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    "data" in (propData as Record<string, unknown>)
      ? (() => {
          const d = (propData as Record<string, unknown>).data;
          if (d && typeof d === "object" && !Array.isArray(d)) {
            const dObj = d as Record<string, unknown>;
            if (Array.isArray(dObj.forecast)) return dObj.forecast;
            if (Array.isArray(dObj.trend)) return dObj.trend;
            if (Array.isArray(dObj.attendance)) return dObj.attendance;
            if (Array.isArray(dObj.purchases)) return dObj.purchases;
            if (Array.isArray(dObj.records)) return dObj.records;
            if (Array.isArray(dObj.items)) return dObj.items;
          }
          return d;
        })()
      : propData;

  let rawItems: Record<string, unknown>[] = [];
  if (Array.isArray(dataSource)) {
    rawItems = dataSource as Record<string, unknown>[];
  } else if (dataSource && typeof dataSource === "object") {
    rawItems = Object.entries(dataSource as Record<string, unknown>)
      .filter(([key]) => key !== "status" && key !== "message")
      .map(([key, val]) => ({
        [xAxisKey]: key,
        [dataKey]:
          typeof val === "number"
            ? val
            : Number(
                (val as Record<string, unknown>)?.attendance ??
                  (val as Record<string, unknown>)?.revenue ??
                  (val as Record<string, unknown>)?.forecast ??
                  (val as Record<string, unknown>)?.projected ??
                  (val as Record<string, unknown>)?.value ??
                  0
              ),
      }));
  }

  const chartData: AttendanceTrendItem[] = rawItems.map((item, index) => ({
    ...item,
    [xAxisKey]: String(
      item[xAxisKey] ??
        item.label ??
        item.date ??
        item.period ??
        item.month ??
        `Period ${index + 1}`
    ),
    [dataKey]: Number(
      item[dataKey] ??
        item.revenue ??
        item.forecast ??
        item.projected ??
        item.attendance ??
        item.value ??
        0
    ),
  }));

  const maxValue = chartData.reduce(
    (max, d) => Math.max(max, Number(d[dataKey] ?? 0)),
    0
  );
  const computedYMax = yAxisMax ?? (maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100);

  const isRevenue = dataKey === "revenue" || label.toLowerCase().includes("revenue");

  const formatValue = (val: number | null | undefined): string => {
    if (valueFormatter) {
      return valueFormatter(val ?? null);
    }
    if (isRevenue) {
      return `£${Number(val ?? 0).toLocaleString()}`;
    }
    return Number(val ?? 0).toLocaleString();
  };

  const itemCount = chartData.length;
  const rotateXLabels = itemCount > 12;

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: color,
          type: "dashed",
          width: 1.5,
        },
      },
      backgroundColor: "#1F2937",
      borderColor: "#374151",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#F9FAFB",
        fontSize: 12,
        fontWeight: 500,
      },
      formatter: (params) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const p = params[0];
        const val = Number(p.value ?? 0);
        return `
          <div style="font-weight: 600; margin-bottom: 4px; color: #FFFFFF;">${p.name}</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${color};"></span>
            <span>${label}: <strong>${formatValue(val)}</strong></span>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #9CA3AF;">Filter: ${activeLegend}</div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "3%",
      top: "12%",
      bottom: rotateXLabels ? "16%" : "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData.map((d) => String(d[xAxisKey] ?? "")),
      name: `Filter: ${activeLegend}`,
      nameLocation: "middle",
      nameGap: rotateXLabels ? 38 : 28,
      nameTextStyle: {
        color: "#6B7280",
        fontSize: 11,
        fontWeight: 600,
      },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { color: "#E5E7EB" },
      },
      axisLabel: {
        color: "#6B7280",
        fontSize: itemCount > 14 ? 10 : 12,
        fontWeight: 600,
        rotate: rotateXLabels ? 35 : 0,
        interval: itemCount > 25 ? 1 : 0,
        margin: 10,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: computedYMax,
      splitLine: {
        show: true,
        lineStyle: {
          color: "#F3F4F6",
          type: "dashed",
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#9CA3AF",
        fontSize: 11,
        fontWeight: 500,
        formatter: (val: number) => {
          if (isRevenue) return `£${Number(val).toLocaleString()}`;
          return Number(val).toLocaleString();
        },
      },
    },
    series: [
      {
        name: label,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: color,
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
        lineStyle: {
          color: color,
          width: 3,
          shadowColor: "rgba(112, 71, 235, 0.2)",
          shadowBlur: 10,
          shadowOffsetY: 4,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(112, 71, 235, 0.28)" },
            { offset: 1, color: "rgba(112, 71, 235, 0.01)" },
          ]),
        },
        data: chartData.map((d) => Number(d[dataKey] ?? 0)),
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-[260px] sm:min-h-[300px] flex flex-col justify-between relative">
      {/* Optional Top Filter Dropdown */}
      {showFilter && (
        <div className="flex items-center justify-end w-full mb-1">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/90 text-gray-800 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              aria-label="Filter by period"
            >
              <span className="text-gray-500 font-normal">Filter by Period:</span>
              <span className="font-bold text-[#7047EB]">{activeLegend}</span>
              <IoChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                  Filter by Period
                </div>
                {ranges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setCurrentPeriod(range);
                      setIsDropdownOpen(false);
                      onPeriodChange?.(range);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${
                      currentPeriod === range
                        ? "text-[#7047EB] font-bold bg-[#7047EB]/5"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{range}</span>
                    {currentPeriod === range && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7047EB]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1 min-h-[230px] sm:min-h-[270px]">
          <ReactECharts
            option={option}
            style={{ height, width: "100%" }}
            opts={{ renderer: "svg" }}
            notMerge={true}
          />
        </div>

        {/* Bottom Bar: Shows Series Indicator and Active Filter Type */}
        {showLegend && chartData.length > 0 && (
          <div className="w-full flex items-center justify-between px-2 pt-2.5 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1E1E1E" }} />
                <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-full text-xs">
              <span className="text-gray-500 font-medium">Filter Type:</span>
              <span className="font-bold text-[#7047EB]">{activeLegend}</span>
            </div>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}