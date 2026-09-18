import { LoadingLayout } from "../../layout";

export interface LocationItem {
  city?: string;
  category?: string;
  label?: string;
  name?: string;
  percentage?: number;
  value?: number;
  color?: string;
  isPeak?: boolean;
}

export interface AudienceLocationChartProps {
  data?: any;
  isLoading?: boolean;
  barColor?: string;
  trackColor?: string;
  unit?: string;
}

export default function AudienceLocationChart({
  data: propData,
  isLoading = false,
  barColor = "#37137F",
  trackColor = "bg-[#F3F4F6]",
  unit = "%",
}: AudienceLocationChartProps) {
  const dataSource =
    propData && typeof propData === "object" && !Array.isArray(propData) && propData.data !== undefined
      ? propData.data
      : propData;

  let rawItems: any[] = [];
  if (Array.isArray(dataSource)) {
    rawItems = dataSource;
  } else if (dataSource && typeof dataSource === "object") {
    rawItems = Object.entries(dataSource)
      .filter(([key]) => key !== "status" && key !== "message")
      .map(([key, val]) => ({
        city: key,
        percentage:
          typeof val === "number"
            ? val
            : Number((val as any)?.percentage ?? (val as any)?.value ?? (val as any)?.count ?? 0),
      }));
  }

  const chartData: LocationItem[] = rawItems.map((item: any) => ({
    city:
      item.city ??
      item.category ??
      item.label ??
      item.name ??
      item.location ??
      item._id ??
      "Unknown",
    percentage: Number(item.percentage ?? item.value ?? item.count ?? 0),
    color: item.isPeak ? "#37137F" : item.color,
    isPeak: Boolean(item.isPeak),
  }));

  const isScrollable = chartData.length > 5;

  return (
    <div className="w-full h-full min-h-60 flex flex-col justify-center">
      <LoadingLayout loading={isLoading} length={chartData.length}>
        <div
          className={`space-y-4 w-full py-1 ${
            isScrollable ? "max-h-72 overflow-y-auto pr-2" : ""
          }`}
        >
          {chartData.map((item, index) => {
            const cityName = item.city ?? item.label ?? `Item ${index + 1}`;
            const pct = Math.min(Math.max(item.percentage ?? 0, 0), 100);
            const fillStyle = item.color
              ? { backgroundColor: item.color, width: `${pct}%` }
              : { backgroundColor: barColor, width: `${pct}%` };

            return (
              <div key={`${cityName}-${index}`} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                      {cityName}
                    </span>
                    {item.isPeak && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#37137F1A] text-[#37137F] px-1.5 py-0.5 rounded">
                        Peak
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-700 text-xs sm:text-sm">
                    {pct}
                    {unit}
                  </span>
                </div>

                <div className={`h-2.5 w-full rounded-full ${trackColor} overflow-hidden`}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={fillStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </LoadingLayout>
    </div>
  );
}
