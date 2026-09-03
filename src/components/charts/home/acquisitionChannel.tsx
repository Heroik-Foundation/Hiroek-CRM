import { BarChart } from "@mui/x-charts/BarChart";
import { LoadingLayout } from "../../layout";

export interface AcquisitionChannelItem {
  channel: string;
  joined: number;
  attended?: number;
  [key: string]: any;
}

export interface AcquisitionChannelProps {
  data?: any;
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
  let rawItems: any[] = [];
  if (Array.isArray(propData)) {
    rawItems = propData;
  } else if (propData && typeof propData === "object") {
    if (Array.isArray(propData.data)) {
      rawItems = propData.data;
    } else {
      rawItems = Object.entries(propData).map(([key, val]) => ({
        channel: key,
        joined:
          typeof val === "number"
            ? val
            : Number((val as any)?.joined ?? (val as any)?.views ?? 0),
        attended: typeof val === "object" ? Number((val as any)?.attended ?? 0) : 0,
      }));
    }
  }

  const chartData: AcquisitionChannelItem[] = rawItems.map((item: any, index: number) => ({
    channel: item.channel ?? item.name ?? item.label ?? `Channel ${index + 1}`,
    joined: Number(item.joined ?? item.views ?? item.registered ?? 0),
    attended: item.attended !== undefined ? Number(item.attended) : undefined,
  }));

  const hasAttended = chartData.some((d) => d.attended !== undefined && d.attended > 0);
  const maxJoined = chartData.reduce((max, d) => Math.max(max, d.joined), 0);
  const maxAttended = chartData.reduce((max, d) => Math.max(max, d.attended ?? 0), 0);
  const maxValue = Math.max(maxJoined, maxAttended);
  const leftAxisMax = maxValue > 0 ? undefined : 10;

  const series = [
    {
      dataKey: "joined",
      label: "Joined",
      color: joinedColor,
      yAxisId: "leftAxis",
      valueFormatter: (value: number | null) => `${value ?? 0} users`,
    },
    ...(hasAttended
      ? [
          {
            dataKey: "attended",
            label: "Attended",
            color: attendedColor,
            yAxisId: "leftAxis",
            valueFormatter: (value: number | null) => `${value ?? 0} users`,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full h-full min-h-80 flex flex-col justify-between">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div className="w-full flex-1">
          <BarChart
            dataset={chartData}
            height={height}
            margin={{
              left: 40,
              right: 20,
              top: 20,
              bottom: 30,
            }}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "channel",
              },
            ]}
            yAxis={[
              {
                id: "leftAxis",
                min: 0,
                ...(leftAxisMax ? { max: leftAxisMax } : {}),
              },
            ]}
            series={series}
            borderRadius={8}
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
          <div className="w-full flex items-center justify-center gap-6 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: joinedColor }} />
              <span className="text-xs font-medium text-gray-600">Joined</span>
            </div>
            {hasAttended && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: attendedColor }}
                />
                <span className="text-xs font-medium text-gray-600">Attended</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#7047EB]" />
              <span className="text-xs font-medium text-gray-500">{legendLabel}</span>
            </div>
          </div>
        )}
      </LoadingLayout>
    </div>
  );
}
