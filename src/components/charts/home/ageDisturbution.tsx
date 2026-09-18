import { PieChart, pieClasses } from "@mui/x-charts/PieChart";
import { LoadingLayout } from "../../layout";

export interface AgeDistributionItem {
  id?: number | string;
  label: string;
  value: number;
  color?: string;
}

export interface AgeDistributionChartProps {
  data?: any;
  isLoading?: boolean;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  valueFormatter?: (item: any) => string;
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
  innerRadius = 55,
  outerRadius = 100,
  valueFormatter,
}: AgeDistributionChartProps) {
  // Detect if incoming data is the Ticket Spend Distribution Stat (free/paid tickets)
  const statSource =
    propData && typeof propData === "object" && !Array.isArray(propData)
      ? (propData.data && typeof propData.data === "object" && !Array.isArray(propData.data)
          ? propData.data
          : propData)
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
            id: "paid",
            label: "Paid Tickets",
            value: Math.round(paidPct),
            color: "#37137F",
          },
          {
            id: "free",
            label: "Free Tickets",
            value: Math.round(freePct),
            color: "#FFA043",
          },
        ]
      : [];

    return (
      <div className="w-full h-full min-h-80 flex flex-col justify-between">
        <LoadingLayout loading={isLoading} length={pieSeriesData.length}>
          {/* Main Chart Row with Side Legend */}
          <div className="relative w-full flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center">
              <PieChart
                height={height}
                series={[
                  {
                    data: pieSeriesData,
                    innerRadius: 0,
                    outerRadius: 95,
                    paddingAngle: 1,
                    cornerRadius: 0,
                    arcLabel: (item) => (Number(item?.value ?? 0) > 0 ? `${item.label}\n${item.value}%` : ""),
                    arcLabelMinAngle: 20,
                    arcLabelRadius: "55%",
                    valueFormatter: (item: any) => {
                      const val = typeof item === "number" ? item : Number(item?.value ?? 0);
                      return `${val}%`;
                    },
                  },
                ]}
                sx={{
                  width: "100%",
                  height: "100%",
                  [`& .${pieClasses.arcLabel}`]: {
                    fill: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    textAnchor: "middle",
                    whiteSpace: "pre-line",
                  },
                  "& .MuiChartsLegend-root": {
                    display: "none",
                  },
                }}
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
      ? (propData.data && typeof propData.data === "object" && !Array.isArray(propData.data)
          ? propData.data
          : propData)
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

    const buckets: any[] = Array.isArray(freqSource.buckets) ? freqSource.buckets : [];
    const totalFreqVal = buckets.reduce(
      (sum, b) => sum + Number(b.percentage ?? b.count ?? 0),
      0
    );

    const pieSeriesData =
      totalFreqVal > 0
        ? buckets.map((b: any, index: number) => {
            const key = String(b.frequency ?? "").toLowerCase();
            const label = FREQ_LABELS[key] ?? b.label ?? `Bucket ${index + 1}`;
            const color = FREQ_COLORS[key] ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
            const value = Number(b.percentage ?? b.count ?? 0);
            return {
              id: b.frequency ?? index,
              label,
              value,
              color,
            };
          })
        : [];

    return (
      <div className="w-full h-full min-h-80 flex items-center justify-between">
        <LoadingLayout loading={isLoading} length={pieSeriesData.length}>
          <div className="flex-1 flex items-center justify-center">
            <PieChart
              height={height}
              series={[
                {
                  data: pieSeriesData,
                  innerRadius: 0,
                  outerRadius: 95,
                  paddingAngle: 1,
                  cornerRadius: 0,
                  arcLabel: (item: any) =>
                    Number(item?.value ?? 0) > 0 ? `${item.label}\n${item.value}%` : "",
                  arcLabelMinAngle: 20,
                  arcLabelRadius: "55%",
                  valueFormatter: (item: any) => {
                    const val = typeof item === "number" ? item : Number(item?.value ?? 0);
                    return `${val}%`;
                  },
                },
              ]}
              sx={{
                width: "100%",
                height: "100%",
                [`& .${pieClasses.arcLabel}`]: {
                  fill: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  textAnchor: "middle",
                  whiteSpace: "pre-line",
                },
                "& .MuiChartsLegend-root": {
                  display: "none",
                },
              }}
            />
          </div>

          {/* Right Side Legend */}
          <div className="flex flex-col gap-3 pr-6">
            {pieSeriesData.map((item: any) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  {item.label}
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
    propData && typeof propData === "object" && !Array.isArray(propData) && propData.data
      ? propData.data
      : propData;

  let rawItems: any[] = [];
  if (Array.isArray(normalSource)) {
    rawItems = normalSource;
  } else if (normalSource && typeof normalSource === "object") {
    rawItems = Object.entries(normalSource).map(([key, val], idx) => ({
      id: idx,
      label: key,
      value: typeof val === "number" ? val : Number((val as any)?.value ?? (val as any)?.count ?? (val as any)?.percentage ?? 0),
    }));
  }

  const chartData: AgeDistributionItem[] = rawItems.map((item: any, index: number) => ({
    id: item.id ?? item._id ?? index,
    label: item.label ?? item.age_group ?? item.range ?? item._id ?? `Group ${index + 1}`,
    value: Number(item.value ?? item.percentage ?? item.count ?? 0),
    color: item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length],
  }));

  const totalChartValue = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  const effectiveLength = totalChartValue > 0 ? chartData.length : 0;

  return (
    <div className="relative w-full h-full min-h-80 flex flex-col justify-center items-center">
      <LoadingLayout loading={isLoading} length={effectiveLength}>
        <div className="relative w-full h-75 flex items-center justify-center">
          <PieChart
            height={height}
            series={[
              {
                data: chartData,
                innerRadius,
                outerRadius,
                paddingAngle: 2,
                cornerRadius: 4,
                arcLabel: (item) => (Number(item?.value ?? 0) > 0 ? `${item.value}%` : ""),
                arcLabelMinAngle: 20,
                valueFormatter: (item: any) => {
                  if (valueFormatter) {
                    try {
                      const formatted = valueFormatter(
                        typeof item === "object" && item !== null
                          ? item
                          : { value: Number(item ?? 0) }
                      );
                      if (formatted && !formatted.includes("undefined")) return formatted;
                    } catch {
                      // fallback to standard format
                    }
                  }
                  const val = typeof item === "number" ? item : Number(item?.value ?? 0);
                  return `${val}%`;
                },
              },
            ]}
            sx={{
              width: "100%",
              height: "100%",
              [`& .${pieClasses.arcLabel}`]: {
                fill: "#fff",
                fontSize: 12,
                fontWeight: 700,
              },
              "& .MuiChartsLegend-root": {
                display: "none",
              },
            }}
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