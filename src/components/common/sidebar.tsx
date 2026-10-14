import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { sidebarLink } from "../../utils/dataBank";
import { LuLogOut, LuMail, LuArrowUpRight } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import useEmailBundles from "../../hooks/settings/useEmailBundles";
import { clearSession, redirectToLogin } from "../../config/httpService";

export default function Sidebar() {
    const navigate = useNavigate();
    const pathname = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // ✉️ Dynamic Email Balance
    const { useGetEmailBalance } = useEmailBundles();
    const { data: balanceApiData } = useGetEmailBalance();

    const emailBalance = useMemo(() => {
        if (typeof balanceApiData?.balance === "number") return balanceApiData.balance;
        if (typeof balanceApiData?.data?.balance === "number") return balanceApiData.data.balance;
        if (typeof balanceApiData?.result?.balance === "number") return balanceApiData.result.balance;
        return null;
    }, [balanceApiData]);

    // Close on Escape key
    useEffect(() => {
        if (!showLogoutModal) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowLogoutModal(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showLogoutModal]);

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        clearSession();
        redirectToLogin();
    };

    return (
        <div className="w-full h-screen flex flex-col justify-between overflow-y-auto bg-white border-r border-[#00000015]">
            {/* Top Logo & Links */}
            <div className="w-full flex flex-col">
                <div className="w-full h-24 border-b px-6 flex flex-col justify-center border-b-[#00000015]">
                    <p className="text-xl font-bold text-gray-900 tracking-tight">
                        Hiroek
                    </p>
                    <p className="text-sm text-gray-400 font-medium">
                        Creator Platform
                    </p>
                </div>

                <div className="w-full py-4 px-3 flex flex-col gap-1">
                    {sidebarLink?.map((item) => {
                        const isActive =
                            item?.link === pathname.pathname ||
                            (item?.link !== "/dashboard" &&
                                pathname.pathname.startsWith(item?.link + "/"));
                        return (
                            <button
                                key={item?.name}
                                onClick={() => navigate(item?.link + item?.search)}
                                className={`w-full px-3.5 h-11 flex gap-3 items-center rounded-xl text-sm transition-colors cursor-pointer ${isActive
                                    ? "bg-[#37137F26] text-[#37137F] font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                    }`}
                            >
                                <div className="w-5 flex items-center justify-center">
                                    <item.icon size={18} />
                                </div>
                                <p>{item?.name}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions: Log Out & Email Balance */}
            <div className="w-full p-4 flex flex-col gap-3">
                {/* Log Out Button */}
                <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full bg-[#D021240D] hover:bg-[#D0212415] text-[#D02124] border border-[#D0212426] rounded-2xl px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#D021241A] flex items-center justify-center text-[#D02124]">
                            <LuLogOut size={13} />
                        </div>
                        <span className="font-bold text-sm text-[#D02124]">
                            Log Out
                        </span>
                    </div>
                    <FiArrowRight size={14} className="text-[#D02124]" />
                </button>

                {/* Email Balance Card */}
                <div className="w-full bg-linear-to-r from-[#261353] via-[#7B1B62] to-[#E11D48] rounded-2xl p-4 text-white shadow-md flex flex-col gap-3 relative overflow-hidden">
                    {/* Header with Icon and Label */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                                <LuMail size={14} />
                            </div>
                            <span className="text-xs font-bold text-white tracking-wide">
                                Email Balance
                            </span>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                        </span>
                    </div>

                    {/* Large Balance Display */}
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white tracking-tight">
                                {emailBalance !== null ? Number(emailBalance).toLocaleString() : "0"}
                            </span>
                            <span className="text-[11px] text-white/80 font-medium">
                                credits available
                            </span>
                        </div>
                        <p className="text-[10px] text-white/70 mt-0.5">
                            Send mass campaigns to attendees
                        </p>
                    </div>

                    {/* Action button to buy / top up */}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/settings?tab=credit")}
                        className="w-full py-2 px-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-white/10"
                    >
                        <span>Top Up Credits</span>
                        <LuArrowUpRight size={14} />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {showLogoutModal && (
                            <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowLogoutModal(false)}
                                    className="fixed inset-0 bg-black/45 backdrop-blur-xs"
                                />

                                {/* Modal Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-4"
                                >
                                    {/* Icon Badge */}
                                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#D02124] flex items-center justify-center border border-red-100">
                                        <LuLogOut size={26} />
                                    </div>

                                    {/* Text Details */}
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Log Out
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Are you sure you want to log out of your Hiroek account?
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="w-full flex items-center gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowLogoutModal(false)}
                                            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmLogout}
                                            className="flex-1 py-2.5 px-4 rounded-xl bg-[#D02124] hover:bg-[#b01c1e] text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}
