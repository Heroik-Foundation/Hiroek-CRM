import { useState } from "react";
import { Header } from "../../components/common";
import { IoChevronDown } from "react-icons/io5";
import { FaArrowTrendUp, FaStar, FaRegStar } from "react-icons/fa6";
import { FiCornerUpLeft } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

interface ReviewItem {
    id: number;
    name: string;
    event: string;
    avatar: string;
    rating: number;
    comment: string;
    timeAgo: string;
    accentColor: string;
}

const ALL_REVIEWS: ReviewItem[] = [
    {
        id: 1,
        name: "Elena Moretti",
        event: "Design Week 2024",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        rating: 5,
        comment:
            "“The curation of speakers this year was unparalleled. Every session felt like a deep dive into the future of digital architecture. Exceptional logistics.”",
        timeAgo: "2 HOURS AGO",
        accentColor: "#10B981",
    },
    {
        id: 2,
        name: "Marcus Thorne",
        event: "Tech Symposium",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        rating: 4,
        comment:
            "“Impressive depth in the analytical workshops. I would have appreciated more time for the Q&A segments, but the content quality was top-tier.”",
        timeAgo: "3 HOURS AGO",
        accentColor: "#3B82F6",
    },
    {
        id: 3,
        name: "Sarah Jenkins",
        event: "The Precision Gala",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        rating: 5,
        comment:
            "“The atmospheric design of the gala was breathtaking. Precision Editorial really knows how to build an experience from the ground up.”",
        timeAgo: "YESTERDAY",
        accentColor: "#6366F1",
    },
    {
        id: 4,
        name: "David Kim",
        event: "Annual Tech Event",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        rating: 3,
        comment:
            "“Great keynote sessions and networking. Sound engineering in Hall B could be improved for panel discussions.”",
        timeAgo: "2 DAYS AGO",
        accentColor: "#F59E0B",
    },
];

const RATING_DISTRIBUTION = [
    { star: 1, percentage: 45 },
    { star: 2, percentage: 60 },
    { star: 3, percentage: 35 },
    { star: 4, percentage: 55 },
    { star: 5, percentage: 80 },
];

const EVENTS_LIST = [
    "Annual Tech Event",
    "Design Week 2024",
    "Tech Symposium",
    "The Precision Gala",
    "All Events",
];

export default function Review() {
    const [selectedEvent, setSelectedEvent] = useState("Annual Tech Event");
    const [ratingFloor, setRatingFloor] = useState<"4+" | "3+" | "All">("4+");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter reviews based on rating floor
    const filteredReviews = ALL_REVIEWS.filter((rev) => {
        if (ratingFloor === "4+") return rev.rating >= 4;
        if (ratingFloor === "3+") return rev.rating >= 3;
        return true;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1 text-[#2E1065]">
                {Array.from({ length: 5 }, (_, i) => {
                    const isFilled = i < rating;
                    return isFilled ? (
                        <FaStar key={i} size={14} />
                    ) : (
                        <FaRegStar key={i} size={14} />
                    );
                })}
            </div>
        );
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
                    <div className="flex flex-col gap-1.5 relative">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Event Selection
                        </span>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm cursor-pointer hover:border-gray-300 transition-colors min-w-48"
                        >
                            <span className="font-semibold text-xs text-gray-800">
                                {selectedEvent}
                            </span>
                            <IoChevronDown
                                size={14}
                                className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-full mt-1.5 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
                                {EVENTS_LIST.map((evt) => (
                                    <div
                                        key={evt}
                                        onClick={() => {
                                            setSelectedEvent(evt);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${selectedEvent === evt
                                                ? "bg-[#37137F15] text-[#37137F] font-semibold"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {evt}
                                    </div>
                                ))}
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
                                        onClick={() => setRatingFloor(floor)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                                ? "bg-[#2E1065] text-white shadow-sm"
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
                <div className="w-full md:w-72 bg-linear-to-br from-[#37137F] to-[#200B4D] rounded-2xl p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden min-h-28">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                            Average Satisfaction Index
                        </span>
                        <span className="text-4xl font-extrabold text-white tracking-tight mt-1">
                            5.82
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-white/80 font-medium">
                            +12% vs Previous Quarter
                        </span>
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                            <FaArrowTrendUp size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Latest Reviews & Rating Star */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Latest Reviews */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-base font-bold text-gray-900">
                            Latest Reviews
                        </h2>
                        <button className="text-xs font-semibold text-[#37137F] hover:underline">
                            View All
                        </button>
                    </div>

                    <div className="flex flex-col gap-3.5">
                        {filteredReviews.map((rev) => (
                            <div
                                key={rev.id}
                                style={{ borderLeftColor: rev.accentColor }}
                                className="bg-white rounded-2xl p-5 border border-gray-100 border-l-4 shadow-sm flex flex-col gap-3.5 hover:shadow-md transition-shadow"
                            >
                                {/* Review Header */}
                                <div className="w-full flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={rev.avatar}
                                            alt={rev.name}
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900">
                                                {rev.name}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {rev.event}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Star Rating */}
                                    {renderStars(rev.rating)}
                                </div>

                                {/* Review Body */}
                                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                                    {rev.comment}
                                </p>

                                {/* Review Footer */}
                                <div className="w-full flex justify-between items-center pt-1">
                                    <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                                        {rev.timeAgo}
                                    </span>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <button className="hover:text-gray-700 transition-colors">
                                            <FiCornerUpLeft size={15} />
                                        </button>
                                        <button className="hover:text-gray-700 transition-colors">
                                            <HiOutlineDotsHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Rating Star Distribution */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    <h2 className="text-base font-bold text-gray-900">
                        Rating Star
                    </h2>

                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-110">
                        <div className="w-full max-w-md flex justify-between items-end gap-4 sm:gap-6 h-72 pt-4">
                            {RATING_DISTRIBUTION.map((item) => (
                                <div
                                    key={item.star}
                                    className="flex-1 flex flex-col items-center h-full justify-end"
                                >
                                    {/* Vertical Bar with Track */}
                                    <div className="w-full bg-[#F1F3F5] rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
                                        <div
                                            style={{ height: `${item.percentage}%` }}
                                            className="w-full bg-[#2A358F] transition-all duration-500 hover:opacity-90"
                                        />
                                    </div>

                                    {/* X-Axis Star Label */}
                                    <span className="mt-4 font-semibold text-gray-700 text-sm">
                                        {item.star}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}