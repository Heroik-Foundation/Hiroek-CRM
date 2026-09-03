import { useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";
import { Notification } from "iconsax-reactjs";
import { IoChevronDownCircle } from "react-icons/io5";

export default function Navbar() {
    const user = useAtomValue(userAtom);
    const [selectedRange, setSelectedRange] = useState("Last 7 Days");
    const [isOpen, setIsOpen] = useState(false);

    const timeRanges = [
        "Last 7 Days",
        "Last 30 Days",
        "Last 3 Months",
        "Last Year",
        "All Time",
    ];

    return (
        <nav className="w-full bg-white h-20 sm:h-24 px-6 sm:px-8 border-b border-[#00000015] flex items-center justify-between sticky top-0 z-20">
            {/* Left: User Profile */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border-2 border-[#37137F] p-0.5 flex items-center justify-center shrink-0">
                    <img
                        src={
                            user?.logo ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        }
                        alt={user?.name || "Joba Labs"}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-base text-[#37137F] leading-tight">
                        {user?.name || "Joba Labs"}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">
                        Creator Account
                    </p>
                </div>
            </div>

            {/* Right: Filter & Notifications */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Time Range Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-[#37137F] hover:bg-[#2c0e66] text-white rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors shadow-sm cursor-pointer"
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
                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#37137F] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                    title="Notifications"
                >
                    <Notification size={20} color="#37137F" variant="Outline" />
                </button>
            </div>
        </nav>
    );
}
