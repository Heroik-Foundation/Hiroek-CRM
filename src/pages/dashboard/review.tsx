import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "../../components/common";
import { IoChevronDown, IoSearchOutline, IoClose } from "react-icons/io5";
import { FaArrowTrendUp, FaArrowTrendDown, FaStar, FaRegStar } from "react-icons/fa6";
import { FiCornerUpLeft, FiCopy, FiCheck } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import moment from "moment";
import useReview, { type ReviewItemResponse } from "../../hooks/useReview";

interface SelectedEventItem {
    id?: string;
    name: string;
}

export default function Review() {
    const [selectedEvent, setSelectedEvent] = useState<SelectedEventItem>({
        id: undefined,
        name: "All Events",
    });
    const [ratingFloor, setRatingFloor] = useState<"4+" | "3+" | "All">("4+");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [eventSearch, setEventSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;

    // Modals / action states
    const [replyingReview, setReplyingReview] = useState<ReviewItemResponse | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replySent, setReplySent] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Compute rating floor query param
    const ratingFloorParam = useMemo(() => {
        if (ratingFloor === "4+") return 4;
        if (ratingFloor === "3+") return 3;
        return undefined;
    }, [ratingFloor]);

    const { useGetReviews, useGetReviewStats, useGetAllEvents } = useReview();

    // 1. Fetch review stats
    const {
        data: statsResponse,
        isLoading: isStatsLoading,
    } = useGetReviewStats({
        ratingFloor: ratingFloorParam,
        eventId: selectedEvent.id,
    });

    // 2. Fetch paginated reviews
    const {
        data: reviewsResponse,
        isLoading: isReviewsLoading,
    } = useGetReviews({
        page,
        pageSize: rowsPerPage,
        ratingFloor: ratingFloorParam,
        eventId: selectedEvent.id,
    });

    // 3. Fetch events for event filter dropdown
    const { data: eventsResponse } = useGetAllEvents();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Extract available events from eventsResponse
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

    // Filter events by search text in dropdown
    const filteredEventOptions = useMemo(() => {
        if (!eventSearch.trim()) return availableEvents;
        const q = eventSearch.toLowerCase().trim();
        return availableEvents.filter((evt) => evt.name.toLowerCase().includes(q));
    }, [availableEvents, eventSearch]);

    // Parse Stats & Averages
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

        return {
            averageRating: avg,
            percentageChange: pctChange,
            trend,
            currentQuarterReviews: currentQuarter,
            previousQuarterReviews: previousQuarter,
        };
    }, [statsResponse]);

    // Parse Rating Distribution (Stars 1 to 5)
    const ratingDistribution = useMemo(() => {
        const rawList =
            statsResponse?.ratingDistribution?.ratingDistribution ??
            statsResponse?.data?.ratingDistribution?.ratingDistribution ??
            statsResponse?.result?.ratingDistribution?.ratingDistribution ??
            [];

        return [1, 2, 3, 4, 5].map((star) => {
            const match = Array.isArray(rawList)
                ? rawList.find((item: any) => Number(item?.rating) === star)
                : undefined;
            const count = match?.count ?? 0;
            const percentage = match?.percentage ?? 0;
            return {
                star,
                count,
                percentage: Math.min(100, Math.max(0, percentage)),
            };
        });
    }, [statsResponse]);

    // Parse Reviews list & pagination
    const reviewsList: ReviewItemResponse[] = useMemo(() => {
        const raw =
            reviewsResponse?.data ??
            reviewsResponse?.result?.data ??
            (Array.isArray(reviewsResponse) ? reviewsResponse : []);
        return Array.isArray(raw) ? raw : [];
    }, [reviewsResponse]);

    const pagination = useMemo(() => {
        const pag =
            reviewsResponse?.pagination ??
            reviewsResponse?.result?.pagination;
        const total = pag?.total ?? reviewsList.length;
        const totalPages = pag?.totalPages ?? Math.max(1, Math.ceil(total / rowsPerPage));
        return {
            page: pag?.page ?? page,
            limit: pag?.limit ?? pag?.pageSize ?? rowsPerPage,
            total,
            totalPages,
        };
    }, [reviewsResponse, reviewsList.length, page, rowsPerPage]);

    // Accent color helper by rating
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

    const renderStars = (rating: number) => {
        const rounded = Math.round(rating);
        return (
            <div className="flex items-center gap-1 text-[#2E1065]">
                {Array.from({ length: 5 }, (_, i) => {
                    const isFilled = i < rounded;
                    return isFilled ? (
                        <FaStar key={i} size={14} />
                    ) : (
                        <FaRegStar key={i} size={14} className="text-gray-300" />
                    );
                })}
            </div>
        );
    };

    const handleCopyReview = (review: ReviewItemResponse) => {
        const text = `"${review.comment}" - ${review.user?.fullname || review.user?.username || "Attendee"}`;
        navigator.clipboard.writeText(text);
        setCopiedId(review._id ?? review.id ?? 1);
        setTimeout(() => setCopiedId(null), 2000);
        setActiveMenuId(null);
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setReplySent(true);
        setTimeout(() => {
            setReplySent(false);
            setReplyingReview(null);
            setReplyText("");
        }, 1500);
    };

    const handleViewAll = () => {
        setSelectedEvent({ id: undefined, name: "All Events" });
        setRatingFloor("All");
        setPage(1);
    };

    return (
        <section className="w-full flex flex-col gap-6">
            {/* Page Header */}
            <Header
                title="Reviews"
                body="Review Feedback From Past Attendees"
            />

            {/* Top Row: Filters & Metric Card */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left: Filters */}
                <div className="flex flex-wrap items-center gap-6">
                    {/* Event Selection Dropdown */}
                    <div ref={dropdownRef} className="flex flex-col gap-1.5 relative min-w-56">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Event Selection
                        </span>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <span className="font-semibold text-xs text-gray-800 truncate max-w-48">
                                {selectedEvent.name}
                            </span>
                            <IoChevronDown
                                size={14}
                                className={`text-gray-500 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-full mt-1.5 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                                {availableEvents.length > 5 && (
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                            <IoSearchOutline size={14} className="text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search events..."
                                                value={eventSearch}
                                                onChange={(e) => setEventSearch(e.target.value)}
                                                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredEventOptions.length === 0 ? (
                                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                                            No events found
                                        </div>
                                    ) : (
                                        filteredEventOptions.map((evt) => (
                                            <div
                                                key={evt.id ?? evt.name}
                                                onClick={() => {
                                                    setSelectedEvent(evt);
                                                    setIsDropdownOpen(false);
                                                    setPage(1);
                                                }}
                                                className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${selectedEvent.name === evt.name
                                                    ? "bg-[#37137F15] text-[#37137F] font-semibold"
                                                    : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <span className="truncate">{evt.name}</span>
                                                {selectedEvent.name === evt.name && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#37137F]"></span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rating Floor Filter Pills */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Rating Floor
                        </span>
                        <div className="flex items-center gap-1.5">
                            {(["4+", "3+", "All"] as const).map((floor) => {
                                const isActive = ratingFloor === floor;
                                return (
                                    <button
                                        key={floor}
                                        onClick={() => {
                                            setRatingFloor(floor);
                                            setPage(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${isActive
                                            ? "bg-[#2E1065] text-white shadow-xs"
                                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        {floor}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Satisfaction Index Card */}
                <div className="w-full md:w-72 bg-gradient-to-br from-[#37137F] to-[#200B4D] rounded-2xl p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden min-h-28">
                    {isStatsLoading ? (
                        <div className="animate-pulse flex flex-col justify-between h-full gap-4">
                            <div className="h-3 w-36 bg-white/20 rounded"></div>
                            <div className="h-8 w-24 bg-white/20 rounded"></div>
                            <div className="h-3 w-32 bg-white/20 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                    Average Satisfaction Index
                                </span>
                                <span className="text-4xl font-extrabold text-white tracking-tight mt-1">
                                    {statsData.averageRating > 0
                                        ? statsData.averageRating.toFixed(2)
                                        : "0.00"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-white/80 font-medium">
                                    {statsData.percentageChange > 0
                                        ? `+${statsData.percentageChange}%`
                                        : `${statsData.percentageChange}%`}{" "}
                                    vs Previous Quarter
                                </span>
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                    {statsData.trend === "decreased" || statsData.percentageChange < 0 ? (
                                        <FaArrowTrendDown size={14} className="text-rose-300" />
                                    ) : (
                                        <FaArrowTrendUp size={14} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Grid: Latest Reviews & Rating Star */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Latest Reviews */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-gray-900">
                                Latest Reviews
                            </h2>
                            {pagination.total > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                                    {pagination.total}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleViewAll}
                            className="text-xs font-semibold text-[#37137F] hover:underline cursor-pointer"
                        >
                            View All
                        </button>
                    </div>

                    <div className="flex flex-col gap-3.5">
                        {isReviewsLoading ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 border-l-4 border-l-gray-200 shadow-xs animate-pulse flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <div className="w-28 h-3.5 bg-gray-200 rounded"></div>
                                            <div className="w-20 h-2.5 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))
                        ) : reviewsList.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#37137F10] text-[#37137F] flex items-center justify-center">
                                    <FaRegStar size={22} />
                                </div>
                                <h3 className="font-bold text-sm text-gray-800">
                                    No Reviews Found
                                </h3>
                                <p className="text-xs text-gray-500 max-w-xs">
                                    No attendee reviews matching your current filters. Try selecting a different event or adjusting the rating floor.
                                </p>
                                {(selectedEvent.id || ratingFloor !== "All") && (
                                    <button
                                        onClick={handleViewAll}
                                        className="mt-2 text-xs font-semibold text-[#37137F] hover:underline cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            reviewsList.map((rev, index) => {
                                const revId = rev._id ?? rev.id ?? index;
                                const userName =
                                    rev.user?.fullname || rev.user?.username || "Attendee";
                                const userAvatar =
                                    rev.user?.photo ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        userName
                                    )}&background=37137F&color=fff&size=100`;
                                const eventName =
                                    typeof rev.event === "object"
                                        ? rev.event?.name || rev.event?.title || "Event"
                                        : rev.event ||
                                        (selectedEvent.id ? selectedEvent.name : "Event Attendee");
                                const ratingValue = typeof rev.rating === "number" ? rev.rating : 5;
                                const accentColor = getAccentColor(ratingValue);
                                const timeAgoStr = rev.createdAt
                                    ? moment(rev.createdAt).fromNow().toUpperCase()
                                    : "RECENT";

                                return (
                                    <div
                                        key={revId}
                                        style={{ borderLeftColor: accentColor }}
                                        className="bg-white rounded-2xl p-5 border border-gray-100 border-l-4 shadow-xs flex flex-col gap-3.5 hover:shadow-md transition-shadow relative"
                                    >
                                        {/* Review Header */}
                                        <div className="w-full flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={userAvatar}
                                                    alt={userName}
                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            userName
                                                        )}&background=37137F&color=fff&size=100`;
                                                    }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-gray-900">
                                                        {userName}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium truncate max-w-44">
                                                        {eventName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Star Rating */}
                                            {renderStars(ratingValue)}
                                        </div>

                                        {/* Review Body */}
                                        <p className="text-xs text-gray-600 leading-relaxed font-normal">
                                            “{rev.comment}”
                                        </p>

                                        {/* Review Footer */}
                                        <div className="w-full flex justify-between items-center pt-1">
                                            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                                                {timeAgoStr}
                                            </span>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <button
                                                    onClick={() => {
                                                        setReplyingReview(rev);
                                                        setReplyText("");
                                                    }}
                                                    title="Reply to review"
                                                    className="hover:text-gray-700 transition-colors cursor-pointer"
                                                >
                                                    <FiCornerUpLeft size={15} />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(
                                                                activeMenuId === revId ? null : revId
                                                            );
                                                        }}
                                                        title="More options"
                                                        className="hover:text-gray-700 transition-colors cursor-pointer"
                                                    >
                                                        <HiOutlineDotsHorizontal size={16} />
                                                    </button>

                                                    {activeMenuId === revId && (
                                                        <div
                                                            ref={menuRef}
                                                            className="absolute right-0 bottom-full mb-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1"
                                                        >
                                                            <button
                                                                onClick={() => handleCopyReview(rev)}
                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                            >
                                                                {copiedId === revId ? (
                                                                    <>
                                                                        <FiCheck size={13} className="text-emerald-600" />
                                                                        <span className="text-emerald-600 font-semibold">
                                                                            Copied!
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FiCopy size={13} />
                                                                        <span>Copy text</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 px-1 text-xs text-gray-500">
                            <span>
                                Page <strong className="text-gray-800">{pagination.page}</strong> of{" "}
                                <strong className="text-gray-800">{pagination.totalPages}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={pagination.page <= 1 || isReviewsLoading}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(pagination.totalPages, prev + 1)
                                        )
                                    }
                                    disabled={pagination.page >= pagination.totalPages || isReviewsLoading}
                                    className="px-3 py-1.5 rounded-lg bg-[#37137F] text-white text-xs font-semibold hover:bg-[#200B4D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Rating Star Distribution */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-base font-bold text-gray-900">
                            Rating Star
                        </h2>
                        {statsData.currentQuarterReviews > 0 && (
                            <span className="text-xs text-gray-400 font-medium">
                                {statsData.currentQuarterReviews} ratings this quarter
                            </span>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs flex flex-col items-center justify-center min-h-110">
                        {isStatsLoading ? (
                            <div className="w-full max-w-md flex justify-between items-end gap-4 sm:gap-6 h-72 pt-4 animate-pulse">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                                        <div className="w-full bg-gray-200 rounded-t-sm h-32"></div>
                                        <span className="mt-4 font-semibold text-gray-300 text-sm">
                                            {i}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full max-w-md flex justify-between items-end gap-4 sm:gap-6 h-72 pt-4">
                                {ratingDistribution.map((item) => (
                                    <div
                                        key={item.star}
                                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                                    >
                                        {/* Percentage Tooltip on Hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#200B4D] text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                                            {item.count} {item.count === 1 ? "review" : "reviews"} (
                                            {item.percentage.toFixed(0)}%)
                                        </div>

                                        {/* Vertical Bar with Track */}
                                        <div className="w-full bg-[#F1F3F5] rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
                                            <div
                                                style={{ height: `${item.percentage}%` }}
                                                className="w-full bg-[#2A358F] transition-all duration-500 hover:opacity-90 min-h-1 rounded-t-xs"
                                            />
                                        </div>

                                        {/* X-Axis Star Label */}
                                        <span className="mt-4 font-semibold text-gray-700 text-sm flex items-center gap-0.5">
                                            {item.star}
                                            <FaStar size={10} className="text-amber-400" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Reply Modal */}
            {replyingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">
                                Reply to Review
                            </h3>
                            <button
                                onClick={() => setReplyingReview(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        {/* Quoted original review */}
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-gray-800">
                                    {replyingReview.user?.fullname ||
                                        replyingReview.user?.username ||
                                        "Attendee"}
                                </span>
                                {renderStars(replyingReview.rating ?? 5)}
                            </div>
                            <p className="text-xs text-gray-600 italic">
                                “{replyingReview.comment}”
                            </p>
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                            <label className="text-xs font-semibold text-gray-700">
                                Your Response
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your response to this attendee..."
                                className="w-full text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all resize-none"
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReplyingReview(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={replySent}
                                    className="px-4 py-2 text-xs font-semibold bg-[#37137F] text-white hover:bg-[#200B4D] rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                                >
                                    {replySent ? (
                                        <>
                                            <FiCheck size={14} />
                                            <span>Response Saved</span>
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