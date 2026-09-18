import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../../components/common";
import { settingLink } from "../../utils/dataBank";
import {
    Account,
    CurrentPlan,
    Security,
    SelectPlan,
    AddUsersRole,
    GetUsersRole,
    HelpAndSupport,
    TermsAndPolicies,
    Messaging,
    SmsEmailCredits,
} from "../../components/settings";
import { IoChevronDown } from "react-icons/io5";

export default function Settings() {
    const pathname = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentSearch = pathname?.search || "?tab=profile";
    const activeItem =
        settingLink.find((item) => item?.link?.includes(currentSearch)) ??
        settingLink[0];

    return (
        <>
            {pathname?.search !== "?tab=plan" && (
                <section className="w-full flex flex-col gap-6">
                    <Header
                        title="Settings"
                        body="Manage Your Account, Security, And Preferences"
                    />

                    {/* Mobile Settings Tab Selector Dropdown */}
                    <div className="relative w-full lg:hidden">
                        <button
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="w-full bg-[#EBE6F8] hover:bg-[#e2daf6] transition-colors rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-[#37137F] cursor-pointer shadow-xs"
                        >
                            <div className="flex items-center gap-3">
                                <activeItem.icon size={18} className="text-[#37137F] shrink-0" />
                                <span className="font-bold text-xs sm:text-sm text-[#37137F]">
                                    {activeItem.name}
                                </span>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-[#37137F] text-white flex items-center justify-center shrink-0">
                                <IoChevronDown
                                    size={11}
                                    className={`transition-transform duration-200 ${
                                        isDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-30 flex flex-col gap-1">
                                    {settingLink.map((item) => {
                                        const isActive = item.link.includes(currentSearch);
                                        return (
                                            <button
                                                key={item.name}
                                                onClick={() => {
                                                    navigate(item.link);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex items-center gap-3 ${
                                                    isActive
                                                        ? "bg-[#F3F0FA] text-[#37137F]"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="w-5 flex justify-center shrink-0">
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="truncate">{item.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
                        {/* Desktop Sidebar Navigation */}
                        <div className="hidden lg:block w-75 shrink-0">
                            <div className="w-full p-3 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
                                {settingLink.map((item) => {
                                    const isActive = item.link.includes(currentSearch);
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => navigate(item?.link)}
                                            className={`w-full px-4 h-12 flex gap-3 items-center rounded-xl transition-colors cursor-pointer ${
                                                isActive
                                                    ? "bg-[#37137F1A] text-[#37137F] font-semibold"
                                                    : "hover:bg-gray-50 text-gray-700 font-medium"
                                            }`}
                                        >
                                            <div className="w-5 flex justify-center shrink-0">
                                                <item.icon size={20} />
                                            </div>
                                            <p className="text-sm truncate">{item?.name}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content Panel */}
                        <div className="w-full flex-1 min-w-0">
                            {(!pathname?.search || pathname?.search === "?tab=profile") && (
                                <Account />
                            )}
                            {pathname?.search === "?tab=security" && <Security />}
                            {pathname?.search === "?tab=subscriptions" && <CurrentPlan />}
                            {pathname?.search === "?tab=credit" && <SmsEmailCredits />}
                            {pathname?.search === "?tab=permissions" && <GetUsersRole />}
                            {pathname?.search === "?tab=permissions&action=add" && (
                                <AddUsersRole />
                            )}
                            {pathname?.search === "?tab=legal" && (
                                <div className="w-full flex flex-col gap-4">
                                    <HelpAndSupport />
                                    <TermsAndPolicies />
                                </div>
                            )}
                            {pathname?.search === "?tab=notifications" && <Messaging />}
                        </div>
                    </div>
                </section>
            )}
            {pathname?.search === "?tab=plan" && <SelectPlan />}
        </>
    );
}
