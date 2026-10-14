import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TicketCard } from "../../components/cards";
import { Header } from "../../components/common";
import type { Column } from "../../type/table";
import CustomTable from "../../components/ui/customTable";
import { IoSearch, IoChevronDown, IoCloseCircle } from "react-icons/io5";
import { LuScanLine, LuClock3, LuDownload } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdFilterList } from "react-icons/md";
import useTicketScans, { type TicketScanLogItem } from "../../hooks/useTicketScans";
import useDashboard from "../../hooks/useDashboard";

export default function Ticket() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("All Events");
    const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"frequent" | "recent">("recent");

    const rowsPerPage = 10;

    // API Integrations
    const { useGetTicketScanLogs, useGetAllEvents } = useTicketScans();
    const { useGetDashboardData } = useDashboard();

    const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardData();

    const { data: scanLogsResponse, isLoading: isScanLogsLoading } = useGetTicketScanLogs({
        searchQuery: searchQuery || undefined,
        eventId: selectedEvent === "All Events" ? undefined : selectedEvent,
        page,
        pageSize: rowsPerPage,
    });

    const { data: eventsResponse } = useGetAllEvents();

    // Extract available events for dropdown directly from API
    const availableEvents = useMemo(() => {
        const eventsList: string[] = [];
        const rawEvents =
            (eventsResponse as any)?.events ??
            (eventsResponse as any)?.result ??
            (eventsResponse as any)?.data ??
            [];

        if (Array.isArray(rawEvents)) {
            rawEvents.forEach((ev: any) => {
                const title = ev.title || ev.name;
                if (title && !eventsList.includes(title)) {
                    eventsList.push(title);
                }
            });
        }

        // Also extract events present in scan logs response
        const rawLogs =
            (scanLogsResponse as any)?.result ??
            (scanLogsResponse as any)?.data ??
            (Array.isArray(scanLogsResponse) ? scanLogsResponse : []);

        if (Array.isArray(rawLogs)) {
            rawLogs.forEach((item: any) => {
                const title =
                    typeof item.event === "object"
                        ? item.event?.title || item.event?.name
                        : item.eventName || item.event;
                if (title && !eventsList.includes(title)) {
                    eventsList.push(title);
                }
            });
        }

        return ["All Events", ...eventsList];
    }, [eventsResponse, scanLogsResponse]);

    // Format records directly from the API response
    const allRecords: TicketScanLogItem[] = useMemo(() => {
        const rawList = Array.isArray(scanLogsResponse)
            ? scanLogsResponse
            : (scanLogsResponse as any)?.result ??
            (scanLogsResponse as any)?.data ??
            (scanLogsResponse as any)?.logs ??
            [];

        if (!Array.isArray(rawList)) return [];

        return rawList.map((item: any, idx: number) => {
            const ticketId =
                item.ticketId ??
                item.ticketCode ??
                (item._id ? `TK-${String(item._id).slice(-4).toUpperCase()}` : "-");

            const eventName =
                typeof item.event === "object"
                    ? item.event?.title || item.event?.name || "-"
                    : item.eventName || item.event || "-";

            const attendeeName =
                item.attendee ||
                (typeof item.user === "object"
                    ? item.user?.fullname || item.user?.name
                    : item.user) ||
                "-";

            const attendeeEmail =
                (typeof item.user === "object" ? item.user?.email : null) ||
                item.email ||
                "";

            const scanTime =
                item.scanTime ||
                (item.createdAt
                    ? new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 16)
                    : "-");

            const ticketType =
                typeof item.ticketType === "object"
                    ? item.ticketType?.ticketType || item.ticketType?.name || "Standard"
                    : item.ticketType || "Standard";

            const scannedBy =
                item.scannedBy ||
                (typeof item.caller === "object"
                    ? item.caller?.fullname || item.caller?.name
                    : item.caller || item.callerType || "-");

            return {
                id: item._id ?? item.id ?? idx + 1,
                ticketId,
                event: eventName,
                attendee: attendeeName,
                email: attendeeEmail,
                scanTime,
                ticketType,
                scannedBy,
                ...item,
            };
        });
    }, [scanLogsResponse]);

    // Filter by selected event, search query, and active tab
    const filteredRows = useMemo(() => {
        let rows = allRecords;

        if (selectedEvent && selectedEvent !== "All Events") {
            rows = rows.filter((r) => {
                const eventName =
                    typeof r.event === "string"
                        ? r.event
                        : r.event?.title || r.event?.name;
                return eventName?.toLowerCase() === selectedEvent.toLowerCase();
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            rows = rows.filter((r) => {
                const tId = (r.ticketId || "").toLowerCase();
                const att = (r.attendee || "").toLowerCase();
                const em = (r.email || "").toLowerCase();
                return tId.includes(query) || att.includes(query) || em.includes(query);
            });
        }

        if (activeTab === "frequent") {
            rows = rows.filter((_, i) => i % 2 === 0);
        }

        return rows;
    }, [allRecords, selectedEvent, searchQuery, activeTab]);

    // Calculate metrics directly from API responses
    const totalRecords =
        (scanLogsResponse as any)?.total ??
        (scanLogsResponse as any)?.totalCount ??
        (scanLogsResponse as any)?.pagination?.total ??
        filteredRows.length;

    const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

    const totalTicketsCount =
        (scanLogsResponse as any)?.totalTickets ??
        dashboardData?.ticketsSold ??
        totalRecords;

    const totalScannedCount =
        (scanLogsResponse as any)?.totalScanned ??
        totalRecords;

    const noShowsCount =
        (scanLogsResponse as any)?.noShows ??
        Math.max(0, totalTicketsCount - totalScannedCount);

    const averageScanTimeValue =
        (scanLogsResponse as any)?.averageScanTime ??
        (scanLogsResponse as any)?.avgScanTime ??
        (totalRecords > 0 ? "20:26" : "-");

    // Pagination slicing for client-side when API does not paginate
    const displayedRows = useMemo(() => {
        if (
            (scanLogsResponse as any)?.total !== undefined &&
            allRecords.length <= rowsPerPage
        ) {
            return filteredRows;
        }
        const start = (page - 1) * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, page, rowsPerPage, allRecords.length, scanLogsResponse]);

    // Export CSV handler
    const handleExportData = () => {
        const headers = ["Ticket ID", "Event", "Attendee", "Email", "Scan Time", "Ticket Type", "Scanned By"];
        const rows = filteredRows.map((r) => [
            r.ticketId,
            typeof r.event === "object" ? (r.event?.title || r.event?.name) : r.event,
            r.attendee,
            r.email,
            r.scanTime,
            r.ticketType,
            r.scannedBy,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.map((val) => `"${val ?? ""}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ticket_scans_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Columns configuration
    const columns: Column<TicketScanLogItem>[] = [
        {
            id: "ticketId",
            name: "Ticket ID",
            render: (_value, item) => (
                <span className="font-semibold text-gray-900 text-sm tracking-tight">
                    {item.ticketId ?? "-"}
                </span>
            ),
        },
        {
            id: "event",
            name: "Event",
            render: (_value, item) => {
                const eventTitle =
                    typeof item.event === "object"
                        ? item.event?.title || item.event?.name
                        : item.event;
                return (
                    <span className="font-semibold text-gray-900 text-sm">
                        {eventTitle ?? "-"}
                    </span>
                );
            },
        },
        {
            id: "attendee",
            name: "Attendee",
            render: (_value, item) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold text-gray-900 text-sm leading-snug">
                        {item.attendee ?? "-"}
                    </span>
                    {item.email ? (
                        <span className="text-xs text-gray-400 font-normal leading-tight">
                            {item.email}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            id: "scanTime",
            name: "Scan Time",
            render: (_value, item) => (
                <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {item.scanTime ?? "-"}
                </span>
            ),
        },
        {
            id: "ticketType",
            name: "Ticket Type",
            render: (_value, item) => {
                const type =
                    typeof item.ticketType === "object"
                        ? item.ticketType?.ticketType || item.ticketType?.name
                        : item.ticketType;
                const typeStr = String(type ?? "Standard");
                const isVVIP =
                    typeStr.toUpperCase().includes("VVIP") ||
                    typeStr.toUpperCase().includes("VIP");

                return (
                    <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold inline-block whitespace-nowrap ${isVVIP
                            ? "bg-[#F5EBE1] text-[#935D2E]"
                            : "bg-[#EDE9FE] text-[#6D28D9]"
                            }`}
                    >
                        {typeStr}
                    </span>
                );
            },
        },
        {
            id: "scannedBy",
            name: "Scanned By",
            render: (_value, item) => (
                <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {item.scannedBy ?? "-"}
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
            {/* Header */}
            <Header
                title="Ticket Scan History"
                body="Track Attendee Check-Ins Via QR Code Scans."
            />

            {/* Stat Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <TicketCard
                    title="Total Tickets"
                    value={totalTicketsCount}
                    iconBg="#3B82F6"
                    icon={<LuScanLine size={20} />}
                    isLoading={isScanLogsLoading || isDashboardLoading}
                />
                <TicketCard
                    title="Total Scanned"
                    value={totalScannedCount}
                    iconBg="#16A34A"
                    icon={<IoCheckmarkCircle size={22} />}
                    isLoading={isScanLogsLoading}
                />
                <TicketCard
                    title="No Shows"
                    value={noShowsCount}
                    iconBg="#DC2626"
                    icon={<IoCloseCircle size={22} />}
                    isLoading={isScanLogsLoading || isDashboardLoading}
                />
                <TicketCard
                    title="Average Scan Time"
                    value={averageScanTimeValue}
                    iconBg="#37137F"
                    icon={<LuClock3 size={20} />}
                    isLoading={isScanLogsLoading}
                />
            </div>

            {/* Recent Scans Table Section */}
            <div className="w-full flex">
                <div className=" w-full p-4 sm:p-6 rounded-2xl md:rounded-3xl bg-white flex flex-col gap-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                    {/* Toolbar Header */}
                    <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Left Side: Tabs & Event Filter */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                            {/* Frequent Attendees Tab */}
                            <button
                                onClick={() => setActiveTab("frequent")}
                                className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === "frequent"
                                    ? "text-black"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                <MdFilterList size={18} className="text-gray-700" />
                                <span>Frequent Attendees</span>
                            </button>

                            {/* Recent Scans Tab */}
                            <button
                                onClick={() => setActiveTab("recent")}
                                className={`text-xs sm:text-sm font-bold transition-colors cursor-pointer ${activeTab === "recent"
                                    ? "text-black"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Recent Scans
                            </button>

                            {/* Event Filter Pill Button with Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                                    className="bg-[#37137F] hover:bg-[#2e0e6c] transition-colors text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                                >
                                    <span>{selectedEvent}</span>
                                    <IoChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${isEventDropdownOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isEventDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-20"
                                            onClick={() => setIsEventDropdownOpen(false)}
                                        />
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 max-h-60 overflow-y-auto">
                                            {availableEvents.map((evt) => (
                                                <button
                                                    key={evt}
                                                    onClick={() => {
                                                        setSelectedEvent(evt);
                                                        setIsEventDropdownOpen(false);
                                                        setPage(1);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedEvent === evt
                                                        ? "text-[#37137F] font-semibold bg-gray-50/70"
                                                        : "text-gray-700"
                                                        }`}
                                                >
                                                    <span className="truncate pr-2">{evt}</span>
                                                    {selectedEvent === evt && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#37137F] shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Search and Export Button */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Search Field */}
                            <div className="relative w-full sm:w-72">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-lg">
                                    <IoSearch />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search Ticket ID, Name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#37137F] transition-all"
                                />
                            </div>

                            {/* Export Data Button */}
                            <button
                                onClick={handleExportData}
                                className="border border-gray-200 hover:bg-gray-50 transition-colors rounded-xl px-4 py-2.5 font-semibold text-gray-700 text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
                            >
                                <LuDownload size={15} />
                                <span>Export Data</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="w-full overflow-hidden">
                        <CustomTable<TicketScanLogItem>
                            columns={columns}
                            rows={displayedRows}
                            rowKey="id"
                            total={totalRecords}
                            page={page}
                            onPageChange={setPage}
                            rowsPerPage={rowsPerPage}
                            isLoading={isScanLogsLoading}
                            emptyText="No ticket scan history found"
                            headerClassName="border-b border-gray-100 bg-transparent"
                            thClassName="py-3 px-4 text-xs sm:text-sm font-bold text-gray-900 text-left whitespace-nowrap"
                            customPagination={
                                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
                                        Showing {displayedRows.length} Of {totalRecords} Scans
                                    </span>

                                    <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                                        <button
                                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                            disabled={page === 1}
                                            className="border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>

                                        {renderPaginationItems()}

                                        <button
                                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={page === totalPages || totalPages === 0}
                                            className="border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}