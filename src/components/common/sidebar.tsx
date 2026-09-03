import { useLocation, useNavigate } from "react-router-dom";
import { sidebarLink } from "../../utils/dataBank";
import { LuLogOut } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";

export default function Sidebar() {
    const navigate = useNavigate();
    const pathname = useLocation();

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
                        const isActive = item?.link === pathname.pathname;
                        return (
                            <button
                                key={item?.name}
                                onClick={() => navigate(item?.link + item?.search)}
                                className={`w-full px-3.5 h-11 flex gap-3 items-center rounded-xl text-sm transition-colors ${isActive
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

            {/* Bottom Actions: Log Out & Current Plan */}
            <div className="w-full p-4 flex flex-col gap-3">
                {/* Log Out Button */}
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate("/");
                    }}
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

                {/* Current Plan Card */}
                <div className="w-full bg-linear-to-r from-[#261353] via-[#7B1B62] to-[#E11D48] rounded-2xl p-4 text-white shadow-sm flex flex-col gap-2">
                    <div>
                        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                            Current Plan
                        </span>
                        <h4 className="font-bold text-sm text-white mt-0.5">
                            CreatorPro
                        </h4>
                        <p className="text-[10px] text-white/80">£99.99/Month</p>
                    </div>
                    <div className="pt-2 border-t border-white/10 text-[9px] text-white/70 flex flex-col gap-0.5">
                        <span>10,000 of 20,000 emails used</span>
                        <span>50 of 100 SMS used</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
