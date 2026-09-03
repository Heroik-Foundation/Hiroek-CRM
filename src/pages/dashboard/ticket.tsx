import { useState } from "react";
import { TicketCard } from "../../components/cards";
import { Header } from "../../components/common";
import type { Column } from "../../type/table";
import { CustomField } from "../../components/ui";
import { IoSearch } from "react-icons/io5";
import CustomTable from "../../components/ui/customTable";


export default function Spending() {

    const analytics = [ 1, 2, 3, 4 ];

    const [page, setPage] = useState(1);
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

    return(
        <section className=" w-full flex flex-col gap-6 ">
            <Header
                title="Ticket Scan History"
                body="Track attendee check-ins via QR code scans."
            />

            <div className=" w-full grid grid-cols-4 gap-4 ">
                {analytics?.map((item) => {
                    return (
                        <div key={item}>
                            <TicketCard />
                        </div>
                    );
                })}
            </div>
            <div className=" w-full flex gap-4 ">
                <div className=" flex-1 p-4 rounded-2xl bg-white flex flex-col gap-4 ">
                    <div className=" w-full flex justify-between items-center ">
                        <div className=" flex gap-1 items-center text-[] " >
                            {/* <DocumentFilter color="#1E1E1EBF"  size={20} variant="Bold" /> */}
                            <p className=" font-semibold text-sm text-black ">Recent Scans</p>
                        </div>
                        <div className=" w-fit flex gap-3 ">
                            <div className=" w-75 " >

                            <CustomField prefix={<IoSearch />} placeholder="Search Ticket ID, Name..." />
                            </div> 
                            <button className=" bg-[#37137F] rounded-lg px-4 font-semibold text-white h-11 text-xs ">
                                Export Data
                            </button>
                        </div>
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
            </div>
        </section>
    )
}