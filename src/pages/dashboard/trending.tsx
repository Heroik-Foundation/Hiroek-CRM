import { useMemo } from "react";
import { useAtomValue } from "jotai";
import {
    AttendanceByDayChart,
    AttendanceTrendChart,
    AudienceLocationChart,
} from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import useTrendingAndPrediction from "../../hooks/useTrendingAndPrediction";
import { periodAtom } from "../../utils/atom/period";

export default function Trending() {
    const periodLabel = useAtomValue(periodAtom);
    const {
        useGetPeakEventTimesData,
        useGetAttendanceByDateData,
        useGetEventCategoryPopularityData,
        useGetForecastData,
    } = useTrendingAndPrediction();

    const { data: peakEventTimesData, isLoading: isPeakEventTimesLoading } =
        useGetPeakEventTimesData();
    const { data: attendanceByDateData, isLoading: isAttendanceByDateLoading } =
        useGetAttendanceByDateData();
    const {
        data: eventCategoryPopularityData,
        isLoading: isEventCategoryPopularityLoading,
    } = useGetEventCategoryPopularityData();
    const { data: forecastData, isLoading: isForecastLoading } =
        useGetForecastData();

    // Extract insights exclusively from endpoint data or derive them from real endpoint metrics
    const insightsList = useMemo(() => {
        // 1. Check if any endpoint response explicitly contains an insights array
        const rawInsights =
            attendanceByDateData?.insights ??
            attendanceByDateData?.data?.insights ??
            eventCategoryPopularityData?.insights ??
            eventCategoryPopularityData?.data?.insights ??
            peakEventTimesData?.insights ??
            peakEventTimesData?.data?.insights ??
            forecastData?.insights ??
            forecastData?.data?.insights;

        if (Array.isArray(rawInsights) && rawInsights.length > 0) {
            return rawInsights.map((item: Record<string, unknown>) => ({
                title: String(item.title ?? item.label ?? "Insight"),
                body: String(item.body ?? item.description ?? item.text ?? item),
            }));
        }

        const list: { title: string; body: string }[] = [];

        // 2. Derive Best Day from actual attendanceByDateData
        const attendanceSource = attendanceByDateData?.data ?? attendanceByDateData;
        let attendanceEntries: { day: string; count: number }[] = [];
        if (Array.isArray(attendanceSource)) {
            attendanceEntries = attendanceSource.map((item: Record<string, unknown>) => ({
                day: String(item.day ?? item.date ?? item.label ?? item.name ?? item._id ?? ""),
                count: Number(
                    item.count ??
                    item.ticketsSold ??
                    item.attendance ??
                    item.tickets ??
                    item.value ??
                    0
                ),
            }));
        } else if (attendanceSource && typeof attendanceSource === "object") {
            const dataObj = attendanceSource as Record<string, unknown>;
            attendanceEntries = Object.entries(dataObj)
                .filter(([k]) => k !== "status" && k !== "data" && k !== "message")
                .map(([day, val]) => {
                    const valObj = typeof val === "object" && val !== null ? (val as Record<string, unknown>) : null;
                    return {
                        day,
                        count:
                            typeof val === "number"
                                ? val
                                : Number(
                                      valObj?.count ??
                                      valObj?.ticketsSold ??
                                      valObj?.attendance ??
                                      valObj?.value ??
                                      0
                                  ),
                    };
                });
        }

        const validDays = attendanceEntries.filter((d) => d.count > 0 && d.day);
        if (validDays.length > 0) {
            const sortedDays = [...validDays].sort((a, b) => b.count - a.count);
            const topDay = sortedDays[0];
            const totalAttendance = validDays.reduce((acc, d) => acc + d.count, 0);
            const pct = totalAttendance > 0 ? Math.round((topDay.count / totalAttendance) * 100) : 0;
            list.push({
                title: "Best Day",
                body: `${topDay.day} is your top performing day with ${topDay.count.toLocaleString()} attendees${pct > 0 ? ` (${pct}% of total)` : ""}.`,
            });
        }

        // 3. Derive Best Category from actual eventCategoryPopularityData
        const categorySource = eventCategoryPopularityData?.data ?? eventCategoryPopularityData;
        let categoryEntries: { category: string; value: number }[] = [];
        if (Array.isArray(categorySource)) {
            categoryEntries = categorySource.map((item: Record<string, unknown>) => ({
                category: String(item.category ?? item.name ?? item.label ?? item.city ?? item._id ?? ""),
                value: Number(item.percentage ?? item.value ?? item.count ?? 0),
            }));
        } else if (categorySource && typeof categorySource === "object") {
            const catObj = categorySource as Record<string, unknown>;
            categoryEntries = Object.entries(catObj)
                .filter(([k]) => k !== "status" && k !== "data" && k !== "message")
                .map(([category, val]) => {
                    const valObj = typeof val === "object" && val !== null ? (val as Record<string, unknown>) : null;
                    return {
                        category,
                        value:
                            typeof val === "number"
                                ? val
                                : Number(valObj?.percentage ?? valObj?.value ?? valObj?.count ?? 0),
                    };
                });
        }

        const validCategories = categoryEntries.filter((c) => c.value > 0 && c.category);
        if (validCategories.length > 0) {
            const sortedCats = [...validCategories].sort((a, b) => b.value - a.value);
            const topCat = sortedCats[0];
            list.push({
                title: "Best Category",
                body: `${topCat.category} is your highest performing category (${topCat.value}%).`,
            });
        }

        return list;
    }, [attendanceByDateData, eventCategoryPopularityData, peakEventTimesData, forecastData]);

    return (
        <div className=" w-full flex flex-col gap-6 ">
            <Header
                title="Trends & Predictions"
                body="Patterns and forecasts for better planning"
            />
            <div className=" w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                <ChartLayout title="Peak Event Times">
                    <AudienceLocationChart
                        data={peakEventTimesData}
                        isLoading={isPeakEventTimesLoading}
                        barColor="#37137F"
                    />
                </ChartLayout>
                <ChartLayout
                    title={
                        periodLabel === "Last 7 Days"
                            ? "Attendance by Day of Week"
                            : `Attendance Trend (${periodLabel})`
                    }
                >
                    <AttendanceByDayChart
                        data={attendanceByDateData}
                        isLoading={isAttendanceByDateLoading}
                        barColor="#2E0F74"
                        showFilter={true}
                    />
                </ChartLayout>
            </div>
            <div className=" w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                <ChartLayout title="Event Category Popularity">
                    <AudienceLocationChart
                        data={eventCategoryPopularityData}
                        isLoading={isEventCategoryPopularityLoading}
                        barColor="#37137F"
                    />
                </ChartLayout>
                <ChartLayout title="Projected Attendance Forecast">
                    <AttendanceTrendChart
                        data={forecastData}
                        isLoading={isForecastLoading}
                        dataKey="forecast"
                        xAxisKey="period"
                        label="Forecast"
                        showFilter={true}
                    />
                </ChartLayout>
            </div>

            {insightsList.length > 0 && (
                <KeyInsight
                    bg="#08AF0F0D"
                    border="#08AF0F26"
                    header="#08AF0F"
                    icon="#08AF0F"
                    color="#1E1E1E"
                    list={insightsList}
                />
            )}
        </div>
    );
}
