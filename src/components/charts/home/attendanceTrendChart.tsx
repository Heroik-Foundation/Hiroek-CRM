import { useRef, useState, useEffect } from "react";
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
  height,
  showLegend = true,
  legendLabel = "Last 30 Days",
  yAxisMax,
  curve = "natural",
  valueFormatter,
}: AttendanceTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: height ?? 280,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0) {
          setDimensions({
            width: clientWidth,
            height: height ?? (clientHeight > 140 ? clientHeight : 280),
          });
        }
      }
    };

    updateDimensions();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height: observedHeight } = entry.contentRect;
          if (width > 0) {
            setDimensions({
              width: Math.floor(width),
              height: height ?? (observedHeight > 140 ? Math.floor(observedHeight) : 280),
            });
          }
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [height]);

  const isMobile = dimensions.width > 0 ? dimensions.width < 540 : false;
  const isVerySmall = dimensions.width > 0 ? dimensions.width < 380 : false;

  const chartMargin = {
    left: isVerySmall ? 28 : isMobile ? 34 : 42,
    right: isVerySmall ? 6 : isMobile ? 12 : 18,
    top: 15,
    bottom: isMobile ? 22 : 28,
  };

  const dataSource =
    propData && typeof propData === "object" && !Array.isArray(propData) && propData.data !== undefined
      ? (Array.isArray(propData.data)
          ? propData.data
          : Array.isArray(propData.data.forecast)
          ? propData.data.forecast
          : Array.isArray(propData.data.trend)
          ? propData.data.trend
          : propData.data)
      : propData;

  let rawItems: any[] = [];
  if (Array.isArray(dataSource)) {
    rawItems = dataSource;
  } else if (dataSource && typeof dataSource === "object") {
    rawItems = Object.entries(dataSource)
      .filter(([key]) => key !== "status" && key !== "message")
      .map(([key, val]) => ({
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
    <div className="w-full h-full min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div
          ref={containerRef}
          className="w-full flex-1 min-h-[230px] sm:min-h-[270px] flex items-center justify-center relative min-w-0"
        >
          <LineChart
            dataset={chartData}
            width={dimensions.width > 0 ? dimensions.width : undefined}
            height={dimensions.height}
            margin={chartMargin}
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
                fontSize: isMobile ? 10 : 12,
                fill: "#6B7280",
              },
              "& .MuiChartsGrid-line": {
                stroke: "#F3F4F6",
                strokeDasharray: "4 4",
              },
              "& .MuiAreaElement-root": {
                opacity: 0.15,
                fill: color,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 2.5,
              },
              "& .MuiMarkElement-root": {
                scale: isMobile ? "0.7" : "0.85",
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