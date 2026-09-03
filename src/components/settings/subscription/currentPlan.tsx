import { useState } from "react";
import { CustomButton } from "../../ui";
import type { Column } from "../../../type/table";
import CustomTable from "../../ui/customTable";
import { useNavigate } from "react-router-dom";
import usePlan from "../../../hooks/settings/usePlan";

export default function Subscription() {
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
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

    const { useCurrentPlan } = usePlan();

    const { data } = useCurrentPlan();

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

    console.log(data);

    return (
        <section className=" flex-1 ">
            <div className=" max-w-175 w-full bg-white rounded-xl p-6 flex flex-col gap-6 ">
                <p className=" font-semibold text-lg ">
                    Subscriptions & Payment
                </p>
                <div
                    style={{
                        background:
                            "linear-gradient(180deg, #F0276C 0%, #8A163E 100%)",
                    }}
                    className=" w-full text-white rounded-3xl p-5 flex flex-col gap-4 "
                >
                    <div className=" w-full flex justify-between items-center ">
                        <p className=" text-sm font-medium ">Current Plan</p>

                        <button
                            onClick={() =>
                                navigate("/dashboard/settings?tab=plan")
                            }
                            className=" px-5 h-12 rounded-2xl font-semibold text-xs bg-white text-[#37137F]  "
                        >
                            Upgrade Plan
                        </button>
                    </div>
                    <p className=" text-2xl font-semibold ">Starter Plan</p>
                    <div className=" border-b border-white py-4 ">
                        <p className=" text-sm font-semibold ">{data?.planVersion?.name}</p>
                    </div>
                    <p className=" text-sm font-semibold ">Plan Features:</p>

                    <ul className=" list-decimal text-sm px-5 flex flex-col gap-1 ">
                        {data?.planVersion?.features?.map(
                            (subitem, subindex) => {
                                return <li key={subindex}>{subitem?.replace("_", " ")}</li>;
                            },
                        )}
                    </ul>
                </div>
                <div className=" flex flex-col gap-2 ">
                    <p className=" text-sm font-semibold ">Payment Method</p>
                    <div className=" w-full border rounded-2xl p-4 ">
                        <CustomButton fullWidth>
                            + Add Payment Method
                        </CustomButton>
                    </div>
                </div>
                <div className=" w-full border rounded-2xl p-4 ">
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
    );
}
