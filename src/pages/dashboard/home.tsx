import { IoIosPeople } from "react-icons/io";
import { OverviewCard } from "../../components/cards";
import {
    AcquisitionChannel,
    AgeDistributionChart,
    AttendanceTrendChart,
    AudienceLocationChart,
    ConversionFunnelChart,
    GenderSplitChart,
} from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import { FaPoundSign, FaRegHeart } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { GrAnnounce } from "react-icons/gr";
import { HiOutlineShare } from "react-icons/hi";
import { RiTicket2Fill } from "react-icons/ri";
import useDashboard from "../../hooks/useDashboard";
import type { IDashboard } from "../../type/dashboard";

export default function Home() {
    const analytics = [
        {
            title: "Total Attendees",
            icon: IoIosPeople,
            color: "#37137F",
            item: "totalCustomers",
            unit: "",
        },
        {
            title: "Revenue",
            icon: FaPoundSign,
            color: "#047008",
            item: "revenue",
            unit: "£",
        },
        {
            title: "Repeat Rate",
            icon: FiRefreshCcw,
            color: "#882175",
            item: "repeatRate",
            unit: "%",
        },
        {
            title: "Campaign Open Rate",
            body: "Number of times users view an event page",
            icon: GrAnnounce,
            color: "#E59E39",
            item: "shareRate",
            unit: "%",
        },
        {
            title: "Conversion Rate",
            body: "When they have joined the event",
            icon: IoIosPeople,
            color: "#3B77C4",
            item: "conversionRate",
            unit: "%",
        },
        {
            title: "Share Rate",
            icon: HiOutlineShare,
            color: "#C4A806",
            item: "shareRate",
            unit: "%",
        },
        {
            title: "Favourited Events",
            icon: FaRegHeart,
            color: "#992525",
            item: "favourites",
            unit: "",
        },
        {
            title: "Total Ticket Sold",
            icon: RiTicket2Fill,
            color: "#09B8C4",
            item: "ticketsSold",
            unit: "",
        },
    ];

    const {
        useGetDashboardData,
        useGetCustomerAgeData,
        useGetGenderSplitData,
        useGetAudienceData,
        useGetConversionData,
        useGetAcquisitionData,
    } = useDashboard();

    const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardData();
    const { data: ageData, isLoading: isAgeLoading } = useGetCustomerAgeData();
    const { data: genderData, isLoading: isGenderLoading } = useGetGenderSplitData();
    const { data: audienceData, isLoading: isAudienceLoading } = useGetAudienceData();
    const { data: conversionData, isLoading: isConversionLoading } = useGetConversionData();
    const { data: acquisitionData, isLoading: isAcquisitionLoading } = useGetAcquisitionData();

    return (
        <div className="w-full flex flex-col gap-5 sm:gap-6">
            <Header
                title="Dashboard Overview"
                body="Key metrics and performance indicators"
            />
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {analytics?.map(({ item, ...rest }, index) => {
                    return (
                        <OverviewCard
                            {...rest}
                            itemKey={item as keyof IDashboard}
                            key={index}
                            data={dashboardData as IDashboard}
                            isLoading={isDashboardLoading}
                        />
                    );
                })}
            </div>

            <Header
                title="Audience Demographics"
                body="Understanding your audience composition"
            />
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartLayout title="Age Distribution">
                    <AgeDistributionChart data={ageData} isLoading={isAgeLoading} />
                </ChartLayout>
                <ChartLayout title="Gender Split">
                    <GenderSplitChart data={genderData} isLoading={isGenderLoading} />
                </ChartLayout>
                <ChartLayout title="Audience By Location">
                    <AudienceLocationChart
                        data={audienceData}
                        isLoading={isAudienceLoading}
                    />
                </ChartLayout>
                <KeyInsight
                    bg="#37137F0D"
                    border="#37137F26"
                    header="#000000"
                    icon="#3B77C4"
                    color="#000000"
                    body="Most of your audience is 25-34 years old, based mainly in London and New York. Consider scheduling events in both cities next quarter."
                />
            </div>

            <Header
                title="Engagement Behaviour"
                body="How your audience interacts with your events"
            />
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartLayout title="Attendance Trend Over Time">
                    <AttendanceTrendChart />
                </ChartLayout>
                <ChartLayout title="Conversion Funnel">
                    <ConversionFunnelChart
                        data={conversionData}
                        isLoading={isConversionLoading}
                    />
                </ChartLayout>
                <ChartLayout title="Acquisition Channel">
                    <AcquisitionChannel
                        data={acquisitionData}
                        isLoading={isAcquisitionLoading}
                    />
                </ChartLayout>
                <KeyInsight
                    bg="#FF3D000D"
                    border="#FF3D0026"
                    header="#69210A"
                    icon="#FF3D00"
                    color="#69210A"
                    body="45% of no-shows came from Instagram referrals. Email campaigns drive the highest attendance conversion at 90%."
                />
            </div>
        </div>
    );
}
