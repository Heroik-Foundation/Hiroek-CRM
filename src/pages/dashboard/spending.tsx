import { useState } from "react";
import { AgeDistributionChart, TicketSpendDistributionChart } from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import useSpending, { type TopSpenderItem } from "../../hooks/useSpending";
import { formatNumber } from "../../config/numberFormat";

export default function Spending() {
    const [page, setPage] = useState(1);

    const {
        useGetSpendingData,
        useGetTicketSpendDistributionData,
        useGetTopSpenders,
    } = useSpending();

    const { data: spendingData, isLoading: isSpendingLoading } = useGetSpendingData();
    const { data: ticketSpendData, isLoading: isTicketLoading } = useGetTicketSpendDistributionData();
    const { data: topSpendersData, isLoading: isTopSpendersLoading } = useGetTopSpenders({
        page,
        pageSize: 10,
        limit: 10,
    });

    const rawSpenders = Array.isArray(topSpendersData)
        ? topSpendersData
        : (topSpendersData?.data ?? []);

    const spenderRows: TopSpenderItem[] = rawSpenders.map((item: TopSpenderItem, index: number) => ({
        ...item,
        id: item._id ?? item.customerId ?? item.id ?? (page - 1) * 10 + index + 1,
        rank: item.rank ?? (page - 1) * 10 + index + 1,
    }));

    const totalSpenders = !Array.isArray(topSpendersData)
        ? (topSpendersData?.pagination?.total ?? topSpendersData?.total ?? spenderRows.length)
        : spenderRows.length;

    const columns: Column<TopSpenderItem>[] = [
        {
            id: "rank",
            name: "Rank",
            render: (_value, item) => {
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
            id: "fullname",
            name: "Customer",
            render: (_value, item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                        {item.fullname || item.name || item.username || "Customer"}
                    </span>
                    {item.username ? (
                        <span className="text-xs text-gray-400">@{item.username}</span>
                    ) : item.email ? (
                        <span className="text-xs text-gray-400">{item.email}</span>
                    ) : null}
                </div>
            ),
        },
        {
            id: "totalSpent",
            name: "Total Spent",
            render: (_value, item) => {
                const amount = item.totalSpent ?? item.amount ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {formatNumber(Number(amount), "£")}
                    </span>
                );
            },
        },
        {
            id: "totalTicketsPurchased",
            name: "Tickets Bought",
            render: (_value, item) => (
                <span className="text-sm font-medium text-gray-600">
                    {Number(item.totalTicketsPurchased ?? item.ticketsPurchased ?? 0).toLocaleString()}
                </span>
            ),
        },
        {
            id: "totalEvents",
            name: "Events",
            render: (_value, item) => (
                <span className="text-sm font-medium text-gray-600">
                    {Number(item.totalEvents ?? item.events ?? 0).toLocaleString()}
                </span>
            ),
        },
    ];

    return (
        <div className=" w-full flex flex-col gap-6 ">
            <Header
                title="Spending behaviour"
                body="Revenue insights and top contributors."
            />
            <div className=" w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                <ChartLayout title="Ticket Spend Distribution">
                    <TicketSpendDistributionChart data={spendingData} isLoading={isSpendingLoading} />
                </ChartLayout>
                <ChartLayout title="Ticket Spend Distribution">
                    <AgeDistributionChart data={ticketSpendData} isLoading={isTicketLoading} />
                </ChartLayout>
            </div>
            <div className=" w-full flex flex-col lg:flex-row gap-4 ">
                <div className=" flex-1 p-4 rounded-2xl bg-white flex flex-col gap-4 overflow-hidden ">
                    <div className=" w-full flex justify-between items-center ">
                        <p className=" font-semibold ">Top 10 Spenders</p>
                        <button className=" text-[#37137F] rounded-[44px] px-2 font-semibold bg-[#37137F26] h-6.5 text-xs cursor-pointer ">
                            View All
                        </button>
                    </div>
                    <div className=" w-full flex flex-col "></div>
                    <CustomTable<TopSpenderItem>
                        columns={columns}
                        rows={spenderRows}
                        rowKey="id"
                        total={totalSpenders}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={10}
                        isLoading={isTopSpendersLoading}
                    />
                </div>
                <div className=" w-full lg:w-96.75 shrink-0 ">
                    <KeyInsight
                        bg="#08AF0F0D"
                        border="#08AF0F26"
                        header="#08AF0F"
                        icon="#08AF0F"
                        color="#1E1E1E"
                        body="Your top 10% of attendees account for 55% of total revenue."
                        other
                    />
                </div>
            </div>
        </div>
    );
}
