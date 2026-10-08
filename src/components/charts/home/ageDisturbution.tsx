import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LoadingLayout } from "../../layout";

export interface AgeDistributionItem {
  id?: number | string;
  label: string;
  value: number;
  color?: string;
}

export interface AgeDistributionChartProps {
  data?: unknown;
  isLoading?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  valueFormatter?: (item: unknown) => string;
}

const DEFAULT_PALETTE = [
  "#7047EB", // violet
  "#FF6E6E", // coral
  "#22C5DD", // cyan
  "#FF9F43", // orange
  "#5E81F4", // blue
  "#10B981", // green
  "#F59E0B", // amber
];

export default function AgeDistributionChart({
  data: propData,
  isLoading = false,
  height = 240,
  innerRadius = 50,
  outerRadius = 90,
  valueFormatter,
}: AgeDistributionChartProps) {
  // Detect if incoming data is the Ticket Spend Distribution Stat (free/paid tickets)
  const statSource =
    propData && typeof propData === "object" && !Array.isArray(propData)
      ? (propData as Record<string, unknown>).data &&
        typeof (propData as Record<string, unknown>).data === "object" &&
        !Array.isArray((propData as Record<string, unknown>).data)
        ? ((propData as Record<string, unknown>).data as Record<string, unknown>)
        : (propData as Record<string, unknown>)
      : null;

  const isTicketSpendStat = Boolean(
    statSource &&
      ("freeTickets" in statSource ||
        "paidTickets" in statSource ||
        "freePercentage" in statSource ||
        "paidPercentage" in statSource)
  );

  if (isTicketSpendStat && statSource) {
    const freeCount = Number(statSource.freeTickets ?? 0);
    const paidCount = Number(statSource.paidTickets ?? 0);
    const totalCount = freeCount + paidCount;

    const freePct = Number(
      statSource.freePercentage ??
        (totalCount > 0 ? (freeCount / totalCount) * 100 : 0)
    );

    const paidPct = Number(
      statSource.paidPercentage ??
        (totalCount > 0 ? (paidCount / totalCount) * 100 : 0)
    );

    const hasData = totalCount > 0 || freePct > 0 || paidPct > 0;
    const pieSeriesData = hasData
      ? [
          {
            name: "Paid Tickets",
            value: Math.round(paidPct),
            itemStyle: { color: "#37137F" },
          },
          {
            name: "Free Tickets",
            value: Math.round(freePct),
            itemStyle: { color: "#FFA043" },
          },
        ]
      : [];

    const option: EChartsOption = {
      tooltip: {
        trigger: "item",
        backgroundColor: "#1F2937",
        borderColor: "#374151",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#F9FAFB", fontSize: 12 },
        formatter: "{b}: {c}%",
      },
      series: [
        {
          name: "Ticket Type",
          type: "pie",
          radius: "78%",
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "inside",
            formatter: (params) => {
              const val = Number(params.value ?? 0);
              return val > 0 ? `${params.name}\n${val}%` : "";
            },
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 11,
            lineHeight: 16,
          },
          data: pieSeriesData,
        },
      ],
    };

    return (
      <div className="w-full h-full min-h-80 flex flex-col justify-between">
        <LoadingLayout loading={isLoading} length={pieSeriesData.length}>
          {/* Main Chart Row with Side Legend */}
          <div className="relative w-full flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center">
              <ReactECharts
                option={option}
                style={{ height, width: "100%" }}
                opts={{ renderer: "svg" }}
                notMerge={true}
              />
            </div>

            {/* Right Side Legend */}
            <div className="flex flex-col gap-3 pr-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFA043] shrink-0" />
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  Free Tickets
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#37137F] shrink-0" />
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  Paid Tickets
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Summary Cards */}
          <div className="w-full grid grid-cols-2 gap-4 mt-2">
            <div className="bg-[#EFEBFA] rounded-2xl py-3 px-4 flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-[#5C4E7E] font-medium">Free Tickets</span>
              <span className="text-lg font-bold text-[#37137F]">
                {freeCount.toLocaleString()}
              </span>
            </div>
            <div className="bg-[#EFEBFA] rounded-2xl py-3 px-4 flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-[#5C4E7E] font-medium">Paid Tickets</span>
              <span className="text-lg font-bold text-[#37137F]">
                {paidCount.toLocaleString()}
              </span>
            </div>
          </div>
        </LoadingLayout>
      </div>
    );
  }

  // Detect if incoming data is Donor Frequency ({ totalDonors, buckets })
  const freqSource =
    propData && typeof propData === "object" && !Array.isArray(propData)
      ? (propData as Record<string, unknown>).data &&
        typeof (propData as Record<string, unknown>).data === "object" &&
        !Array.isArray((propData as Record<string, unknown>).data)
        ? ((propData as Record<string, unknown>).data as Record<string, unknown>)
        : (propData as Record<string, unknown>)
      : null;

  const isDonationFrequency =
    Boolean(freqSource && Array.isArray(freqSource.buckets));

  if (isDonationFrequency && freqSource) {
    const FREQ_COLORS: Record<string, string> = {
      "one-time": "#37137F",
      "2-3-times": "#E87063",
      "4-plus-times": "#22C5DD",
    };

    const FREQ_LABELS: Record<string, string> = {
      "one-time": "One-Time",
      "2-3-times": "2-3 Times",
      "4-plus-times": "4+ Times",
    };

    const buckets = Array.isArray(freqSource.buckets) ? freqSource.buckets : [];
    const totalFreqVal = buckets.reduce(
      (sum, b) =>
        sum +
        Number(
          (b as Record<string, unknown>).percentage ??
            (b as Record<string, unknown>).count ??
            0
        ),
      0
    );

    const pieSeriesData =
      totalFreqVal > 0
        ? buckets.map((b, index) => {
            const bObj = b as Record<string, unknown>;
            const key = String(bObj.frequency ?? "").toLowerCase();
            const label = FREQ_LABELS[key] ?? String(bObj.label ?? `Bucket ${index + 1}`);
            const color =
              FREQ_COLORS[key] ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
            const value = Number(bObj.percentage ?? bObj.count ?? 0);
            return {
              name: label,
              value,
              itemStyle: { color },
            };
          })
        : [];

    const option: EChartsOption = {
      tooltip: {
        trigger: "item",
        backgroundColor: "#1F2937",
        borderColor: "#374151",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#F9FAFB", fontSize: 12 },
        formatter: "{b}: {c}%",
      },
      series: [
        {
          name: "Frequency",
          type: "pie",
          radius: "78%",
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "inside",
            formatter: (params) => {
              const val = Number(params.value ?? 0);
              return val > 0 ? `${params.name}\n${val}%` : "";
            },
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 11,
            lineHeight: 16,
          },
          data: pieSeriesData,
        },
      ],
    };

    return (
      <div className="w-full h-full min-h-80 flex items-center justify-between">
        <LoadingLayout loading={isLoading} length={pieSeriesData.length}>
          <div className="flex-1 flex items-center justify-center">
            <ReactECharts
              option={option}
              style={{ height, width: "100%" }}
              opts={{ renderer: "svg" }}
              notMerge={true}
            />
          </div>

          {/* Right Side Legend */}
          <div className="flex flex-col gap-3 pr-6">
            {pieSeriesData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      typeof item.itemStyle?.color === "string"
                        ? item.itemStyle.color
                        : "#37137F",
                  }}
                />
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </LoadingLayout>
      </div>
    );
  }

  // Normal Age Distribution Chart
  const normalSource =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    (propData as Record<string, unknown>).data
      ? (propData as Record<string, unknown>).data
      : propData;

  let rawItems: Record<string, unknown>[] = [];
  if (Array.isArray(normalSource)) {
    rawItems = normalSource as Record<string, unknown>[];
  } else if (normalSource && typeof normalSource === "object") {
    rawItems = Object.entries(normalSource as Record<string, unknown>).map(
      ([key, val], idx) => ({
        id: idx,
        label: key,
        value:
          typeof val === "number"
            ? val
            : Number(
                (val as Record<string, unknown>)?.value ??
                  (val as Record<string, unknown>)?.count ??
                  (val as Record<string, unknown>)?.percentage ??
                  0
              ),
      })
    );
  }

  const chartData: AgeDistributionItem[] = rawItems.map((item, index) => ({
    id: (item.id ?? item._id ?? index) as string | number,
    label: String(
      item.label ??
        item.age_group ??
        item.range ??
        item._id ??
        `Group ${index + 1}`
    ),
    value: Number(item.value ?? item.percentage ?? item.count ?? 0),
    color: String(item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]),
  }));

  const totalChartValue = chartData.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );
  const effectiveLength = totalChartValue > 0 ? chartData.length : 0;

  const innerPct = `${Math.round((innerRadius / 120) * 100)}%`;
  const outerPct = `${Math.round((outerRadius / 120) * 100)}%`;

  const normalOption: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "#1F2937",
      borderColor: "#374151",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: "#F9FAFB", fontSize: 12 },
      formatter: (params) => {
        if (valueFormatter) {
          try {
            const formatted = valueFormatter(params);
            if (formatted) return formatted;
          } catch {
            // fallback
          }
        }
        const p = Array.isArray(params) ? params[0] : params;
        const name = (p as { name?: string })?.name ?? "";
        const val = (p as { value?: unknown })?.value ?? 0;
        return `${name}: <strong>${val}%</strong>`;
      },
    },
    series: [
      {
        name: "Age Distribution",
        type: "pie",
        radius: [innerPct, outerPct],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "inside",
          formatter: (params) => {
            const val = Number(params.value ?? 0);
            return val > 0 ? `${val}%` : "";
          },
          color: "#FFFFFF",
          fontWeight: "bold",
          fontSize: 11,
        },
        data: chartData.map((d) => ({
          name: d.label,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };

  return (
    <div className="relative w-full h-full min-h-80 flex flex-col justify-center items-center">
      <LoadingLayout loading={isLoading} length={effectiveLength}>
        <div className="relative w-full h-75 flex items-center justify-center">
          <ReactECharts
            option={normalOption}
            style={{ height, width: "100%" }}
            opts={{ renderer: "svg" }}
            notMerge={true}
          />
        </div>

        {chartData.length > 0 && (
          <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-gray-100">
            {chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500 font-medium">{item.label}:</span>
                  <span className="font-semibold text-gray-800">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}