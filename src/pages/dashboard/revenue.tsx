import { useState } from "react";
import { RevenueCard } from "../../components/cards";
import { AttendanceTrendChart, GenderSplitChart } from "../../components/charts";
import { Header } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import type { Column } from "../../type/table";
import CustomTable from "../../components/ui/customTable";
import { FaPoundSign } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { RiTicket2Fill } from "react-icons/ri";
import useRevenue from "../../hooks/useRevenue";

export default function Revenue() {
    const [page, setPage] = useState(1);

    const {
        useGetRevenueMetrics,
        useGetMonthlyRevenueTrend,
        useGetRevenueByEvent,
        useGetEventPerformanceRecord,
    } = useRevenue();

    const { data: metricsData, isLoading: isMetricsLoading } =
        useGetRevenueMetrics();
    const { data: monthlyData, isLoading: isMonthlyLoading } =
        useGetMonthlyRevenueTrend();
    const { data: eventRevenueData, isLoading: isEventRevenueLoading } =
        useGetRevenueByEvent();
    const { data: performanceData, isLoading: isPerformanceLoading } =
        useGetEventPerformanceRecord({
            page,
            limit: 10,
        });

    const cardsData = [
        {
            title: "Total Revenue",
            value:
                metricsData?.totalRevenue !== undefined
                    ? `£${Number(metricsData.totalRevenue).toLocaleString()}`
                    : "£0",
            icon: FaPoundSign,
            bg: "linear-gradient(180deg, #45B949 0%, #156518 100%)",
        },
        {
            title: "Total Attendees",
            value: Number(
                metricsData?.totalCustomers ?? metricsData?.totalTickets ?? 0
            ).toLocaleString(),
            icon: IoIosPeople,
            bg: "linear-gradient(180deg, #1976D2 0%, #0D3D6C 100%)",
        },
        {
            title: "Average Ticket Price",
            value:
                metricsData?.averageTicketPrice !== undefined
                    ? `£${Number(metricsData.averageTicketPrice).toFixed(2)}`
                    : "£0.00",
            icon: RiTicket2Fill,
            bg: "linear-gradient(180deg, #F0276C 0%, #3D2188 100%)",
        },
    ];

    const rawRecords =
        performanceData?.data ??
        (Array.isArray(performanceData) ? performanceData : []);

    const tableRows = rawRecords.map((item: any, index: number) => ({
        ...item,
        id: item._id ?? item.id ?? index + 1,
    }));

    const totalRecords =
        performanceData?.pagination?.total ?? tableRows.length;

    const columns: Column<any>[] = [
        {
            id: "eventName",
            name: "Event Name",
            render: (_value, item) => (
                <span className="font-semibold text-gray-900 text-sm">
                    {item.eventName ?? item.name ?? item.title ?? "Event"}
                </span>
            ),
        },
        {
            id: "date",
            name: "Date",
            render: (value, item) => (
                <span className="text-sm text-gray-600">
                    {String(
                        value ??
                            (item.eventDate
                                ? new Date(item.eventDate).toLocaleDateString()
                                : item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "-")
                    )}
                </span>
            ),
        },
        {
            id: "attendees",
            name: "Attendees",
            render: (value, item) => (
                <span className="text-sm font-semibold text-gray-800">
                    {Number(
                        value ?? item.totalAttendees ?? item.ticketsSold ?? 0
                    ).toLocaleString()}
                </span>
            ),
        },
        {
            id: "ticketPrice",
            name: "Ticket Price",
            render: (value, item) => {
                const price = value ?? item.price ?? item.averagePrice ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {typeof price === "number"
                            ? `£${price.toLocaleString()}`
                            : String(price)}
                    </span>
                );
            },
        },
        {
            id: "revenue",
            name: "Revenue",
            render: (value, item) => {
                const rev = value ?? item.totalRevenue ?? item.revenue ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {typeof rev === "number"
                            ? `£${rev.toLocaleString()}`
                            : String(rev)}
                    </span>
                );
            },
        },
        {
            id: "status",
            name: "Status",
            render: (value, item) => {
                const status = String(
                    value ?? item.performanceStatus ?? item.status ?? "Active"
                );
                return (
                    <span className="bg-[#DCFCE7] text-[#16A34A] rounded-full px-3 py-1 text-xs font-semibold inline-block whitespace-nowrap">
                        {status}
                    </span>
                );
            },
        },
    ];

    return (
        <section className="w-full flex flex-col gap-6">
            <Header
                title="Event Revenue"
                body="Track Earnings And Performance By Event."
            />

            {/* 3 Metrics Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                {cardsData.map((card) => (
                    <RevenueCard
                        key={card.title}
                        title={card.title}
                        value={isMetricsLoading ? "..." : card.value}
                        icon={card.icon}
                        bg={card.bg}
                    />
                ))}
            </div>

            {/* Charts Row */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartLayout title="Monthly Revenue Trend">
                    <AttendanceTrendChart
                        data={monthlyData}
                        isLoading={isMonthlyLoading}
                        dataKey="revenue"
                        xAxisKey="label"
                        label="Revenue Trend"
                        legendLabel="Revenue Trend"
                        color="#7047EB"
                    />
                </ChartLayout>

                <ChartLayout title="Revenue By Event">
                    <GenderSplitChart
                        data={eventRevenueData}
                        isLoading={isEventRevenueLoading}
                        barColor="#B8ACF6"
                        borderRadius={8}
                        legendLabel="Last 30 Days"
                    />
                </ChartLayout>
            </div>

            {/* Event Performance Details Table */}
            <div className="w-full flex gap-4">
                <div className="flex-1 p-5 rounded-2xl bg-white flex flex-col gap-4 border border-gray-100 shadow-sm">
                    <div className="w-full flex justify-between items-center">
                        <p className="font-semibold text-gray-900 text-sm">
                            Event Performance Details
                        </p>
                    </div>

                    <CustomTable<any>
                        columns={columns}
                        rows={tableRows}
                        rowKey="id"
                        total={totalRecords}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={10}
                        isLoading={isPerformanceLoading}
                    />
                </div>
            </div>
        </section>
    );
}
