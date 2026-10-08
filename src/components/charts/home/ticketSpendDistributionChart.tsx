import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LoadingLayout } from "../../layout";

export interface SpendDistributionItem {
  label: string;
  value: number;
  displayValue?: number;
  [key: string]: unknown;
}

export interface TicketSpendDistributionChartProps {
  data?: unknown;
  isLoading?: boolean;
  barColor?: string;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  height?: number;
  borderRadius?: number;
}

export default function TicketSpendDistributionChart({
  data: propData,
  isLoading = false,
  barColor = "#2E0F74",
  showLegend = true,
  legendLabel = "Last 30 Days",
  yAxisMax,
  height = 280,
  borderRadius = 10,
}: TicketSpendDistributionChartProps) {
  const dataSource =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    "data" in (propData as Record<string, unknown>)
      ? (propData as Record<string, unknown>).data
      : propData;

  const rawEntries: { label: string; value: number }[] = [];

  if (dataSource && typeof dataSource === "object") {
    if (Array.isArray(dataSource)) {
      for (const item of dataSource) {
        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;
          const label = String(
            itemObj.label ??
              itemObj.range ??
              itemObj.tier ??
              itemObj.name ??
              itemObj.category ??
              itemObj._id ??
              ""
          ).trim();
          const val = Number(
            itemObj.value ??
              itemObj.count ??
              itemObj.amount ??
              itemObj.ticketsSold ??
              itemObj.tickets ??
              itemObj.total ??
              0
          );
          if (label) {
            rawEntries.push({ label, value: val });
          }
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
              valObj.value ??
                valObj.count ??
                valObj.amount ??
                valObj.ticketsSold ??
                valObj.total ??
                0
            );
          }
          rawEntries.push({ label: key.trim(), value: num });
        }
      }
    }
  }

  const maxVal = rawEntries.reduce((max, d) => Math.max(max, d.value), 0);
  const minFloor = maxVal > 0 ? Math.max(maxVal * 0.04, 1) : 1;

  const chartData: SpendDistributionItem[] = rawEntries.map((item) => ({
    ...item,
    displayValue: item.value > 0 ? Math.max(item.value, minFloor) : 0,
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
          <div style="font-weight: 600; margin-bottom: 4px; color: #FFFFFF;">${item.label}</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${barColor};"></span>
            <span>Tickets: <strong>${Number(item.value).toLocaleString()}</strong></span>
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
      data: chartData.map((d) => d.label),
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
        name: "Ticket Spend",
        type: "bar",
        barWidth: chartData.length <= 5 ? 36 : 28,
        barMinHeight: 10,
        showBackground: true,
        backgroundStyle: {
          color: "#F0F4FA",
          borderRadius: [borderRadius, borderRadius, 0, 0],
        },
        itemStyle: {
          color: barColor,
          borderRadius: [borderRadius, borderRadius, 0, 0],
        },
        data: chartData.map((item) => ({
          value: item.displayValue ?? item.value,
          originalValue: item.value,
        })),
        label: {
          show: true,
          position: "top",
          distance: 8,
          color: barColor,
          fontWeight: 700,
          fontSize: 13,
          formatter: (params) => {
            const original = chartData[params.dataIndex]?.value;
            return original !== undefined && original !== null
              ? Number(original).toLocaleString()
              : "";
          },
        },
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-80 flex flex-col justify-between">
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
              {legendLabel}
            </span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}
