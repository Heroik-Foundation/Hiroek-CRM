import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";
import { sidebarLink } from "../../utils/dataBank";
import { drawerAtom } from "../../utils/atom/drawer";
import { userAtom } from "../../utils/atom/user";
import useEmailBundles from "../../hooks/settings/useEmailBundles";

export default function Drawer() {
    const [isOpen, setIsOpen] = useAtom(drawerAtom);
    const user = useAtomValue(userAtom);
    const navigate = useNavigate();
    const location = useLocation();

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
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setIsOpen]);

    const handleNavigate = (link: string, search: string) => {
        navigate(link + search);
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsOpen(false);
        navigate("/");
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

                        {/* Bottom: Log Out & Current Plan */}
                        <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-3">
                            {/* Current Plan Card */}
                            <div className="w-full bg-linear-to-r from-[#261353] via-[#7B1B62] to-[#E11D48] rounded-2xl p-4 text-white shadow-sm flex flex-col gap-2">
                                <div>
                                    <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                                        Current Plan
                                    </span>
                                    <h4 className="font-bold text-sm text-white mt-0.5">
                                        CreatorPro
                                    </h4>
                                    <p className="text-[10px] text-white/80">£99.98/Month</p>
                                </div>
                                <div className="pt-2 border-t border-white/10 text-[9px] text-white/70 flex flex-col gap-0.5">
                                    <span>
                                        {emailBalance !== null
                                            ? `${Number(emailBalance).toLocaleString()} of 20,000 emails used`
                                            : "10,000 of 20,000 emails used"}
                                    </span>
                                    <span>50 of 100 SMS used</span>
                                </div>
                            </div>

                            {/* Log Out Button */}
                            <button
                                onClick={handleLogout}
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
        </AnimatePresence>
    );
}
