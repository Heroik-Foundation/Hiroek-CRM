import { BarChart } from "@mui/x-charts/BarChart";
import { LoadingLayout } from "../../layout";

export interface FunnelItem {
  stage: string;
  percentage: number;
  [key: string]: any;
}

export interface ConversionFunnelChartProps {
  data?: any;
  isLoading?: boolean;
  color?: string;
  height?: number;
  footerText?: string;
  showFooter?: boolean;
}

export default function ConversionFunnelChart({
  data: propData,
  isLoading = false,
  color = "#37137F",
  height = 220,
  footerText,
  showFooter = true,
}: ConversionFunnelChartProps) {
  let rawItems: any[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData;
  } else if (propData && typeof propData === "object") {
    if (Array.isArray(propData.data)) {
      rawItems = propData.data;
    } else {
      rawItems = Object.entries(propData).map(([key, val]) => ({
        stage: key.charAt(0).toUpperCase() + key.slice(1),
        percentage:
          typeof val === "number"
            ? val
            : Number((val as any)?.percentage ?? (val as any)?.value ?? (val as any)?.rate ?? 0),
      }));
    }
  }

  const chartData: FunnelItem[] = rawItems.map((item: any, index: number) => ({
    stage: item.stage ?? item.label ?? item.name ?? `Stage ${index + 1}`,
    percentage: Number(item.percentage ?? item.value ?? item.rate ?? 0),
  }));

  return (
    <div className="w-full h-full min-h-60 flex flex-col justify-between">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
          <BarChart
            dataset={chartData}
            layout="horizontal"
            height={height}
            margin={{
              left: 70,
              right: 30,
              top: 30,
              bottom: 10,
            }}
            xAxis={[
              {
                min: 0,
                max: 100,
                position: "top",
                valueFormatter: (val: number | null) => `${val ?? 0}`,
              },
            ]}
            yAxis={[
              {
                scaleType: "band",
                dataKey: "stage",
              },
            ]}
            series={[
              {
                dataKey: "percentage",
                label: "Conversion",
                color,
                valueFormatter: (value) => `${value ?? 0}%`,
                barLabel: (item) => `${item.value}%`,
              },
            ]}
            borderRadius={10}
            grid={{
              vertical: true,
              horizontal: false,
            }}
            sx={{
              width: "100%",
              height: "100%",
              "& .MuiChartsAxis-tickLabel": {
                fontSize: 12,
                fill: "#6B7280",
              },
              "& .MuiChartsGrid-line": {
                stroke: "#F3F4F6",
                strokeDasharray: "4 4",
              },
              "& .MuiChartsLegend-root": {
                display: "none",
              },
              "& .MuiBarLabel-root": {
                fill: "#fff",
                fontSize: 12,
                fontWeight: 700,
              },
            }}
          />
        </div>

        {showFooter && footerText && chartData.length > 0 && (
          <div className="w-full flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs font-medium text-gray-500">{footerText}</span>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}