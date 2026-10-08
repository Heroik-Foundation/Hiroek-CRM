import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LoadingLayout } from "../../layout";

export interface FunnelItem {
  stage: string;
  percentage: number;
  [key: string]: unknown;
}

export interface ConversionFunnelChartProps {
  data?: unknown;
  isLoading?: boolean;
  color?: string;
  height?: number;
  footerText?: string;
  showFooter?: boolean;
  footerBadgeColor?: string;
}

export default function ConversionFunnelChart({
  data: propData,
  isLoading = false,
  color = "#2E0F74",
  height = 260,
  footerText,
  showFooter = true,
  footerBadgeColor = "#7D5DF6",
}: ConversionFunnelChartProps) {
  const dataSource =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    "data" in (propData as Record<string, unknown>)
      ? (propData as Record<string, unknown>).data
      : propData;

  let rawCustomers: number | undefined;
  let rawPurchases: number | undefined;
  let rawRepeat: number | undefined;

  if (dataSource && typeof dataSource === "object") {
    if (Array.isArray(dataSource)) {
      for (const item of dataSource) {
        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;
          const keyName = String(
            itemObj.stage ?? itemObj.label ?? itemObj.name ?? itemObj.key ?? ""
          ).toLowerCase();
          const val = Number(
            itemObj.percentage ?? itemObj.value ?? itemObj.count ?? itemObj.rate ?? 0
          );

          if (
            (keyName.includes("customer") && !keyName.includes("repeat")) ||
            keyName === "joined"
          ) {
            rawCustomers = val;
          } else if (keyName.includes("purchase") || keyName === "attended") {
            rawPurchases = val;
          } else if (keyName.includes("repeat")) {
            rawRepeat = val;
          }
        }
      }

      if (
        rawCustomers === undefined &&
        rawPurchases === undefined &&
        rawRepeat === undefined
      ) {
        const first = dataSource[0];
        if (first && typeof first === "object") {
          const firstObj = first as Record<string, unknown>;
          if (firstObj.customers !== undefined) rawCustomers = Number(firstObj.customers);
          if (firstObj.purchases !== undefined) rawPurchases = Number(firstObj.purchases);
          if (firstObj.repeatCustomers !== undefined)
            rawRepeat = Number(firstObj.repeatCustomers);
        }
      }
    } else {
      const dataObj = dataSource as Record<string, unknown>;

      const extractVal = (keys: string[]): number | undefined => {
        for (const k of keys) {
          if (dataObj[k] !== undefined && dataObj[k] !== null) {
            const val = dataObj[k];
            if (typeof val === "number") return val;
            if (typeof val === "object") {
              const o = val as Record<string, unknown>;
              return Number(o.percentage ?? o.value ?? o.count ?? o.rate ?? 0);
            }
            const num = Number(val);
            if (!isNaN(num)) return num;
          }
        }
        return undefined;
      };

      rawCustomers = extractVal(["customers", "customer", "joined", "totalCustomers"]);
      rawPurchases = extractVal(["purchases", "purchase", "attended", "ticketsSold"]);
      rawRepeat = extractVal(["repeatCustomers", "repeatCustomer", "repeat", "repeat_customers"]);
    }
  }

  const hasData =
    rawCustomers !== undefined ||
    rawPurchases !== undefined ||
    rawRepeat !== undefined;

  let chartData: FunnelItem[];

  if (hasData) {
    const c = rawCustomers ?? 0;
    const p = rawPurchases ?? 0;
    const r = rawRepeat ?? 0;

    let joinedPct: number;
    let attendedPct: number;
    let repeatPct: number;

    if (c > 0) {
      joinedPct = 100;
      attendedPct = Math.min(100, Math.max(0, Math.round((p / c) * 100)));
      repeatPct = Math.min(100, Math.max(0, Math.round((r / c) * 100)));
    } else if (p > 0 || r > 0) {
      joinedPct = 100;
      attendedPct = Math.min(100, Math.max(0, Math.round(p)));
      repeatPct = Math.min(100, Math.max(0, Math.round(r)));
    } else {
      joinedPct = 0;
      attendedPct = 0;
      repeatPct = 0;
    }

    chartData = [
      { stage: "Joined", percentage: joinedPct, count: c },
      { stage: "Attended", percentage: attendedPct, count: p },
      { stage: "Repeat", percentage: repeatPct, count: r },
    ];
  } else {
    chartData = [];
  }

  const attendedItem = chartData.find(
    (d) => d.stage.toLowerCase() === "attended"
  );
  const attendedRate = attendedItem ? attendedItem.percentage : 65;
  const effectiveFooterText =
    footerText ?? `${attendedRate}% join-to-attend rate`;

  const stages = chartData.map((d) => d.stage);
  const values = chartData.map((d) => ({
    value: Math.min(Math.max(d.percentage, 0), 100),
    originalCount: d.count,
  }));

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#1F2937",
      borderColor: "#374151",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: "#F9FAFB", fontSize: 12 },
      formatter: (params) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const item = chartData[params[0].dataIndex];
        if (!item) return "";
        return `
          <div style="font-weight: 600; margin-bottom: 4px; color: #FFFFFF;">${item.stage}</div>
          <div>Percentage: <strong>${item.percentage}%</strong></div>
          ${item.count !== undefined ? `<div>Count: <strong>${Number(item.count).toLocaleString()}</strong></div>` : ""}
        `;
      },
    },
    grid: {
      left: "4%",
      right: "6%",
      top: "16%",
      bottom: "6%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      position: "top",
      min: 0,
      max: 100,
      interval: 20,
      splitLine: {
        show: true,
        lineStyle: {
          color: "#E5E7EB",
          type: "dashed",
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#4B5563",
        fontSize: 12,
        fontWeight: 700,
      },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: stages,
      axisLine: {
        show: true,
        lineStyle: { color: "#4B5563", width: 1.5 },
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#4B5563",
        fontSize: 13,
        fontWeight: 700,
        margin: 16,
      },
    },
    series: [
      {
        name: "Conversion",
        type: "bar",
        barWidth: 32,
        barMinHeight: 6,
        data: values.map((v) => ({
          value: v.value,
          itemStyle: {
            color,
            borderRadius: [0, 16, 16, 0],
          },
        })),
        label: {
          show: true,
          position: "insideRight",
          distance: 12,
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: 13,
          formatter: (params) => {
            const val = Number(params.value ?? 0);
            return val > 0 ? `${val}%` : "";
          },
        },
      },
    ],
  };

  return (
    <div className="w-full flex flex-col justify-between py-1">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full">
          <ReactECharts
            option={option}
            style={{ height, width: "100%" }}
            opts={{ renderer: "svg" }}
            notMerge={true}
          />
        </div>

        {showFooter && chartData.length > 0 && (
          <div className="flex items-center justify-center gap-2.5 mt-4 sm:mt-5">
            <span
              className="w-4 h-4 rounded-xs shrink-0"
              style={{ backgroundColor: footerBadgeColor }}
            />
            <span className="text-sm sm:text-base font-bold text-[#4B5563]">
              {effectiveFooterText}
            </span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}