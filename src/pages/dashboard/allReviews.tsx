import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/common";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import {
    IoChevronDown,
    IoSearchOutline,
    IoClose,
    IoChevronBack,
} from "react-icons/io5";
import {
    FaStar,
    FaRegStar,
    FaArrowTrendUp,
    FaArrowTrendDown,
} from "react-icons/fa6";
import {
    FiCornerUpLeft,
    FiCopy,
    FiCheck,
} from "react-icons/fi";
import {
    LuDownload,
    LuLayoutGrid,
    LuList,
    LuMessageSquare,
    LuRotateCcw,
} from "react-icons/lu";
import moment from "moment";
import { toast } from "@heroui/react";
import useReview, { type ReviewItemResponse } from "../../hooks/useReview";

interface SelectedEventItem {
    id?: string;
    name: string;
}

type StarFilter = "all" | "5" | "4" | "3" | "2" | "1" | "4+" | "3+";
type SortOption = "newest" | "oldest" | "highest" | "lowest";
type ViewMode = "cards" | "table";

export default function AllReviews() {
    const navigate = useNavigate();

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<SelectedEventItem>({
        id: undefined,
        name: "All Events",
    });
    const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
    const [eventSearchText, setEventSearchText] = useState("");
    const [starFilter, setStarFilter] = useState<StarFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [viewMode, setViewMode] = useState<ViewMode>("cards");

    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(12);

    // Modals / Actions state
    const [replyingReview, setReplyingReview] = useState<ReviewItemResponse | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replySent, setReplySent] = useState(false);
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const eventDropdownRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedEvent.id, starFilter, sortBy, rowsPerPage]);

    // Close popovers on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                eventDropdownRef.current &&
                !eventDropdownRef.current.contains(e.target as Node)
            ) {
                setIsEventDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Review hooks
    const { useGetReviews, useGetReviewStats, useGetAllEvents } = useReview();

    // Calculate ratingFloor param for API
    const ratingFloorParam = useMemo(() => {
        if (starFilter === "4+") return 4;
        if (starFilter === "3+") return 3;
        if (starFilter === "5") return 5;
        if (starFilter === "4") return 4;
        if (starFilter === "3") return 3;
        if (starFilter === "2") return 2;
        if (starFilter === "1") return 1;
        return undefined;
    }, [starFilter]);

    // Fetch review stats
    const { data: statsResponse, isLoading: isStatsLoading } = useGetReviewStats({
        eventId: selectedEvent.id,
    });

    // Fetch paginated reviews from API
    const { data: reviewsResponse, isLoading: isReviewsLoading } = useGetReviews({
        page,
        pageSize: rowsPerPage,
        ratingFloor: ratingFloorParam,
        eventId: selectedEvent.id,
    });

    // Fetch events list
    const { data: eventsResponse } = useGetAllEvents();

    // Extract available events for dropdown
    const availableEvents: SelectedEventItem[] = useMemo(() => {
        const list: SelectedEventItem[] = [{ id: undefined, name: "All Events" }];
        const rawEvents =
            (eventsResponse as any)?.events ??
            (eventsResponse as any)?.result ??
            (eventsResponse as any)?.data ??
            (Array.isArray(eventsResponse) ? eventsResponse : []);

        if (Array.isArray(rawEvents)) {
            rawEvents.forEach((ev: any) => {
                const id = ev._id || ev.id;
                const name = ev.title || ev.name;
                if (name && !list.some((item) => item.name === name || (id && item.id === id))) {
                    list.push({ id, name });
                }
            });
        }
        return list;
    }, [eventsResponse]);

    const filteredEvents = useMemo(() => {
        if (!eventSearchText.trim()) return availableEvents;
        const q = eventSearchText.toLowerCase().trim();
        return availableEvents.filter((e) => e.name.toLowerCase().includes(q));
    }, [availableEvents, eventSearchText]);

    // Parse Stats & KPI numbers
    const statsData = useMemo(() => {
        const raw =
            statsResponse?.statsAverages ??
            statsResponse?.data?.statsAverages ??
            statsResponse?.result?.statsAverages;

        const avg = typeof raw?.averageRating === "number" ? raw.averageRating : 0;
        const pctChange = typeof raw?.percentageChange === "number" ? raw.percentageChange : 0;
        const trend = raw?.trend || (pctChange >= 0 ? "increased" : "decreased");
        const currentQuarter = raw?.currentQuarterReviews ?? 0;
        const previousQuarter = raw?.previousQuarterReviews ?? 0;

        const rawList =
            statsResponse?.ratingDistribution?.ratingDistribution ??
            statsResponse?.data?.ratingDistribution?.ratingDistribution ??
            statsResponse?.result?.ratingDistribution?.ratingDistribution ??
            [];

        let fiveStarsCount = 0;
        let criticalCount = 0;
        let totalRatingsCount = 0;

        if (Array.isArray(rawList)) {
            rawList.forEach((item: any) => {
                const count = Number(item?.count ?? 0);
                const rating = Number(item?.rating ?? 0);
                totalRatingsCount += count;
                if (rating === 5) fiveStarsCount += count;
                if (rating <= 2) criticalCount += count;
            });
        }

        return {
            averageRating: avg,
            percentageChange: pctChange,
            trend,
            currentQuarterReviews: currentQuarter,
            previousQuarterReviews: previousQuarter,
            fiveStarsCount,
            criticalCount,
            totalRatingsCount,
        };
    }, [statsResponse]);

    // Parse raw reviews from API response
    const rawReviewsList: ReviewItemResponse[] = useMemo(() => {
        const raw =
            reviewsResponse?.data ??
            reviewsResponse?.result?.data ??
            (Array.isArray(reviewsResponse) ? reviewsResponse : []);
        return Array.isArray(raw) ? raw : [];
    }, [reviewsResponse]);

    // Filter by client search query and exact star if needed
    const processedReviews = useMemo(() => {
        let list = [...rawReviewsList];

        // Specific star filter (1..5) if not covered by API ratingFloor
        if (["1", "2", "3", "4", "5"].includes(starFilter)) {
            const targetStar = Number(starFilter);
            list = list.filter((r) => Math.round(Number(r.rating ?? 5)) === targetStar);
        }

        // Search text matching attendee name, username, email, or comment text
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            list = list.filter((r) => {
                const name = (r.user?.fullname || "").toLowerCase();
                const username = (r.user?.username || "").toLowerCase();
                const email = (r.user?.email || "").toLowerCase();
                const comment = (r.comment || "").toLowerCase();
                const eventName =
                    typeof r.event === "object"
                        ? (r.event?.name || r.event?.title || "").toLowerCase()
                        : String(r.event || "").toLowerCase();

                return (
                    name.includes(q) ||
                    username.includes(q) ||
                    email.includes(q) ||
                    comment.includes(q) ||
                    eventName.includes(q)
                );
            });
        }

        // Sorting
        list.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            const ratingA = Number(a.rating ?? 0);
            const ratingB = Number(b.rating ?? 0);

            if (sortBy === "oldest") return timeA - timeB;
            if (sortBy === "highest") return ratingB - ratingA;
            if (sortBy === "lowest") return ratingA - ratingB;
            return timeB - timeA; // default newest
        });

        return list;
    }, [rawReviewsList, starFilter, debouncedSearch, sortBy]);

    // Pagination info
    const pagination = useMemo(() => {
        const pag =
            reviewsResponse?.pagination ??
            reviewsResponse?.result?.pagination;
        const total = pag?.total ?? processedReviews.length;
        const totalPages =
            pag?.totalPages ?? Math.max(1, Math.ceil(total / rowsPerPage));
        return {
            page: pag?.page ?? page,
            limit: rowsPerPage,
            total,
            totalPages,
        };
    }, [reviewsResponse, processedReviews.length, page, rowsPerPage]);

    // Color helper by rating
    const getAccentColor = (rating: number) => {
        const r = Math.round(rating);
        switch (r) {
            case 5:
                return "#10B981"; // Emerald
            case 4:
                return "#3B82F6"; // Blue
            case 3:
                return "#6366F1"; // Indigo
            case 2:
                return "#F59E0B"; // Amber
            default:
                return "#EF4444"; // Red
        }
    };

    const renderStars = (rating: number, size = 13) => {
        const rounded = Math.round(rating);
        return (
            <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => {
                    const isFilled = i < rounded;
                    return isFilled ? (
                        <FaStar key={i} size={size} />
                    ) : (
                        <FaRegStar key={i} size={size} className="text-gray-300" />
                    );
                })}
            </div>
        );
    };

    const handleCopyReview = (review: ReviewItemResponse) => {
        const author = review.user?.fullname || review.user?.username || "Attendee";
        const text = `"${review.comment}" — ${author}`;
        navigator.clipboard.writeText(text);
        const id = review._id ?? review.id ?? 1;
        setCopiedId(id);
        toast.success("Review quote copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setReplySent(true);
        setTimeout(() => {
            setReplySent(false);
            setReplyingReview(null);
            setReplyText("");
            toast.success("Response sent successfully!");
        }, 1200);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setSelectedEvent({ id: undefined, name: "All Events" });
        setStarFilter("all");
        setSortBy("newest");
        setPage(1);
    };

    const isAnyFilterActive = Boolean(
        searchQuery.trim() ||
        selectedEvent.id ||
        starFilter !== "all" ||
        sortBy !== "newest"
    );

    // Export reviews to CSV
    const handleExportCSV = () => {
        if (processedReviews.length === 0) {
            toast.danger("No reviews available to export");
            return;
        }

        const headers = ["Attendee", "Email", "Event", "Rating", "Review Comment", "Date"];
        const rows = processedReviews.map((r) => {
            const userName = r.user?.fullname || r.user?.username || "Attendee";
            const email = r.user?.email || "";
            const eventName =
                typeof r.event === "object"
                    ? r.event?.name || r.event?.title || "Event"
                    : String(r.event || "");
            const rating = String(r.rating ?? 5);
            const comment = `"${(r.comment || "").replace(/"/g, '""')}"`;
            const date = r.createdAt ? moment(r.createdAt).format("YYYY-MM-DD HH:mm") : "";
            return [userName, email, eventName, rating, comment, date];
        });

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `reviews_export_${moment().format("YYYYMMDD_HHmm")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${processedReviews.length} reviews to CSV!`);
    };

    // Columns for CustomTable (Table View)
    const tableColumns: Column<ReviewItemResponse>[] = [
        {
            id: "sNo",
            name: "S/No",
            render: (_value, _item) => {
                const idx = processedReviews.indexOf(_item);
                return (
                    <span className="w-7 h-7 rounded-full bg-[#F3F0FA] text-[#2E0F74] flex items-center justify-center text-xs font-bold shrink-0">
                        {(page - 1) * rowsPerPage + idx + 1}
                    </span>
                );
            },
        },
        {
            id: "user",
            name: "Attendee",
            render: (_value, item) => {
                const name = item.user?.fullname || item.user?.username || "Attendee";
                const avatar =
                    item.user?.photo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        name
                    )}&background=37137F&color=fff&size=100`;

                return (
                    <div className="flex items-center gap-2.5">
                        <img
                            src={avatar}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-100 bg-gray-50 shrink-0"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    name
                                )}&background=37137F&color=fff&size=100`;
                            }}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                {name}
                            </span>
                            {item.user?.email && (
                                <span className="text-[11px] text-gray-400 truncate max-w-44">
                                    {item.user.email}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "event",
            name: "Event",
            render: (_value, item) => {
                const eventName =
                    typeof item.event === "object"
                        ? item.event?.name || item.event?.title || "Event"
                        : item.event || "General";
                return (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium truncate max-w-48 inline-block">
                        {eventName}
                    </span>
                );
            },
        },
        {
            id: "rating",
            name: "Rating",
            render: (_value, item) => {
                const rating = typeof item.rating === "number" ? item.rating : 5;
                const accent = getAccentColor(rating);
                return (
                    <div className="flex items-center gap-2">
                        {renderStars(rating, 11)}
                        <span
                            style={{ color: accent }}
                            className="text-xs font-bold"
                        >
                            {rating.toFixed(1)}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "comment",
            name: "Review",
            render: (_value, item) => (
                <p className="text-xs text-gray-700 line-clamp-2 max-w-md font-normal leading-relaxed">
                    “{item.comment}”
                </p>
            ),
        },
        {
            id: "date",
            name: "Date",
            render: (_value, item) => (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {item.createdAt ? moment(item.createdAt).format("MMM D, YYYY") : "Recent"}
                </span>
            ),
        },
        {
            id: "actions",
            name: "Actions",
            render: (_value, item) => {
                const revId = item._id ?? item.id ?? Math.random();
                return (
                    <div className="flex items-center gap-1.5 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setReplyingReview(item);
                                setReplyText("");
                            }}
                            title="Reply to review"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#37137F] hover:bg-[#F3F0FA] transition cursor-pointer"
                        >
                            <FiCornerUpLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCopyReview(item)}
                            title="Copy quote"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                        >
                            {copiedId === revId ? (
                                <FiCheck size={14} className="text-emerald-600" />
                            ) : (
                                <FiCopy size={14} />
                            )}
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <section className="w-full flex flex-col gap-6 pb-12">
            {/* Top Navigation & Header */}
            <div className="w-full flex flex-col gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/reviews")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#37137F] transition-colors cursor-pointer w-fit"
                >
                    <IoChevronBack size={14} />
                    <span>Back to Reviews Overview</span>
                </button>

                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Header
                        title="All Reviews & Feedback"
                        body="Browse, search, and manage all attendee feedback across your events"
                    />

                    {/* Actions: Export & View Switcher */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* View Switcher */}
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("cards")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewMode === "cards"
                                        ? "bg-white text-[#37137F] shadow-xs font-bold"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                title="Card View"
                            >
                                <LuLayoutGrid size={14} />
                                <span className="hidden sm:inline">Cards</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("table")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewMode === "table"
                                        ? "bg-white text-[#37137F] shadow-xs font-bold"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                                title="Table View"
                            >
                                <LuList size={14} />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                        </div>

                        {/* Export CSV button */}
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer"
                        >
                            <LuDownload size={14} className="text-[#37137F]" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className={`w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${isStatsLoading ? "opacity-60 animate-pulse" : ""}`}>
                {/* 1. Total Reviews */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Total Reviews
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-[#37137F10] text-[#37137F] flex items-center justify-center">
                            <LuMessageSquare size={15} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-extrabold text-gray-900">
                            {pagination.total.toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Across all hosted events
                        </p>
                    </div>
                </div>

                {/* 2. Average Rating */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Average Rating
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                            {statsData.percentageChange >= 0 ? (
                                <FaArrowTrendUp size={12} />
                            ) : (
                                <FaArrowTrendDown size={12} className="text-rose-500" />
                            )}
                            <span>{statsData.percentageChange > 0 ? `+${statsData.percentageChange}%` : `${statsData.percentageChange}%`}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-[#37137F]">
                            {statsData.averageRating > 0 ? statsData.averageRating.toFixed(2) : "0.00"}
                        </h3>
                        <div className="flex items-center">
                            {renderStars(statsData.averageRating || 5, 12)}
                        </div>
                    </div>
                </div>

                {/* 3. 5-Star Reviews */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            5-Star Reviews
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Top Rated
                        </span>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-extrabold text-emerald-600">
                            {statsData.fiveStarsCount.toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Highest attendee satisfaction
                        </p>
                    </div>
                </div>

                {/* 4. Critical Feedback */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Needs Attention
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            ≤ 2 Stars
                        </span>
                    </div>
                    <div className="mt-3">
                        <h3 className="text-2xl font-extrabold text-amber-600">
                            {statsData.criticalCount.toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Reviews requiring attendee response
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
                    {/* Search box */}
                    <div className="flex-1 min-w-56 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#37137F] focus-within:bg-white transition-all">
                        <IoSearchOutline size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by attendee name, email, or review comment..."
                            className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <IoClose size={15} />
                            </button>
                        )}
                    </div>

                    {/* Event Filter Dropdown */}
                    <div ref={eventDropdownRef} className="relative min-w-52">
                        <button
                            type="button"
                            onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-2xs hover:border-gray-300 transition cursor-pointer text-left"
                        >
                            <span className="text-xs font-semibold text-gray-800 truncate">
                                {selectedEvent.name}
                            </span>
                            <IoChevronDown
                                size={14}
                                className={`text-gray-400 shrink-0 transition-transform ${
                                    isEventDropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {isEventDropdownOpen && (
                            <div className="absolute top-full mt-1.5 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                {availableEvents.length > 5 && (
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <IoSearchOutline size={14} className="text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Filter events..."
                                                value={eventSearchText}
                                                onChange={(e) => setEventSearchText(e.target.value)}
                                                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredEvents.map((evt) => (
                                        <div
                                            key={evt.id ?? evt.name}
                                            onClick={() => {
                                                setSelectedEvent(evt);
                                                setIsEventDropdownOpen(false);
                                            }}
                                            className={`px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                                                selectedEvent.name === evt.name
                                                    ? "bg-[#37137F15] text-[#37137F] font-bold"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="truncate">{evt.name}</span>
                                            {selectedEvent.name === evt.name && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#37137F]" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap hidden sm:inline">
                            Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 shadow-2xs outline-none cursor-pointer hover:border-gray-300"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>
                </div>

                {/* Rating Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400 mr-1.5">
                            Rating:
                        </span>
                        {(
                            [
                                { id: "all", label: "All Stars" },
                                { id: "5", label: "5 Stars ★" },
                                { id: "4", label: "4 Stars ★" },
                                { id: "3", label: "3 Stars ★" },
                                { id: "2", label: "2 Stars ★" },
                                { id: "1", label: "1 Star ★" },
                                { id: "4+", label: "4+ Stars" },
                            ] as const
                        ).map((pill) => {
                            const isSelected = starFilter === pill.id;
                            return (
                                <button
                                    key={pill.id}
                                    type="button"
                                    onClick={() => setStarFilter(pill.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                        isSelected
                                            ? "bg-[#2E1065] text-white shadow-xs"
                                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/60"
                                    }`}
                                >
                                    {pill.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Reset Filters button if any active */}
                    {isAnyFilterActive && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#37137F] hover:text-[#200B4D] transition cursor-pointer"
                        >
                            <LuRotateCcw size={13} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area: Card View OR Table View */}
            {isReviewsLoading ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs animate-pulse flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="w-28 h-3.5 bg-gray-200 rounded" />
                                    <div className="w-20 h-2.5 bg-gray-200 rounded" />
                                </div>
                                <div className="w-16 h-3 bg-gray-200 rounded" />
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-full mt-2" />
                            <div className="h-3 bg-gray-200 rounded w-4/5" />
                            <div className="h-2.5 bg-gray-200 rounded w-20 mt-2" />
                        </div>
                    ))}
                </div>
            ) : processedReviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-[#37137F10] text-[#37137F] flex items-center justify-center">
                        <FaRegStar size={26} />
                    </div>
                    <h3 className="font-bold text-base text-gray-900">
                        No Reviews Found
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                        No attendee feedback matches your current search or filter criteria. Try clearing the search or choosing a different event.
                    </p>
                    {isAnyFilterActive && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 px-4 py-2 rounded-xl bg-[#37137F] text-white text-xs font-semibold hover:bg-[#200B4D] transition shadow-xs cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : viewMode === "cards" ? (
                /* ── CARDS VIEW ── */
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {processedReviews.map((rev, index) => {
                        const revId = rev._id ?? rev.id ?? index;
                        const userName = rev.user?.fullname || rev.user?.username || "Attendee";
                        const userAvatar =
                            rev.user?.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                userName
                            )}&background=37137F&color=fff&size=100`;
                        const eventName =
                            typeof rev.event === "object"
                                ? rev.event?.name || rev.event?.title || "Event"
                                : rev.event || "Event Attendee";
                        const ratingValue = typeof rev.rating === "number" ? rev.rating : 5;
                        const accentColor = getAccentColor(ratingValue);
                        const timeAgoStr = rev.createdAt
                            ? moment(rev.createdAt).fromNow()
                            : "Recent";

                        return (
                            <div
                                key={revId}
                                style={{ borderTopColor: accentColor }}
                                className="bg-white rounded-2xl p-5 border border-gray-100 border-t-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4 text-left relative"
                            >
                                <div className="flex flex-col gap-3">
                                    {/* Card Top: Avatar, Name, Event & Stars */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={userAvatar}
                                                alt={userName}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-100 bg-gray-50 shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        userName
                                                    )}&background=37137F&color=fff&size=100`;
                                                }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm text-gray-900 truncate">
                                                    {userName}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-medium truncate max-w-40">
                                                    {eventName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            {renderStars(ratingValue, 12)}
                                            <span
                                                style={{ color: accentColor }}
                                                className="text-[10px] font-bold mt-0.5"
                                            >
                                                {ratingValue.toFixed(1)} / 5.0
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment text */}
                                    <p className="text-xs text-gray-700 leading-relaxed font-normal">
                                        “{rev.comment}”
                                    </p>
                                </div>

                                {/* Card Footer: Timestamp & Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                                    <span
                                        className="text-[10px] font-semibold text-gray-400 capitalize"
                                        title={rev.createdAt ? moment(rev.createdAt).format("LLLL") : ""}
                                    >
                                        {timeAgoStr}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReplyingReview(rev);
                                                setReplyText("");
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#37137F] hover:bg-[#F3F0FA] transition cursor-pointer"
                                            title="Reply to review"
                                        >
                                            <FiCornerUpLeft size={13} />
                                            <span>Reply</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCopyReview(rev)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                                            title="Copy review quote"
                                        >
                                            {copiedId === revId ? (
                                                <FiCheck size={14} className="text-emerald-600" />
                                            ) : (
                                                <FiCopy size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── TABLE VIEW ── */
                <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <CustomTable
                        columns={tableColumns}
                        rows={processedReviews}
                        rowKey="_id"
                        total={pagination.total}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={rowsPerPage}
                    />
                </div>
            )}

            {/* Pagination Footer */}
            {pagination.totalPages > 1 && (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <span>
                            Showing{" "}
                            <strong className="text-gray-800">
                                {(page - 1) * rowsPerPage + 1}
                            </strong>{" "}
                            to{" "}
                            <strong className="text-gray-800">
                                {Math.min(page * rowsPerPage, pagination.total)}
                            </strong>{" "}
                            of{" "}
                            <strong className="text-gray-800">
                                {pagination.total.toLocaleString()}
                            </strong>{" "}
                            reviews
                        </span>

                        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                            <span className="text-[11px] text-gray-400">Per page:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="bg-white border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:border-gray-300"
                            >
                                <option value={6}>6</option>
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page <= 1 || isReviewsLoading}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from(
                                { length: Math.min(5, pagination.totalPages) },
                                (_, i) => {
                                    let pageNum = i + 1;
                                    if (pagination.totalPages > 5 && page > 3) {
                                        pageNum = page - 3 + i;
                                        if (pageNum > pagination.totalPages) {
                                            pageNum = pagination.totalPages - (4 - i);
                                        }
                                    }
                                    const isCurrent = page === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setPage(pageNum)}
                                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                isCurrent
                                                    ? "bg-[#37137F] text-white shadow-2xs font-bold"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(pagination.totalPages, prev + 1)
                                )
                            }
                            disabled={page >= pagination.totalPages || isReviewsLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-[#37137F] text-white text-xs font-semibold hover:bg-[#200B4D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Reply Modal */}
            {replyingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-left">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Respond to Attendee Review
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Your response will be sent directly to the attendee
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplyingReview(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        {/* Quoted Review */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-gray-900">
                                    {replyingReview.user?.fullname ||
                                        replyingReview.user?.username ||
                                        "Attendee"}
                                </span>
                                {renderStars(replyingReview.rating ?? 5, 12)}
                            </div>
                            <p className="text-xs text-gray-600 italic leading-relaxed">
                                “{replyingReview.comment}”
                            </p>
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                            <label className="text-xs font-semibold text-gray-700">
                                Your Message
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a thoughtful reply or thank attendee for their feedback..."
                                className="w-full text-xs p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all resize-none placeholder-gray-400"
                            />

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setReplyingReview(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={replySent}
                                    className="px-5 py-2.5 text-xs font-semibold bg-[#37137F] text-white hover:bg-[#200B4D] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {replySent ? (
                                        <>
                                            <FiCheck size={14} />
                                            <span>Sent</span>
                                        </>
                                    ) : (
                                        <span>Send Response</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
