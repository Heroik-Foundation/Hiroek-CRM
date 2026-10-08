import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LoadingLayout } from "../../layout";

export interface AcquisitionChannelItem {
  channel: string;
  joined: number;
  attended?: number;
  [key: string]: unknown;
}

export interface AcquisitionChannelProps {
  data?: unknown;
  isLoading?: boolean;
  height?: number;
  joinedColor?: string;
  attendedColor?: string;
  showLegend?: boolean;
  legendLabel?: string;
}

export default function AcquisitionChannel({
  data: propData,
  isLoading = false,
  height = 280,
  joinedColor = "#FBA967",
  attendedColor = "#37137F",
  showLegend = true,
  legendLabel = "Last 30 Days",
}: AcquisitionChannelProps) {
  let rawItems: Record<string, unknown>[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData as Record<string, unknown>[];
  } else if (propData && typeof propData === "object") {
    const dataObj = propData as Record<string, unknown>;
    if (Array.isArray(dataObj.data)) {
      rawItems = dataObj.data as Record<string, unknown>[];
    } else {
      rawItems = Object.entries(dataObj).map(([key, val]) => ({
        channel: key,
        joined:
          typeof val === "number"
            ? val
            : Number(
                (val as Record<string, unknown>)?.joined ??
                  (val as Record<string, unknown>)?.views ??
                  0
              ),
        attended:
          typeof val === "object" && val !== null
            ? Number((val as Record<string, unknown>)?.attended ?? 0)
            : 0,
      }));
    }
  }

  const chartData: AcquisitionChannelItem[] = rawItems.map((item, index) => ({
    channel: String(item.channel ?? item.name ?? item.label ?? `Channel ${index + 1}`),
    joined: Number(item.joined ?? item.views ?? item.registered ?? 0),
    attended: item.attended !== undefined ? Number(item.attended) : undefined,
  }));

  const hasAttended = chartData.some((d) => d.attended !== undefined && d.attended > 0);
  const maxJoined = chartData.reduce((max, d) => Math.max(max, d.joined), 0);
  const maxAttended = chartData.reduce((max, d) => Math.max(max, d.attended ?? 0), 0);
  const maxValue = Math.max(maxJoined, maxAttended);
  const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.25) : 10;

  const seriesList: EChartsOption["series"] = [
    {
      name: "Joined",
      type: "bar",
      barWidth: hasAttended ? 18 : 28,
      barMinHeight: 6,
      itemStyle: {
        color: joinedColor,
        borderRadius: [8, 8, 0, 0],
      },
      data: chartData.map((d) => d.joined),
      label: {
        show: true,
        position: "top",
        color: joinedColor,
        fontWeight: 600,
        fontSize: 11,
        formatter: (params) => {
          const val = Number(params.value ?? 0);
          return val > 0 ? val.toLocaleString() : "";
        },
      },
    },
  ];

  if (hasAttended) {
    (seriesList as Array<Record<string, unknown>>).push({
      name: "Attended",
      type: "bar",
      barWidth: 18,
      barMinHeight: 6,
      itemStyle: {
        color: attendedColor,
        borderRadius: [8, 8, 0, 0],
      },
      data: chartData.map((d) => d.attended ?? 0),
      label: {
        show: true,
        position: "top",
        color: attendedColor,
        fontWeight: 600,
        fontSize: 11,
        formatter: (params: { value?: unknown }) => {
          const val = Number(params?.value ?? 0);
          return val > 0 ? val.toLocaleString() : "";
        },
      },
    });
  }

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
      data: chartData.map((d) => d.channel),
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
    series: seriesList,
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
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: joinedColor }}
              />
              <span className="text-xs font-semibold text-gray-700">Joined</span>
            </div>
            {hasAttended && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: attendedColor }}
                />
                <span className="text-xs font-semibold text-gray-700">Attended</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#7047EB]" />
              <span className="text-xs font-medium text-gray-400">{legendLabel}</span>
            </div>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}
