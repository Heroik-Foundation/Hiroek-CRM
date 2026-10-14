import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { LuLogOut, LuMail, LuArrowUpRight } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";
import { sidebarLink } from "../../utils/dataBank";
import { drawerAtom } from "../../utils/atom/drawer";
import { userAtom } from "../../utils/atom/user";
import useEmailBundles from "../../hooks/settings/useEmailBundles";
import { clearSession, redirectToLogin } from "../../config/httpService";

export default function Drawer() {
    const [isOpen, setIsOpen] = useAtom(drawerAtom);
    const user = useAtomValue(userAtom);
    const navigate = useNavigate();
    const location = useLocation();
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

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showLogoutModal) {
                    setShowLogoutModal(false);
                } else {
                    setIsOpen(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setIsOpen, showLogoutModal]);

    const handleNavigate = (link: string, search: string) => {
        navigate(link + search);
        setIsOpen(false);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        setIsOpen(false);
        clearSession();
        redirectToLogin();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 26, stiffness: 280 }}
                        className="relative z-10 w-[82vw] max-w-85 h-full bg-white flex flex-col justify-between overflow-y-auto p-5 shadow-2xl"
                    >
                        {/* Top: User Profile & Close Button */}
                        <div className="w-full flex flex-col">
                            <div className="w-full flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-13 h-13 rounded-full border-2 border-[#37137F] p-0.5 flex items-center justify-center shrink-0">
                                        <img
                                            src={
                                                user?.logo ||
                                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                            }
                                            alt={user?.name || "Dumo Charles"}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-base text-[#37137F] leading-tight">
                                            {user?.name || "Dumo Charles"}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">
                                            Creator Account
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                    aria-label="Close menu"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <div className="w-full py-4 flex flex-col gap-1.5">
                                {sidebarLink?.map((item) => {
                                    const isActive = item?.link === location.pathname;
                                    return (
                                        <button
                                            key={item?.name}
                                             onClick={() => handleNavigate(item?.link, item?.search)}
                                            className={`w-full px-4 h-12 flex gap-3.5 items-center rounded-2xl text-sm transition-all cursor-pointer ${
                                                isActive
                                                    ? "bg-[#37137F1F] text-[#37137F] font-bold shadow-xs"
                                                    : "text-[#37137F] hover:bg-gray-50 font-semibold"
                                            }`}
                                        >
                                            <div className="w-5 flex items-center justify-center shrink-0">
                                                <item.icon size={20} className="text-[#37137F]" />
                                            </div>
                                            <p className="tracking-tight">{item?.name}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom: Email Balance & Log Out */}
                        <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-3">
                            {/* Email Balance Card */}
                            <div className="w-full bg-linear-to-r from-[#261353] via-[#7B1B62] to-[#E11D48] rounded-2xl p-4 text-white shadow-md flex flex-col gap-3 relative overflow-hidden">
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

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate("/dashboard/settings?tab=credit");
                                    }}
                                    className="w-full py-2 px-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-white/10"
                                >
                                    <span>Top Up Credits</span>
                                    <LuArrowUpRight size={14} />
                                </button>
                            </div>

                            {/* Log Out Button */}
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#D02124] border border-[#D0212426] rounded-2xl px-4 py-3.5 flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-xl bg-[#D021241A] flex items-center justify-center text-[#D02124] shrink-0">
                                        <LuLogOut size={14} />
                                    </div>
                                    <span className="font-bold text-sm text-[#D02124]">
                                        Log Out
                                    </span>
                                </div>
                                <FiArrowRight size={16} className="text-[#D02124]" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

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
        </AnimatePresence>
    );
}
