import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";
import { LoadingLayout } from "../../layout";

export interface GenderSplitItem {
  label: string;
  value: number;
  color?: string;
  displayValue?: number;
  [key: string]: unknown;
}

export interface GenderSplitChartProps {
  data?: unknown;
  isLoading?: boolean;
  height?: number;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  barColor?: string;
  borderRadius?: number;
}

const GENDER_PALETTES: Record<string, { base: string; highlight: string; shadow: string }> = {
  male: { base: "#4D90E6", highlight: "#78B2FA", shadow: "#3374C9" },
  men: { base: "#4D90E6", highlight: "#78B2FA", shadow: "#3374C9" },
  m: { base: "#4D90E6", highlight: "#78B2FA", shadow: "#3374C9" },
  female: { base: "#FFA7A0", highlight: "#FFC2BD", shadow: "#E88780" },
  women: { base: "#FFA7A0", highlight: "#FFC2BD", shadow: "#E88780" },
  f: { base: "#FFA7A0", highlight: "#FFC2BD", shadow: "#E88780" },
  "prefer not to say": { base: "#604D8C", highlight: "#7E69B0", shadow: "#483670" },
  prefer_not_to_say: { base: "#604D8C", highlight: "#7E69B0", shadow: "#483670" },
  other: { base: "#604D8C", highlight: "#7E69B0", shadow: "#483670" },
};

export default function GenderSplitChart({
  data: propData,
  isLoading = false,
  height = 280,
  showLegend = true,
  legendLabel = "2026",
  yAxisMax,
  barColor,
  borderRadius = 14,
}: GenderSplitChartProps) {
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
            itemObj.gender ??
            itemObj.label ??
            itemObj.name ??
            itemObj.category ??
            itemObj.range ??
            itemObj._id ??
            ""
          ).trim();
          const val = Number(
            itemObj.count ??
            itemObj.value ??
            itemObj.ticketsSold ??
            itemObj.attendance ??
            itemObj.amount ??
            itemObj.revenue ??
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
              valObj.count ??
              valObj.value ??
              valObj.ticketsSold ??
              valObj.attendance ??
              valObj.amount ??
              0
            );
          }
          rawEntries.push({ label: key.trim(), value: num });
        }
      }
    }
  }

  // Format gender labels and assign colors
  const formattedItems = rawEntries.map((item, index) => {
    const lower = item.label.toLowerCase();
    let displayLabel = item.label;
    if (lower === "male" || lower === "men" || lower === "m") {
      displayLabel = "Male";
    } else if (lower === "female" || lower === "women" || lower === "f") {
      displayLabel = "Female";
    } else if (lower.includes("prefer") || lower === "other") {
      displayLabel = "Prefer Not To Say";
    }

    const palette =
      GENDER_PALETTES[lower] ??
      (index === 0
        ? GENDER_PALETTES.male
        : index === 1
          ? GENDER_PALETTES.female
          : GENDER_PALETTES["prefer not to say"]);

    return {
      label: displayLabel,
      value: item.value,
      color: barColor ?? palette.base,
      highlight: palette.highlight,
      shadow: palette.shadow,
    };
  });

  // Reorder standard genders if present (Male, Female, Prefer Not To Say)
  const hasMale = formattedItems.some((d) => d.label === "Male");
  const hasFemale = formattedItems.some((d) => d.label === "Female");

  let orderedItems: typeof formattedItems = [];
  if (hasMale || hasFemale) {
    const male = formattedItems.find((d) => d.label === "Male");
    const female = formattedItems.find((d) => d.label === "Female");
    const other = formattedItems.find((d) => d.label === "Prefer Not To Say");

    if (male) orderedItems.push(male);
    if (female) orderedItems.push(female);
    if (other) orderedItems.push(other);

    for (const it of formattedItems) {
      if (
        it.label !== "Male" &&
        it.label !== "Female" &&
        it.label !== "Prefer Not To Say"
      ) {
        orderedItems.push(it);
      }
    }
  } else {
    orderedItems = formattedItems;
  }

  const maxVal = orderedItems.reduce((max, d) => Math.max(max, d.value), 0);
  const minFloor = maxVal > 0 ? Math.max(maxVal * 0.04, 1) : 1;

  const chartData: GenderSplitItem[] = orderedItems.map((item) => ({
    ...item,
    displayValue: item.value > 0 ? Math.max(item.value, minFloor) : 0,
  }));

  const yMax = yAxisMax ?? (maxVal > 0 ? Math.ceil(maxVal * 1.25) : 10);

  // ECharts Option
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
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${item.color};"></span>
            <span>Count: <strong>${Number(item.value).toLocaleString()}</strong></span>
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
        name: "Gender Split",
        type: "bar",
        barWidth: chartData.length <= 3 ? 46 : 32,
        barMinHeight: 10,
        data: chartData.map((item, index) => {
          const itemColor = item.color ?? "#4D90E6";
          const highlight = orderedItems[index]?.highlight ?? itemColor;
          const shadow = orderedItems[index]?.shadow ?? itemColor;

          return {
            value: item.displayValue ?? item.value,
            originalValue: item.value,
            itemStyle: {
              // 3D Cylinder / Capsule visual styling with directional gradient
              color: barColor
                ? barColor
                : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: shadow },
                  { offset: 0.45, color: highlight },
                  { offset: 0.85, color: itemColor },
                  { offset: 1, color: shadow },
                ]),
              borderRadius: [borderRadius, borderRadius, borderRadius, borderRadius],
              shadowColor: "rgba(0, 0, 0, 0.08)",
              shadowBlur: 6,
              shadowOffsetY: 3,
            },
          };
        }),
        label: {
          show: true,
          position: "top",
          distance: 8,
          color: "#37137F",
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
          <div className="w-full flex items-center justify-center gap-6 pt-2 border-t border-gray-100">
            {/* {chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-gray-700">
                  {item.label}: {Number(item.value).toLocaleString()}
                </span>
              </div>
            ))} */}
            {legendLabel && (
              <span className="text-xs font-medium text-gray-400">
                ({legendLabel})
              </span>
            )}
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}