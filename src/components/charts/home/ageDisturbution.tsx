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
  valueFormatter?: (item: { value: number }) => string;
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
  valueFormatter = (item: { value: number }) => `${item.value}%`,
}: AgeDistributionChartProps) {
  // Detect if incoming data is the Ticket Spend Distribution Stat (free/paid tickets)
  const isTicketSpendStat =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    ("freeTickets" in propData ||
      "paidTickets" in propData ||
      "freePercentage" in propData ||
      "paidPercentage" in propData);

  if (isTicketSpendStat) {
    const freeCount = Number(propData.freeTickets ?? 0);
    const paidCount = Number(propData.paidTickets ?? 0);
    const totalCount = freeCount + paidCount;

    const freePct = Number(
      propData.freePercentage ??
        (totalCount > 0 ? (freeCount / totalCount) * 100 : 0)
    );

    const paidPct = Number(
      propData.paidPercentage ??
        (totalCount > 0 ? (paidCount / totalCount) * 100 : 0)
    );

    const pieSeriesData = [
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
    ];

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
                    arcLabel: (item) => (item.value > 0 ? `${item.label}\n${item.value}%` : ""),
                    arcLabelMinAngle: 20,
                    arcLabelRadius: "55%",
                    valueFormatter: (item) => `${item.value}%`,
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
  const isDonationFrequency =
    propData &&
    typeof propData === "object" &&
    !Array.isArray(propData) &&
    Array.isArray(propData.buckets);

  if (isDonationFrequency) {
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

    const pieSeriesData = propData.buckets.map((b: any, index: number) => {
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
    });

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
                  arcLabel: (item) => (item.value > 0 ? `${item.label}\n${item.value}%` : ""),
                  arcLabelMinAngle: 20,
                  arcLabelRadius: "55%",
                  valueFormatter: (item) => `${item.value}%`,
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
  let rawItems: any[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData;
  } else if (propData && typeof propData === "object") {
    if (Array.isArray(propData.data)) {
      rawItems = propData.data;
    } else {
      rawItems = Object.entries(propData).map(([key, val], idx) => ({
        id: idx,
        label: key,
        value: typeof val === "number" ? val : Number((val as any)?.value ?? 0),
      }));
    }
  }

  const chartData: AgeDistributionItem[] = rawItems.map((item: any, index: number) => ({
    id: item.id ?? item._id ?? index,
    label: item.label ?? item.age_group ?? item.range ?? item._id ?? `Group ${index + 1}`,
    value: Number(item.value ?? item.percentage ?? item.count ?? 0),
    color: item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length],
  }));

  return (
    <div className="relative w-full h-full min-h-80 flex flex-col justify-center items-center">
      <LoadingLayout loading={isLoading} length={chartData.length}>
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
                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 20,
                valueFormatter,
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