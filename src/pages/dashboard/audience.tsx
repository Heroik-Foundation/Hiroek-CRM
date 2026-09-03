import { useState } from "react";
import { AudienceCard } from "../../components/cards";
import { Header } from "../../components/common";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import { CustomField } from "../../components/ui";
import { IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { FiMail } from "react-icons/fi";
import { LuFileSpreadsheet } from "react-icons/lu";
import { DocumentFilter } from "iconsax-reactjs";
import useAudienceSegment from "../../hooks/useAudienceSegment";

export default function Audience() {
    const [page, setPage] = useState(1);
    const [selectedSegment, setSelectedSegment] = useState<string>("frequentBuyers");
    const [search, setSearch] = useState<string>("");

    const { useGetAudienceSegmentMetrics, useGetAudienceSegmentCustomer } =
        useAudienceSegment();

    const { data: metricsData, isLoading: isMetricsLoading } =
        useGetAudienceSegmentMetrics();

    const { data: customersData, isLoading: isCustomersLoading } =
        useGetAudienceSegmentCustomer({
            segment: selectedSegment !== "all" ? selectedSegment : undefined,
            page,
            limit: 10,
            search: search.trim() || undefined,
        });

    const segments = [
        {
            key: "all",
            title: "All Attendees",
            value: metricsData?.all ?? 0,
            subtitle: "",
            iconColor: "#37137F",
        },
        {
            key: "frequentBuyers",
            title: "Frequent Attendees",
            value: metricsData?.frequentBuyers ?? 0,
            subtitle: "3+ Events",
            iconColor: "#6C5DD3",
        },
        {
            key: "highSpenders",
            title: "High Spenders",
            value: metricsData?.highSpenders ?? 0,
            subtitle: "£100+ Lifetime Spend",
            iconColor: "#10B981",
        },
        {
            key: "atRisk",
            title: "At Risk",
            value: metricsData?.atRisk ?? 0,
            subtitle: "Inactive 3+ Events",
            iconColor: "#EF4444",
        },
        {
            key: "localFans",
            title: "Local Fans",
            value: metricsData?.localFans ?? 0,
            subtitle: "Within 20 Miles",
            iconColor: "#F59E0B",
        },
    ];

    const activeSegmentObj =
        segments.find((s) => s.key === selectedSegment) ?? segments[0];

    const rawRecords =
        customersData?.data ?? (Array.isArray(customersData) ? customersData : []);

    const totalUsers =
        customersData?.total ??
        customersData?.pagination?.total ??
        rawRecords.length;

    const rows = rawRecords.map((item: any, index: number) => ({
        ...item,
        id: item._id ?? item.id ?? (page - 1) * 10 + index + 1,
        sNo: (page - 1) * 10 + index + 1,
    }));

    const columns: Column<any>[] = [
        {
            id: "sNo",
            name: "S/No",
            render: (_value, item) => (
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-semibold">
                    {item.sNo}
                </span>
            ),
        },
        {
            id: "name",
            name: "User",
            render: (_value, item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                        {item.name ||
                            (item.firstName
                                ? `${item.firstName} ${item.lastName ?? ""}`.trim()
                                : null) ||
                            item.email ||
                            "User"}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                        {item.email ?? "user@email.com"}
                    </span>
                </div>
            ),
        },
        {
            id: "events",
            name: "Events",
            render: (value, item) => (
                <span className="text-sm font-semibold text-gray-800">
                    {value ?? item.eventsCount ?? item.totalEvents ?? 0}
                </span>
            ),
        },
        {
            id: "totalSpent",
            name: "Total Spent",
            render: (value, item) => {
                const amount = value ?? item.spent ?? item.amount ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800">
                        {typeof amount === "number"
                            ? `£${amount.toLocaleString()}`
                            : String(amount ?? "£0")}
                    </span>
                );
            },
        },
        {
            id: "lastActive",
            name: "Last Active",
            render: (value, item) => (
                <span className="text-sm text-gray-600">
                    {String(
                        value ??
                            (item.lastActiveDate
                                ? new Date(item.lastActiveDate).toLocaleDateString()
                                : item.updatedAt
                                ? new Date(item.updatedAt).toLocaleDateString()
                                : "Recent")
                    )}
                </span>
            ),
        },
        {
            id: "location",
            name: "Location",
            render: (value, item) => (
                <span className="text-sm text-gray-700">
                    {String(value ?? item.city ?? item.location ?? "-")}
                </span>
            ),
        },
    ];

    return (
        <section className="w-full flex flex-col gap-6">
            <div className="w-full flex justify-between items-center">
                <Header
                    title="Audience Segmentation"
                    body="Manage & Engage With Your Audience"
                />
                <button className="h-10 px-4 bg-white border border-[#37137F26] rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                    <span>Filter by Events</span>
                    <IoChevronDown size={14} />
                </button>
            </div>

            {/* Segment Metric Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {segments.map((seg) => (
                    <AudienceCard
                        key={seg.key}
                        title={seg.title}
                        value={isMetricsLoading ? "..." : seg.value}
                        subtitle={seg.subtitle}
                        iconColor={seg.iconColor}
                        isSelected={selectedSegment === seg.key}
                        onClick={() => {
                            setSelectedSegment(seg.key);
                            setPage(1);
                        }}
                    />
                ))}
            </div>

            {/* Table Section */}
            <div className="w-full flex gap-4">
                <div className="flex-1 p-5 rounded-2xl bg-white flex flex-col gap-4 border border-gray-100 shadow-sm">
                    {/* Toolbar */}
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2 items-center">
                            <DocumentFilter color="#1E1E1EBF" size={20} variant="Bold" />
                            <p className="font-semibold text-sm text-black">
                                {activeSegmentObj.title}
                            </p>
                        </div>
                        <div className="w-full sm:w-fit flex flex-wrap items-center gap-3">
                            <div className="w-full sm:w-72">
                                <CustomField
                                    prefix={<IoSearch />}
                                    placeholder="Search Users..."
                                    value={search}
                                    onChange={(e: any) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <button className="bg-[#E59E39] hover:bg-[#d48e2b] transition-colors rounded-lg px-4 font-semibold text-white h-11 text-xs flex items-center gap-2">
                                <FiMail size={15} />
                                <span>Send Message</span>
                            </button>
                            <button className="bg-[#37137F] hover:bg-[#2c0f66] transition-colors rounded-lg px-4 font-semibold text-white h-11 text-xs flex items-center gap-2">
                                <LuFileSpreadsheet size={15} />
                                <span>Export Data</span>
                                <IoChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <CustomTable<any>
                        columns={columns}
                        rows={rows}
                        rowKey="id"
                        total={totalUsers}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={10}
                        isLoading={isCustomersLoading}
                    />
                </div>
            </div>
        </section>
    );
}
