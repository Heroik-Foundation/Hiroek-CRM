import { useState } from "react";
import { useAtom } from "jotai";
import { drawerAtom } from "../../utils/atom/drawer";
import { periodAtom } from "../../utils/atom/period";
import { Notification } from "iconsax-reactjs";
import { IoChevronDownCircle } from "react-icons/io5";
import { HiMenu } from "react-icons/hi";
import useMembership from "../../hooks/useMembership";

export default function Navbar() {
    const { displayName, roleTag, displayAvatar, isOwner, isAdmin } = useMembership();
    const [, setIsDrawerOpen] = useAtom(drawerAtom);
    const [selectedRange, setSelectedRange] = useAtom(periodAtom);
    const [isOpen, setIsOpen] = useState(false);

    const timeRanges = [
        "Last 7 Days",
        "Last 14 Days",
        "Last 30 Days",
        "Last 3 Months",
        "Last Year",
        "All Time",
    ];

    return (
        <nav className="w-full bg-white h-16 sm:h-20 md:h-24 px-4 sm:px-8 border-b border-[#00000015] flex items-center justify-between z-20">
            {/* Left: User Profile & Mobile Menu Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#37137F] p-0.5 flex items-center justify-center shrink-0">
                    <img
                        src={
                            displayAvatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        }
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>

                {/* Mobile Drawer Trigger (Hamburger) */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="lg:hidden p-1.5 text-[#37137F] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    aria-label="Open navigation drawer"
                >
                    <HiMenu size={24} />
                </button>

                {/* Mobile Role Tag */}
                {roleTag && (
                    <span
                        className={`md:hidden px-2 py-0.5 text-[9px] font-extrabold tracking-wider rounded-md uppercase border ${
                            isOwner
                                ? "bg-purple-100 text-[#37137F] border-purple-200"
                                : isAdmin
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                    >
                        {roleTag}
                    </span>
                )}

                <div className="hidden md:flex flex-col">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#37137F] leading-tight truncate max-w-[200px]">
                            {displayName}
                        </h3>
                        {roleTag && (
                            <span
                                className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider rounded-md uppercase border shadow-2xs ${
                                    isOwner
                                        ? "bg-purple-100 text-[#37137F] border-purple-200"
                                        : isAdmin
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                            >
                                {roleTag}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5 truncate max-w-[220px]">
                        Welcome {displayName}
                    </p>
                </div>
            </div>

            {/* Right: Filter & Notifications */}
            <div className="flex items-center gap-2.5 sm:gap-4">
                {/* Time Range Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-[#37137F] hover:bg-[#2c0e66] text-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold flex items-center gap-2 sm:gap-2.5 transition-colors shadow-xs cursor-pointer"
                    >
                        <span>{selectedRange}</span>
                        <IoChevronDownCircle
                            size={16}
                            className={`text-white transition-transform ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden">
                            {timeRanges.map((range) => (
                                <button
                                    key={range}
                                    onClick={() => {
                                        setSelectedRange(range);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${selectedRange === range
                                            ? "bg-[#37137F15] text-[#37137F] font-bold"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notification Bell Button */}
                <button
                    className="hidden sm:flex w-10 h-10 rounded-full border border-gray-200 bg-white items-center justify-center text-[#37137F] hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
                    title="Notifications"
                >
                    <Notification size={20} color="#37137F" variant="Outline" />
                </button>
            </div>
        </nav>
    );
}
