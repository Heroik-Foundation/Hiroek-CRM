import { useState } from "react";
import { AgeDistributionChart, GenderSplitChart } from "../../components/charts";
import { Header, KeyInsight } from "../../components/common";
import { ChartLayout } from "../../components/layout";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import useSpending from "../../hooks/useSpending";

export default function Spending() {
    const [page, setPage] = useState(1);

    const { useGetSpendingData, useGetTicketSpendDistributionData } = useSpending();

    const { data: spendingData, isLoading: isSpendingLoading } = useGetSpendingData();
    const { data: ticketSpendData, isLoading: isTicketLoading } = useGetTicketSpendDistributionData();



    const columns: Column<any>[] = [
        { id: "name", name: "Name" },
        { id: "role", name: "Role" },
        { id: "email", name: "Email" },
        {
            id: "status",
            name: "Status",
            render: (value) => {
                const map: Record<string, string> = {
                    Active: "bg-green-100 text-green-700",
                    Inactive: "bg-red-100 text-red-700",
                    "On Leave": "bg-yellow-100 text-yellow-700",
                };
                const status = String(value);
                return (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${map[status] ?? "bg-gray-100"}`}
                    >
                        {status}
                    </span>
                );
            },
        },
    ];

    const users: any[] = [
        {
            id: 1,
            name: "Kate Moore",
            role: "CEO",
            status: "Active",
            email: "kate@acme.com",
        },
        {
            id: 2,
            name: "John Smith",
            role: "CTO",
            status: "Active",
            email: "john@acme.com",
        },
        {
            id: 3,
            name: "Sara Johnson",
            role: "CMO",
            status: "On Leave",
            email: "sara@acme.com",
        },
        {
            id: 4,
            name: "Michael Brown",
            role: "CFO",
            status: "Active",
            email: "michael@acme.com",
        },
        {
            id: 5,
            name: "Emily Davis",
            role: "Product Manager",
            status: "Inactive",
            email: "emily@acme.com",
        },
        {
            id: 6,
            name: "Davis Wilson",
            role: "Lead Designer",
            status: "Active",
            email: "davis@acme.com",
        },
        {
            id: 7,
            name: "Olivia Martinez",
            role: "Frontend Engineer",
            status: "Active",
            email: "olivia@acme.com",
        },
        {
            id: 8,
            name: "James Taylor",
            role: "Backend Engineer",
            status: "Active",
            email: "james@acme.com",
        },
    ];

    return (
        <div className=" w-full flex flex-col gap-6 ">
            <Header
                title="Spending behaviour"
                body="Revenue insights and top contributors."
            />
            <div className=" w-full flex gap-4 ">
                <ChartLayout title="Ticket Spend Distribution">
                    <GenderSplitChart data={spendingData} isLoading={isSpendingLoading} barColor="#37137F" />
                </ChartLayout>
                <ChartLayout title="Ticket Spend Distribution">
                    <AgeDistributionChart data={ticketSpendData} isLoading={isTicketLoading} />
                </ChartLayout>
            </div>
            <div className=" w-full flex gap-4 ">
                <div className=" flex-1 p-4 rounded-2xl bg-white flex flex-col gap-4 ">
                    <div className=" w-full flex justify-between items-center ">
                        <p className=" font-semibold ">Top 10 Spenders</p>
                        <button className=" text-[#37137F] rounded-[44px] px-2 font-semibold bg-[#37137F26] h-6.5 text-xs ">
                            View All
                        </button>
                    </div>
                    <div className=" w-full flex flex-col "></div>
                    <CustomTable<any>
                        columns={columns}
                        // onClick={handleClick}
                        rows={users}
                        rowKey="id"
                        total={users.length}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={10}
                    />
                </div>
                <div className=" w-96.75 ">
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
