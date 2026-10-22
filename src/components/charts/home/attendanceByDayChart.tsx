import { useState, useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useAtom } from "jotai";
import { IoChevronDown } from "react-icons/io5";
import { LoadingLayout } from "../../layout";
import { periodAtom } from "../../../utils/atom/period";

export interface AttendanceByDayItem {
  day: string;
  count: number;
  displayCount?: number;
  [key: string]: unknown;
}

export interface AttendanceByDayChartProps {
  data?: unknown;
  isLoading?: boolean;
  barColor?: string;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  height?: number;
  showFilter?: boolean;
  onPeriodChange?: (period: string) => void;
}

const STANDARD_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_NAME_MAP: Record<string, string> = {
  monday: "Mon",
  mon: "Mon",
  tuesday: "Tue",
  tue: "Tue",
  tues: "Tue",
  wednesday: "Wed",
  wed: "Wed",
  thursday: "Thu",
  thu: "Thu",
  thur: "Thu",
  thurs: "Thu",
  friday: "Fri",
  fri: "Fri",
  saturday: "Sat",
  sat: "Sat",
  sunday: "Sun",
  sun: "Sun",
};

export default function AttendanceByDayChart({
  data: propData,
  isLoading = false,
  barColor = "#2E0F74",
  showLegend = true,
  legendLabel: _legendLabel,
  yAxisMax,
  height = 280,
  showFilter = true,
  onPeriodChange,
}: AttendanceByDayChartProps) {
  const [selectedRange, setSelectedRange] = useAtom(periodAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // 1. Unwrap data source
  let source: unknown = propData;
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const obj = source as Record<string, unknown>;
    if ("data" in obj && obj.data) {
      source = obj.data;
    }
  }
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const obj = source as Record<string, unknown>;
    if (Array.isArray(obj.attendance)) source = obj.attendance;
    else if (Array.isArray(obj.purchases)) source = obj.purchases;
    else if (Array.isArray(obj.trend)) source = obj.trend;
    else if (Array.isArray(obj.forecast)) source = obj.forecast;
    else if (Array.isArray(obj.records)) source = obj.records;
    else if (Array.isArray(obj.items)) source = obj.items;
    else if (Array.isArray(obj.results)) source = obj.results;
  }

  // 2. Extract raw entries
  const rawEntries: { day: string; count: number }[] = [];

  const extractItem = (itemObj: Record<string, unknown>, fallbackKey?: string) => {
    const rawDay =
      itemObj.period ??
      itemObj.day ??
      itemObj.date ??
      itemObj.dayOfWeek ??
      itemObj.month ??
      itemObj.week ??
      itemObj.label ??
      itemObj.name ??
      itemObj.time ??
      itemObj._id ??
      fallbackKey;

    const rawVal =
      itemObj.count ??
      itemObj.ticketsSold ??
      itemObj.attendance ??
      itemObj.tickets ??
      itemObj.total ??
      itemObj.value ??
      itemObj.amount ??
      itemObj.revenue;

    const count = Number(rawVal ?? 0);
    if (rawDay !== undefined && rawDay !== null && String(rawDay).trim() !== "") {
      rawEntries.push({ day: String(rawDay).trim(), count });
    }
  };

  if (Array.isArray(source)) {
    for (const item of source) {
      if (item && typeof item === "object") {
        extractItem(item as Record<string, unknown>);
      }
    }
  } else if (source && typeof source === "object") {
    const dataObj = source as Record<string, unknown>;
    for (const [key, val] of Object.entries(dataObj)) {
      if (
        key !== "status" &&
        key !== "message" &&
        key !== "success" &&
        key !== "insights"
      ) {
        if (typeof val === "number") {
          rawEntries.push({ day: key, count: val });
        } else if (val && typeof val === "object") {
          extractItem(val as Record<string, unknown>, key);
        }
      }
    }
  }

  // 3. Determine if dataset is pure weekdays or multi-day time series
  const isPureWeekdayData =
    rawEntries.length > 0 &&
    rawEntries.length <= 7 &&
    rawEntries.every((e) => {
      const lower = e.day.toLowerCase();
      if (DAY_NAME_MAP[lower]) return true;
      const num = Number(e.day);
      return !isNaN(num) && num >= 1 && num <= 7;
    });

  const shouldNormalizeToWeekdays =
    (selectedRange === "Last 7 Days" && (isPureWeekdayData || rawEntries.length <= 7)) ||
    isPureWeekdayData;

  const formatDateLabel = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (DAY_NAME_MAP[lower]) return DAY_NAME_MAP[lower];

    // Check if ISO/parseable date
    if (!isNaN(Date.parse(raw)) && (raw.includes("-") || raw.includes("/") || raw.length > 6)) {
      const d = new Date(raw);
      if (selectedRange === "Last Year" || selectedRange === "All Time") {
        return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      }
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    return raw;
  };

  let finalItems: { day: string; count: number }[] = [];

  if (shouldNormalizeToWeekdays && rawEntries.length > 0) {
    const dayCounts: Record<string, number> = {};
    for (const entry of rawEntries) {
      const lower = entry.day.toLowerCase().trim();
      let dayKey = DAY_NAME_MAP[lower];
      if (!dayKey) {
        const num = Number(entry.day);
        if (!isNaN(num) && num >= 1 && num <= 7) {
          dayKey = JS_DAYS[num - 1]; // Mongo $dayOfWeek 1=Sun
        } else if (!isNaN(Date.parse(entry.day))) {
          dayKey = JS_DAYS[new Date(entry.day).getDay()];
        }
      }
      if (dayKey && STANDARD_DAYS.includes(dayKey)) {
        dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + entry.count;
      }
    }
    finalItems = STANDARD_DAYS.map((day) => ({
      day,
      count: dayCounts[day] ?? 0,
    }));
  } else if (rawEntries.length > 0) {
    finalItems = rawEntries.map((item) => ({
      day: formatDateLabel(item.day),
      count: item.count,
    }));
  } else if (selectedRange === "Last 7 Days") {
    // Graceful default for weekly when no data yet
    finalItems = STANDARD_DAYS.map((day) => ({ day, count: 0 }));
  }

  const maxVal = finalItems.reduce((max, d) => Math.max(max, d.count), 0);
  const minFloor = maxVal > 0 ? Math.max(maxVal * 0.04, 1) : 1;

  const chartData: AttendanceByDayItem[] = finalItems.map((item) => ({
    ...item,
    displayCount: item.count > 0 ? Math.max(item.count, minFloor) : 0,
  }));

  const yMax = yAxisMax ?? (maxVal > 0 ? Math.ceil(maxVal * 1.25) : 10);
  const itemCount = chartData.length;
  const dynamicBarWidth =
    itemCount <= 7 ? 32 : itemCount <= 14 ? 20 : itemCount <= 31 ? 10 : 6;
  const showTopLabels = itemCount <= 10;
  const rotateXLabels = itemCount > 12;

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(243, 244, 246, 0.6)",
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
        const item = chartData[params[0].dataIndex];
        if (!item) return "";
        return `
          <div style="font-weight: 600; margin-bottom: 4px; color: #FFFFFF;">${item.day}</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${barColor};"></span>
            <span>Attendees: <strong>${Number(item.count).toLocaleString()}</strong></span>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #9CA3AF;">Filter: ${selectedRange}</div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "3%",
      top: "14%",
      bottom: rotateXLabels ? "16%" : "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.map((d) => d.day),
      name: `Filter: ${selectedRange}`,
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
      max: yMax,
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
        formatter: (val: number) => Number(val).toLocaleString(),
      },
    },
    series: [
      {
        name: "Attendance",
        type: "bar",
        barWidth: dynamicBarWidth,
        barMinHeight: 6,
        showBackground: true,
        backgroundStyle: {
          color: "#F0F4FA",
          borderRadius: [8, 8, 0, 0],
        },
        itemStyle: {
          color: barColor,
          borderRadius: [8, 8, 0, 0],
        },
        data: chartData.map((item) => ({
          value: item.displayCount ?? item.count,
          originalValue: item.count,
        })),
        label: {
          show: showTopLabels,
          position: "top",
          distance: 6,
          color: barColor,
          fontWeight: 700,
          fontSize: 12,
          formatter: (params) => {
            const original = chartData[params.dataIndex]?.count;
            return original !== undefined && original !== null && original > 0
              ? Number(original).toLocaleString()
              : "";
          },
        },
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-80 flex flex-col justify-between relative">
      {/* Top Filter by Period Dropdown Button */}
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
              <span className="font-bold text-[#2E0F74]">{selectedRange}</span>
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
                      setSelectedRange(range);
                      setIsDropdownOpen(false);
                      onPeriodChange?.(range);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors ${
                      selectedRange === range
                        ? "text-[#2E0F74] font-bold bg-[#2E0F74]/5"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{range}</span>
                    {selectedRange === range && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E0F74]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
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
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: barColor }}
              />
              <span className="text-xs font-semibold text-gray-700">
                Attendance
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-full text-xs">
              <span className="text-gray-500 font-medium">Filter Type:</span>
              <span className="font-bold text-[#2E0F74]">{selectedRange}</span>
            </div>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}
