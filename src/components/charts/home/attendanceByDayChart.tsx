import { useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useAtom } from "jotai";
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
}: AttendanceByDayChartProps) {
  const [selectedRange, setSelectedRange] = useAtom(periodAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ranges = ["Last 7 Days", "Last 14 Days", "Last 30 Days"];

  const dataSource =
    propData &&
      typeof propData === "object" &&
      !Array.isArray(propData) &&
      "data" in (propData as Record<string, unknown>)
      ? (propData as Record<string, unknown>).data
      : propData;

  const rawEntries: { day: string; count: number }[] = [];
  const dayCounts: Record<string, number> = {};
  let detectedWeekdays = false;

  const processDayEntry = (rawDay: unknown, rawVal: unknown) => {
    let dayKey = "";
    if (typeof rawDay === "string") {
      const lower = rawDay.toLowerCase().trim();
      dayKey = DAY_NAME_MAP[lower] ?? "";

      if (!dayKey && !isNaN(Date.parse(rawDay))) {
        const d = new Date(rawDay);
        dayKey = JS_DAYS[d.getDay()];
      }
    } else if (typeof rawDay === "number") {
      if (rawDay >= 1 && rawDay <= 7) {
        dayKey = JS_DAYS[rawDay - 1]; // Mongo $dayOfWeek 1=Sun
      } else if (rawDay >= 0 && rawDay <= 6) {
        dayKey = JS_DAYS[rawDay];
      }
    }

    const count = Number(rawVal ?? 0);

    if (dayKey && STANDARD_DAYS.includes(dayKey)) {
      dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + count;
      detectedWeekdays = true;
    } else if (rawDay !== undefined && rawDay !== null) {
      rawEntries.push({ day: String(rawDay), count });
    }
  };

  if (dataSource && typeof dataSource === "object") {
    if (Array.isArray(dataSource)) {
      for (const item of dataSource) {
        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;
          const rawDay =
            itemObj.day ??
            itemObj.date ??
            itemObj.dayOfWeek ??
            itemObj.label ??
            itemObj.name ??
            itemObj._id;
          const rawVal =
            itemObj.count ??
            itemObj.ticketsSold ??
            itemObj.attendance ??
            itemObj.tickets ??
            itemObj.value ??
            itemObj.amount;
          processDayEntry(rawDay, rawVal);
        }
      }
    } else {
      const dataObj = dataSource as Record<string, unknown>;
      for (const [key, val] of Object.entries(dataObj)) {
        if (
          key !== "status" &&
          key !== "message" &&
          key !== "success" &&
          key !== "insights"
        ) {
          let num = 0;
          if (typeof val === "number") {
            num = val;
          } else if (val && typeof val === "object") {
            const valObj = val as Record<string, unknown>;
            num = Number(
              valObj.count ??
              valObj.ticketsSold ??
              valObj.attendance ??
              valObj.value ??
              0
            );
          }
          processDayEntry(key, num);
        }
      }
    }
  }

  let finalItems: { day: string; count: number }[] = [];

  if (detectedWeekdays) {
    finalItems = STANDARD_DAYS.map((day) => ({
      day,
      count: dayCounts[day] ?? 0,
    }));
  } else if (rawEntries.length > 0) {
    finalItems = rawEntries;
  }

  const maxVal = finalItems.reduce((max, d) => Math.max(max, d.count), 0);
  const minFloor = maxVal > 0 ? Math.max(maxVal * 0.04, 1) : 1;

  const chartData: AttendanceByDayItem[] = finalItems.map((item) => ({
    ...item,
    displayCount: item.count > 0 ? Math.max(item.count, minFloor) : 0,
  }));

  const yMax = yAxisMax ?? (maxVal > 0 ? Math.ceil(maxVal * 1.25) : 10);

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
        `;
      },
    },
    grid: {
      left: "3%",
      right: "3%",
      top: "16%",
      bottom: "6%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.map((d) => d.day),
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { color: "#E5E7EB" },
      },
      axisLabel: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: 600,
        margin: 12,
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
        barWidth: chartData.length <= 7 ? 32 : 24,
        barMinHeight: 10,
        showBackground: true,
        backgroundStyle: {
          color: "#F0F4FA",
          borderRadius: [10, 10, 0, 0],
        },
        itemStyle: {
          color: barColor,
          borderRadius: [10, 10, 0, 0],
        },
        data: chartData.map((item) => ({
          value: item.displayCount ?? item.count,
          originalValue: item.count,
        })),
        label: {
          show: true,
          position: "top",
          distance: 8,
          color: barColor,
          fontWeight: 700,
          fontSize: 13,
          formatter: (params) => {
            const original = chartData[params.dataIndex]?.count;
            return original !== undefined && original !== null
              ? Number(original).toLocaleString()
              : "";
          },
        },
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-80 flex flex-col justify-between relative">
      {/* Top action filter button */}
      <div className="absolute -top-12 right-0 z-30">
        <div className="relative">

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              {ranges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setSelectedRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer ${selectedRange === range
                    ? "text-[#2E0F74] font-bold"
                    : "text-gray-700"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
          <ReactECharts
            option={option}
            style={{ height, width: "100%" }}
            opts={{ renderer: "svg" }}
            notMerge={true}
          />
        </div>

        {showLegend && chartData.length > 0 && (
          <div className="w-full flex items-center justify-center gap-2.5 pt-2 border-t border-gray-100">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: barColor }}
            />
            <span className="text-xs font-semibold text-gray-700">
              {selectedRange}
            </span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}
