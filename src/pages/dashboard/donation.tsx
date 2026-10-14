import { useState } from "react";
import { RevenueCard } from "../../components/cards";
import { AgeDistributionChart, GenderSplitChart } from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import { FaPoundSign } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { IoHeart } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import useDonation from "../../hooks/useDonation";

export default function Donation() {
    const [donorPage, setDonorPage] = useState(1);
    const [eventPage, setEventPage] = useState(1);

    const {
        useGetDonationMetrics,
        useGetDonationTrend,
        useGetDonationFrequency,
        useGetTopDonors,
        useGetEventDonations,
    } = useDonation();

    const { data: metricsData, isLoading: isMetricsLoading } =
        useGetDonationMetrics();
    const { data: trendData, isLoading: isTrendLoading } =
        useGetDonationTrend();
    const { data: frequencyData, isLoading: isFrequencyLoading } =
        useGetDonationFrequency();
    const { data: topDonorsData, isLoading: isTopDonorsLoading } =
        useGetTopDonors({
            page: donorPage,
            limit: 6,
        });
    const { data: eventDonationsData, isLoading: isEventDonationsLoading } =
        useGetEventDonations({
            page: eventPage,
            limit: 5,
        });

    const cardsData = [
        {
            title: "Total No. Of Donors",
            value: Number(metricsData?.totalDonors ?? 0).toLocaleString(),
            icon: IoIosPeople,
            bg: "linear-gradient(180deg, #F0276C 0%, #3D2188 100%)",
        },
        {
            title: "Total Donations",
            value:
                metricsData?.totalDonationsAmount !== undefined
                    ? `£${Number(metricsData.totalDonationsAmount).toLocaleString()}`
                    : "£0",
            icon: FaPoundSign,
            bg: "linear-gradient(180deg, #45B949 0%, #156518 100%)",
        },
        {
            title: "Average Donations",
            value:
                metricsData?.averageDonationAmount !== undefined
                    ? `£${Number(metricsData.averageDonationAmount).toFixed(2)}`
                    : "£0.00",
            icon: IoHeart,
            bg: "linear-gradient(180deg, #1976D2 0%, #0D3D6C 100%)",
        },
    ];

    // Format trend data
    const formatMonthLabel = (label?: string) => {
        if (!label) return "";
        if (label.includes("-")) {
            const parts = label.split("-");
            if (parts.length >= 2) {
                const monthIdx = parseInt(parts[1], 10) - 1;
                const date = new Date(2000, monthIdx, 1);
                return date.toLocaleString("en-US", { month: "short" });
            }
        }
        return label;
    };

    const formattedTrend = (Array.isArray(trendData) ? trendData : []).map(
        (item) => ({
            label: formatMonthLabel(item.label),
            value: Number(item.donationAmount ?? item.totalDonations ?? item.value ?? 0),
        })
    );

    // Top Donors Data
    const rawDonors =
        topDonorsData?.data ??
        (Array.isArray(topDonorsData) ? topDonorsData : []);
    const donorRows = rawDonors.map((item: any, index: number) => ({
        ...item,
        id: item._id ?? item.id ?? index + 1,
        rank: (donorPage - 1) * 6 + index + 1,
    }));
    const totalDonors =
        topDonorsData?.pagination?.total ??
        topDonorsData?.total ??
        donorRows.length;

    const donorColumns: Column<any>[] = [
        {
            id: "rank",
            name: "Rank",
            render: (_val, item) => {
                const rank = item.rank;
                let badgeStyle = "bg-[#F3F4F6] text-gray-700";
                if (rank === 1) badgeStyle = "bg-[#F59E0B] text-white";
                else if (rank === 2) badgeStyle = "bg-[#94A3B8] text-white";
                else if (rank === 3) badgeStyle = "bg-[#F97316] text-white";

                return (
                    <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${badgeStyle}`}
                    >
                        {rank}
                    </span>
                );
            },
        },
        {
            id: "donor",
            name: "Donor",
            render: (_val, item) => (
                <span className="font-semibold text-gray-900 text-sm">
                    {item.donorName ?? item.name ?? item.email ?? "Donor"}
                </span>
            ),
        },
        {
            id: "totalDonated",
            name: "Total Donated",
            render: (_val, item) => {
                const amt = item.totalDonated ?? item.amount ?? item.totalAmount ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {typeof amt === "number"
                            ? `£${amt.toLocaleString()}`
                            : String(amt)}
                    </span>
                );
            },
        },
        {
            id: "frequency",
            name: "Frequency",
            render: (_val, item) => {
                const freq = item.frequency ?? item.donationCount ?? item.count ?? 1;
                return (
                    <span className="text-sm text-gray-600">
                        {freq} Times
                    </span>
                );
            },
        },
        {
            id: "lastDonated",
            name: "Last Donated",
            render: (_val, item) => (
                <span className="text-sm text-gray-600">
                    {String(
                        item.lastDonated
                            ? new Date(item.lastDonated).toLocaleDateString()
                            : item.updatedAt
                                ? new Date(item.updatedAt).toLocaleDateString()
                                : item.lastDonatedText ?? "Recent"
                    )}
                </span>
            ),
        },
    ];

    // Event Donations Data
    const rawEventDonations =
        eventDonationsData?.data ??
        (Array.isArray(eventDonationsData) ? eventDonationsData : []);
    const eventDonationRows = rawEventDonations.map((item: any, index: number) => ({
        ...item,
        id: item._id ?? item.id ?? index + 1,
    }));
    const totalEventDonations =
        eventDonationsData?.pagination?.total ??
        eventDonationsData?.total ??
        eventDonationRows.length;

    const eventColumns: Column<any>[] = [
        {
            id: "eventName",
            name: "EVENT",
            render: (_val, item) => (
                <span className="font-semibold text-gray-900 text-sm">
                    {item.eventName ?? item.title ?? item.name ?? "Event"}
                </span>
            ),
        },
        {
            id: "amount",
            name: "AMOUNT",
            render: (_val, item) => {
                const amt = item.amount ?? item.totalDonations ?? item.donationAmount ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {typeof amt === "number"
                            ? `£${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : String(amt)}
                    </span>
                );
            },
        },
        {
            id: "status",
            name: "STATUS",
            render: (_val, item) => {
                const rawStatus = String(item.status ?? "EVENT ENDED").toUpperCase();
                const isEnded = rawStatus.includes("END") || rawStatus.includes("COMPLETE");
                return (
                    <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider inline-block ${isEnded
                            ? "bg-[#ECFDF5] text-[#059669]"
                            : "bg-[#FEF2F2] text-[#DC2626]"
                            }`}
                    >
                        {rawStatus}
                    </span>
                );
            },
        },
        {
            id: "date",
            name: "DATE",
            render: (_val, item) => (
                <span className="text-sm text-gray-600">
                    {String(
                        item.date
                            ? new Date(item.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                            })
                            : item.eventDate
                                ? new Date(item.eventDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                })
                                : "-"
                    )}
                </span>
            ),
        },
        {
            id: "actions",
            name: "",
            render: () => (
                <button className="text-gray-400 hover:text-gray-600 p-1">
                    <HiOutlineDotsVertical size={16} />
                </button>
            ),
        },
    ];

    const topDonor = donorRows[0];

    return (
        <section className="w-full flex flex-col gap-6">
            <Header
                title="Impact & Donations"
                body="Track Donations And Contributions From Your Community"
            />

            {/* 3 Metric Cards */}
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
                <ChartLayout title="Donation Trend">
                    <GenderSplitChart
                        data={formattedTrend}
                        isLoading={isTrendLoading}
                        barColor="#E11D48"
                        borderRadius={14}
                        showLegend={false}
                    />
                </ChartLayout>

                <ChartLayout title="Donor Frequency">
                    <AgeDistributionChart
                        data={frequencyData}
                        isLoading={isFrequencyLoading}
                    />
                </ChartLayout>
            </div>

            {/* Top Donors & Key Insights */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 min-w-0 max-w-full p-5 rounded-2xl bg-white flex flex-col gap-4 border border-gray-100 shadow-sm overflow-hidden">
                    <div className="w-full flex justify-between items-center">
                        <p className="font-semibold text-gray-900 text-sm">
                            Top Donors
                        </p>
                    </div>

                    <CustomTable<any>
                        columns={donorColumns}
                        rows={donorRows}
                        rowKey="id"
                        total={totalDonors}
                        page={donorPage}
                        onPageChange={setDonorPage}
                        rowsPerPage={6}
                        isLoading={isTopDonorsLoading}
                    />
                </div>

                <div className="lg:col-span-1 min-w-0">
                    <KeyInsight
                        bg="#D021240D"
                        border="#D0212426"
                        header="#D02124"
                        icon="#D02124"
                        color="#1E1E1E"
                        body="You Received The Most Donation From X Event."
                        donation
                        topDonorName={topDonor?.donorName ?? topDonor?.name ?? "-"}
                        topDonorAmount={topDonor?.totalDonated ?? topDonor?.amount ?? 0}
                    />
                </div>
            </div>

            {/* Donations via Events Table */}
            <div className="w-full min-w-0">
                <div className="w-full min-w-0 max-w-full p-5 rounded-2xl bg-white flex flex-col gap-4 border border-gray-100 shadow-sm overflow-hidden">
                    <div className="w-full flex justify-between items-center">
                        <p className="font-semibold text-gray-900 text-sm">
                            Donations via Events
                        </p>
                    </div>

                    <CustomTable<any>
                        columns={eventColumns}
                        rows={eventDonationRows}
                        rowKey="id"
                        total={totalEventDonations}
                        page={eventPage}
                        onPageChange={setEventPage}
                        rowsPerPage={5}
                        isLoading={isEventDonationsLoading}
                    />
                </div>
            </div>
        </section>
    );
}