import { LineChart } from "@mui/x-charts/LineChart";
import { LoadingLayout } from "../../layout";

export interface AttendanceTrendItem {
  month?: string;
  label?: string;
  attendance?: number;
  revenue?: number;
  value?: number;
  forecast?: number;
  [key: string]: any;
}

export interface AttendanceTrendChartProps {
  data?: any;
  isLoading?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  label?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  legendLabel?: string;
  yAxisMax?: number;
  curve?: "natural" | "linear" | "monotoneX" | "step";
  valueFormatter?: (value: number | null) => string;
}

export default function AttendanceTrendChart({
  data: propData,
  isLoading = false,
  dataKey = "attendance",
  xAxisKey = "month",
  label = "Attendance",
  color = "#7047EB",
  height = 240,
  showLegend = true,
  legendLabel = "Last 30 Days",
  yAxisMax,
  curve = "natural",
  valueFormatter,
}: AttendanceTrendChartProps) {
  let rawItems: any[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData;
  } else if (propData && typeof propData === "object") {
    if (Array.isArray(propData.data)) {
      rawItems = propData.data;
    } else {
      rawItems = Object.entries(propData).map(([key, val]) => ({
        [xAxisKey]: key,
        [dataKey]:
          typeof val === "number"
            ? val
            : Number(
                (val as any)?.attendance ??
                  (val as any)?.revenue ??
                  (val as any)?.forecast ??
                  (val as any)?.projected ??
                  (val as any)?.value ??
                  0
              ),
      }));
    }
  }

  const chartData: AttendanceTrendItem[] = rawItems.map((item: any, index: number) => ({
    ...item,
    [xAxisKey]:
      item[xAxisKey] ??
      item.label ??
      item.date ??
      item.period ??
      item.month ??
      `Period ${index + 1}`,
    [dataKey]: Number(
      item[dataKey] ??
        item.revenue ??
        item.forecast ??
        item.projected ??
        item.attendance ??
        item.value ??
        0
    ),
  }));

  const maxValue = chartData.reduce(
    (max, d) => Math.max(max, Number(d[dataKey] ?? 0)),
    0
  );
  const computedYMax = yAxisMax ?? (maxValue > 0 ? undefined : 100);

  const defaultValueFormatter = (val: number | null) => {
    if (dataKey === "revenue" || label.toLowerCase().includes("revenue")) {
      return `£${Number(val ?? 0).toLocaleString()}`;
    }
    return `${val ?? 0}`;
  };

  return (
    <div className="w-full h-full min-h-60 flex flex-col justify-between">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
          <LineChart
            dataset={chartData}
            height={height}
            margin={{
              left: 45,
              right: 20,
              top: 20,
              bottom: 25,
            }}
            xAxis={[
              {
                scaleType: "point",
                dataKey: xAxisKey,
              },
            ]}
            yAxis={[
              {
                min: 0,
                ...(computedYMax ? { max: computedYMax } : {}),
                valueFormatter: (val: number | null) => {
                  if (dataKey === "revenue" || label.toLowerCase().includes("revenue")) {
                    return `${Number(val ?? 0).toLocaleString()}`;
                  }
                  return `${val ?? 0}`;
                },
              },
            ]}
            series={[
              {
                dataKey,
                label,
                color,
                area: true,
                showMark: true,
                curve,
                valueFormatter: valueFormatter ?? defaultValueFormatter,
              },
            ]}
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
              "& .MuiAreaElement-root": {
                opacity: 0.12,
                fill: color,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
              "& .MuiMarkElement-root": {
                scale: "0.8",
                fill: "#1E1E1E",
                stroke: "#fff",
                strokeWidth: 1.5,
              },
            }}
          />
        </div>

        {showLegend && chartData.length > 0 && (
          <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1E1E1E" }} />
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <span className="text-xs font-medium text-gray-500">{legendLabel}</span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}