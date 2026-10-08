import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AudienceCard } from "../../components/cards";
import { Header } from "../../components/common";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import { CustomField } from "../../components/ui";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import { FiMail } from "react-icons/fi";
import { LuFileSpreadsheet, LuUsers, LuCloudUpload } from "react-icons/lu";
import { MdFilterList } from "react-icons/md";
import useAudienceSegment from "../../hooks/useAudienceSegment";

export default function Audience() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [selectedSegment, setSelectedSegment] = useState<string>("frequentBuyers");
    const [search, setSearch] = useState<string>("");
    const [isSegmentDropdownOpen, setIsSegmentDropdownOpen] = useState(false);
    const [isEventFilterOpen, setIsEventFilterOpen] = useState(false);
    const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("Filter by Events");

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
            iconColor: "#1D4ED8",
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
            subtitle: "Inactive 3+ Months",
            iconColor: "#DC2626",
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

    const totalPages = Math.max(1, Math.ceil(totalUsers / 10));

    interface AudienceTableRow {
        id: string | number;
        sNo: number;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        eventsCount?: number;
        totalEvents?: number;
        totalSpent?: number;
        spent?: number;
        amount?: number;
        lastActiveDate?: string;
        updatedAt?: string;
        location?: string;
        country?: string;
        city?: string;
        user?: {
            _id?: string;
            fullname?: string;
            email?: string;
        };
        [key: string]: unknown;
    }

    const rows: AudienceTableRow[] = rawRecords.map((item: unknown, index: number) => {
        const itemObj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        return {
            ...itemObj,
            id: (itemObj._id || itemObj.id || (page - 1) * 10 + index + 1) as string | number,
            sNo: (page - 1) * 10 + index + 1,
            name: typeof itemObj.name === "string" ? itemObj.name : undefined,
            firstName: typeof itemObj.firstName === "string" ? itemObj.firstName : undefined,
            lastName: typeof itemObj.lastName === "string" ? itemObj.lastName : undefined,
            email: typeof itemObj.email === "string" ? itemObj.email : undefined,
            lastActiveDate: typeof itemObj.lastActiveDate === "string" ? itemObj.lastActiveDate : undefined,
            updatedAt: typeof itemObj.updatedAt === "string" ? itemObj.updatedAt : undefined,
        };
    });

    const columns: Column<AudienceTableRow>[] = [
        {
            id: "sNo",
            name: "S/No",
            render: (_value, item) => (
                <span className="w-8 h-8 rounded-full bg-[#F3F0FA] text-[#37137F] flex items-center justify-center text-xs font-bold shrink-0">
                    {item.sNo}
                </span>
            ),
        },
        {
            id: "name",
            name: "User",
            render: (_value, item) => (
                <div className="flex flex-col py-1">
                    <span className="font-semibold text-gray-900 text-sm leading-snug">
                        {item.name ||
                            (item.firstName
                                ? `${item.firstName} ${item.lastName ?? ""}`.trim()
                                : null) ||
                            item.email ||
                            "User"}
                    </span>
                    <span className="text-xs text-gray-400 font-normal leading-tight">
                        {item.email ?? "user@email.com"}
                    </span>
                </div>
            ),
        },
        {
            id: "events",
            name: "Events",
            render: (value, item) => (
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {Number(value ?? item.eventsCount ?? item.totalEvents ?? 0)}
                </span>
            ),
        },
        {
            id: "totalSpent",
            name: "Total Spent",
            render: (value, item) => {
                const amount = value ?? item.spent ?? item.amount ?? 0;
                return (
                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
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
                <span className="text-sm text-gray-600 whitespace-nowrap">
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
                <span className="text-sm text-gray-700 whitespace-nowrap">
                    {String(value ?? item.city ?? item.location ?? "-")}
                </span>
            ),
        },
    ];

    // Pagination numbers builder
    const renderPaginationItems = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (page < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return pages.map((p, idx) => {
            if (typeof p === "string") {
                return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-xs">
                        ...
                    </span>
                );
            }
            const isActive = p === page;
            return (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors ${isActive
                        ? "bg-[#37137F] text-white shadow-xs"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                        }`}
                >
                    {p}
                </button>
            );
        });
    };

    return (
        <section className="w-full flex flex-col gap-6">
            {/* Top Header Row */}
            <div className="w-full flex justify-between items-center gap-4">
                <Header
                    title="Audience Segmentation"
                    body="Manage & Engage With Your Audience"
                />

                {/* Filter by Events Button */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setIsEventFilterOpen((prev) => !prev)}
                        className="h-8 sm:h-10 px-2.5 sm:px-4 bg-[#EBE6F8] sm:bg-white text-[#37137F] sm:text-gray-700 border border-transparent sm:border-[#37137F26] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 hover:opacity-90 sm:hover:bg-gray-50 transition-all cursor-pointer shadow-2xs"
                    >
                        <span>{selectedEvent}</span>
                        <IoChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${isEventFilterOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {isEventFilterOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsEventFilterOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30">
                                {["All Events", "Summer Music Festival", "Winter Gala", "Tech Expo"].map((evt) => (
                                    <button
                                        key={evt}
                                        onClick={() => {
                                            setSelectedEvent(evt === "All Events" ? "Filter by Events" : evt);
                                            setIsEventFilterOpen(false);
                                            setPage(1);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {evt}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile View: Segment Selector Pill Dropdown + Active Single Card */}
            <div className="w-full flex flex-col gap-3 sm:hidden">
                {/* Lavender Segment Dropdown Selector */}
                <div className="relative w-full">
                    <button
                        onClick={() => setIsSegmentDropdownOpen((prev) => !prev)}
                        className="w-full bg-[#EBE6F8] hover:bg-[#e3dcf6] transition-colors rounded-2xl p-3.5 flex items-center justify-between text-[#37137F] cursor-pointer shadow-2xs"
                    >
                        <div className="flex items-center gap-2.5">
                            <LuUsers className="text-[#37137F] text-base" />
                            <span className="font-bold text-xs sm:text-sm">
                                {activeSegmentObj.title}
                            </span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#37137F] text-white flex items-center justify-center shrink-0">
                            <IoChevronDown
                                size={11}
                                className={`transition-transform duration-200 ${isSegmentDropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </div>
                    </button>

                    {isSegmentDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsSegmentDropdownOpen(false)}
                            />
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-30 flex flex-col gap-1">
                                {segments.map((seg) => (
                                    <button
                                        key={seg.key}
                                        onClick={() => {
                                            setSelectedSegment(seg.key);
                                            setIsSegmentDropdownOpen(false);
                                            setPage(1);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${selectedSegment === seg.key
                                            ? "bg-[#F3F0FA] text-[#37137F]"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: seg.iconColor }}
                                            />
                                            <span>{seg.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-normal">
                                            {typeof seg.value === "number"
                                                ? seg.value.toLocaleString()
                                                : seg.value}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Active Selected Card on Mobile */}
                <div className="w-full">
                    <AudienceCard
                        key={activeSegmentObj.key}
                        title={activeSegmentObj.title}
                        value={isMetricsLoading ? "..." : activeSegmentObj.value}
                        subtitle={activeSegmentObj.subtitle}
                        iconColor={activeSegmentObj.iconColor}
                        isSelected={true}
                    />
                </div>
            </div>

            {/* Desktop / Tablet View: Grid with all 5 Segment Metric Cards */}
            <div className="w-full hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="w-full flex">
                <div className="w-full p-4 sm:p-6 rounded-2xl md:rounded-3xl bg-white flex flex-col gap-4 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                    {/* Toolbar Header */}
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        {/* Active Segment Label with Filter Icon */}
                        <div className="flex gap-2 items-center">
                            <MdFilterList size={20} className="text-gray-700 shrink-0" />
                            <p className="font-bold text-sm sm:text-base text-gray-900">
                                {activeSegmentObj.title}
                            </p>
                        </div>

                        {/* Search and Action Buttons */}
                        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <div className="w-full sm:w-64 md:w-72">
                                <CustomField<string>
                                    prefix={<IoSearch />}
                                    placeholder="Search Users..."
                                    value={search}
                                    onChange={(e) => {
                                        const val =
                                            typeof e === "string"
                                                ? e
                                                : (e as unknown as { target?: { value?: string } })?.target?.value ?? "";
                                        setSearch(val);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => navigate("/dashboard/audience/message")}
                                    className="flex-1 sm:flex-none bg-[#E59E39] hover:bg-[#d48e2b] transition-colors rounded-xl px-3.5 sm:px-4 font-semibold text-white h-10 sm:h-11 text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                                >
                                    <FiMail size={14} />
                                    <span>Send Message</span>
                                </button>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                                        className="flex-1 sm:flex-none bg-[#37137F] hover:bg-[#2c0f66] transition-colors rounded-xl px-3.5 sm:px-4 font-semibold text-white h-10 sm:h-11 text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                                    >
                                        <LuFileSpreadsheet size={14} />
                                        <span>Export Data</span>
                                        <IoChevronDown
                                            size={13}
                                            className={`transition-transform duration-200 ${
                                                isDataMenuOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {isDataMenuOpen && (
                                        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 flex flex-col">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDataMenuOpen(false);
                                                    navigate("/dashboard/audience/export");
                                                }}
                                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                                <LuFileSpreadsheet size={14} className="text-[#37137F]" />
                                                <span>Export Data</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDataMenuOpen(false);
                                                    navigate("/dashboard/audience/import");
                                                }}
                                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                                <LuCloudUpload size={14} className="text-[#37137F]" />
                                                <span>Import Data</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-hidden">
                        <CustomTable<AudienceTableRow>
                            columns={columns}
                            rows={rows}
                            rowKey="id"
                            total={totalUsers}
                            page={page}
                            onPageChange={setPage}
                            rowsPerPage={10}
                            isLoading={isCustomersLoading}
                            emptyText="No audience records found"
                            headerClassName="border-b border-gray-100 bg-transparent"
                            thClassName="py-3 px-4 text-xs sm:text-sm font-bold text-gray-900 text-left whitespace-nowrap"
                            customPagination={
                                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
                                        Showing {rows.length} Of {totalUsers} Users
                                    </span>

                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                                            <button
                                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                                disabled={page === 1}
                                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>

                                            {renderPaginationItems()}

                                            <button
                                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                                disabled={page === totalPages}
                                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
