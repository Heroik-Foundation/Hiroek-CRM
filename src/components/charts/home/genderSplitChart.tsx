import { BarChart } from "@mui/x-charts/BarChart";
import { LoadingLayout } from "../../layout";

export interface GenderSplitItem {
  label: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface GenderSplitChartProps {
  data?: any;
  isLoading?: boolean;
  height?: number;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  barColor?: string;
  borderRadius?: number;
}

const DEFAULT_GENDER_COLORS: Record<string, string> = {
  Male: "#5B9CF6",
  Female: "#FFA8B6",
  "Prefer Not To Say": "#8A60BA",
};

export default function GenderSplitChart({
  data: propData,
  isLoading = false,
  height = 280,
  showLegend = true,
  legendLabel = "Last 30 Days",
  yAxisMax,
  barColor,
  borderRadius = 14,
}: GenderSplitChartProps) {
  let rawItems: any[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData;
  } else if (propData && typeof propData === "object") {
    if (Array.isArray(propData.data)) {
      rawItems = propData.data;
    } else {
      rawItems = Object.entries(propData).map(([key, val]) => ({
        label: key,
        value: typeof val === "number" ? val : Number((val as any)?.value ?? 0),
      }));
    }
  }

  // Detect dataset type: spending ranges, tickets sold, revenue, or custom single barColor
  const isSpending =
    Boolean(barColor) ||
    (rawItems.length > 0 && rawItems.some((d: any) => String(d.label ?? "").includes("£")));

  const isAttendance = rawItems.some((d: any) => d.ticketsSold !== undefined);
  const isRevenue = rawItems.some((d: any) => d.revenue !== undefined);
  const isCustom = Boolean(barColor);

  const chartData: GenderSplitItem[] = rawItems.map((item: any, index: number) => {
    const label =
      item.label ??
      item.eventName ??
      item.category ??
      item.gender ??
      item.day ??
      item._id ??
      `Category ${index + 1}`;
    const val = Number(item.value ?? item.revenue ?? item.ticketsSold ?? item.count ?? 0);

    const color =
      isSpending || isAttendance || isRevenue || isCustom
        ? barColor ?? "#37137F"
        : item.color ??
          DEFAULT_GENDER_COLORS[label] ??
          ["#5B9CF6", "#FFA8B6", "#8A60BA"][index % 3];

    return {
      label,
      value: val,
      color,
    };
  });

  const labels = chartData.map((d) => d.label);
  const colors = chartData.map(
    (d) => d.color ?? (isSpending || isAttendance || isRevenue || isCustom ? barColor ?? "#37137F" : "#5B9CF6")
  );
  const maxValue = chartData.reduce((max, d) => Math.max(max, d.value), 0);
  const computedYMax = yAxisMax ?? (maxValue > 0 ? undefined : isSpending || isRevenue ? 100 : 10);

  return (
    <div className="w-full h-full min-h-80 flex flex-col justify-between">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
          <BarChart
            dataset={chartData}
            height={height}
            margin={{
              left: 45,
              right: 20,
              top: 20,
              bottom: 30,
            }}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "label",
                colorMap: {
                  type: "ordinal",
                  values: labels,
                  colors,
                },
              },
            ]}
            yAxis={[
              {
                min: 0,
                ...(computedYMax ? { max: computedYMax } : {}),
                valueFormatter: (val: number | null) => {
                  if (isRevenue || isSpending) {
                    return `${Number(val ?? 0).toLocaleString()}`;
                  }
                  return `${val ?? 0}`;
                },
              },
            ]}
            series={[
              {
                dataKey: "value",
                label: isRevenue || isSpending ? "Revenue" : isAttendance ? "Tickets Sold" : "Users",
                valueFormatter: (value) =>
                  isRevenue || isSpending
                    ? `£${Number(value ?? 0).toLocaleString()}`
                    : isAttendance
                    ? `${value ?? 0} tickets`
                    : `${value ?? 0} users`,
              },
            ]}
            borderRadius={borderRadius}
            grid={{
              horizontal: true,
              vertical: false,
            }}
            sx={{
              width: "100%",
              height: "100%",
              "& .MuiChartsLegend-root": {
                display: "none",
              },
              "& .MuiChartsAxis-tickLabel": {
                fontSize: 12,
                fill: "#6B7280",
              },
              "& .MuiChartsGrid-line": {
                stroke: "#F3F4F6",
                strokeDasharray: "4 4",
              },
            }}
          />
        </div>

        {showLegend && chartData.length > 0 && (
          <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor:
                  isSpending || isAttendance || isRevenue || isCustom
                    ? barColor ?? "#37137F"
                    : "#7047EB",
              }}
            />
            <span className="text-xs font-medium text-gray-500">{legendLabel}</span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}