import {
    AttendanceTrendChart,
    AudienceLocationChart,
    GenderSplitChart,
} from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import useTrendingAndPrediction from "../../hooks/useTrendingAndPrediction";

export default function Trending() {
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

    return (
        <div className=" w-full flex flex-col gap-6 ">
            <Header
                title="Trends & Predictions"
                body="Patterns and forecasts for better planning"
            />
            <div className=" w-full flex gap-4 ">
                <ChartLayout title="Peak Event Times">
                    <AudienceLocationChart
                        data={peakEventTimesData}
                        isLoading={isPeakEventTimesLoading}
                        barColor="#37137F"
                    />
                </ChartLayout>
                <ChartLayout title="Attendance by Day of Week">
                    <GenderSplitChart
                        data={attendanceByDateData}
                        isLoading={isAttendanceByDateLoading}
                        barColor="#37137F"
                    />
                </ChartLayout>
            </div>
            <div className=" w-full flex gap-4 ">
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
                    />
                </ChartLayout>
            </div>

            <KeyInsight
                bg="#08AF0F0D"
                border="#08AF0F26"
                header="#08AF0F"
                icon="#08AF0F"
                color="#1E1E1E"
                list={[
                    {
                        title: "Best Day",
                        body: "Friday evening events consistently outperform mid-week by 20%.",
                    },
                    {
                        title: "Best Category",
                        body: "Workshop Category retain 30% more repeat attendees than other formats",
                    },
                ]}
            />
        </div>
    );
}
