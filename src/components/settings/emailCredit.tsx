import { useState, useRef, useEffect, useMemo } from "react";
import { BiChevronDown, BiSearch, BiX, BiChevronLeft } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { Spinner, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import useEmailBundles, {
    type IEmailBundle,
} from "../../hooks/settings/useEmailBundles";
import StripePaymentForm from "../common/stripePaymentForm";
import { formatNumber } from "../../config/numberFormat";
import { URLS } from "../../utils/urls";

interface Country {
    name: string;
    code: string;
    flagSvg: React.ReactNode;
}

interface SmsOption {
    count: number;
    rate: number;
    price: number;
}

interface SenderIdOption {
    id: string;
    label: string;
    price: number;
}

interface ProcessedEmailBundle {
    id: string;
    credits: number;
    amount: number;
    rate: number;
    label: string;
}

// 🌍 Vector SVG Flags for crisp cross-platform rendering
const FlagUS = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="60" height="36" fill="#b22234" />
        <path d="M0,2.77h60M0,8.31h60M0,13.85h60M0,19.38h60M0,24.92h60M0,30.46h60" stroke="#fff" strokeWidth="2.77" />
        <rect width="24" height="19.4" fill="#3c3b6e" />
        <g fill="#fff">
            <circle cx="3" cy="2.5" r="0.7" /><circle cx="9" cy="2.5" r="0.7" /><circle cx="15" cy="2.5" r="0.7" /><circle cx="21" cy="2.5" r="0.7" />
            <circle cx="6" cy="5" r="0.7" /><circle cx="12" cy="5" r="0.7" /><circle cx="18" cy="5" r="0.7" />
            <circle cx="3" cy="7.5" r="0.7" /><circle cx="9" cy="7.5" r="0.7" /><circle cx="15" cy="7.5" r="0.7" /><circle cx="21" cy="7.5" r="0.7" />
            <circle cx="6" cy="10" r="0.7" /><circle cx="12" cy="10" r="0.7" /><circle cx="18" cy="10" r="0.7" />
            <circle cx="3" cy="12.5" r="0.7" /><circle cx="9" cy="12.5" r="0.7" /><circle cx="15" cy="12.5" r="0.7" /><circle cx="21" cy="12.5" r="0.7" />
            <circle cx="6" cy="15" r="0.7" /><circle cx="12" cy="15" r="0.7" /><circle cx="18" cy="15" r="0.7" />
            <circle cx="3" cy="17.5" r="0.7" /><circle cx="9" cy="17.5" r="0.7" /><circle cx="15" cy="17.5" r="0.7" /><circle cx="21" cy="17.5" r="0.7" />
        </g>
    </svg>
);

const FlagUK = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <clipPath id="uk-clip">
            <rect width="60" height="36" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
            <rect width="60" height="36" fill="#012169" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,36 M60,0 L0,36" stroke="#c8102e" strokeWidth="4" />
            <path d="M30,0 v36 M0,18 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v36 M0,18 h60" stroke="#c8102e" strokeWidth="6" />
        </g>
    </svg>
);

const FlagCA = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="15" height="36" fill="#d80027" />
        <rect x="15" width="30" height="36" fill="#fff" />
        <rect x="45" width="15" height="36" fill="#d80027" />
        <path d="M30 9l2 6h5l-4 4 1 6-4-4-4 4 1-6-4-4h5z" fill="#d80027" />
    </svg>
);

const FlagAU = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="60" height="36" fill="#00008b" />
        <rect width="30" height="18" fill="#012169" />
        <path d="M0,0 L30,18 M30,0 L0,18" stroke="#fff" strokeWidth="3" />
        <path d="M15,0 v18 M0,9 h30" stroke="#c8102e" strokeWidth="2.5" />
        <circle cx="45" cy="20" r="2.5" fill="#fff" />
        <circle cx="52" cy="12" r="1.5" fill="#fff" />
        <circle cx="50" cy="27" r="1.5" fill="#fff" />
        <circle cx="38" cy="26" r="1.5" fill="#fff" />
        <circle cx="15" cy="27" r="3" fill="#fff" />
    </svg>
);

const FlagBE = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="20" height="36" fill="#000" />
        <rect x="20" width="20" height="36" fill="#ffd90c" />
        <rect x="40" width="20" height="36" fill="#ed2939" />
    </svg>
);

const FlagNG = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="20" height="36" fill="#008751" />
        <rect x="20" width="20" height="36" fill="#fff" />
        <rect x="40" width="20" height="36" fill="#008751" />
    </svg>
);

const FlagGH = () => (
    <svg className="w-8 h-5.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 36">
        <rect width="60" height="12" fill="#ce1126" />
        <rect y="12" width="60" height="12" fill="#fcd116" />
        <rect y="24" width="60" height="12" fill="#006b3f" />
        <polygon points="30,14 32,19.5 37,19.5 33,22.5 34.5,27.5 30,24.5 25.5,27.5 27,22.5 23,19.5 28,19.5" fill="#000" />
    </svg>
);

const COUNTRIES: Country[] = [
    { name: "United States", code: "US", flagSvg: <FlagUS /> },
    { name: "United Kingdom", code: "GB", flagSvg: <FlagUK /> },
    { name: "Canada", code: "CA", flagSvg: <FlagCA /> },
    { name: "Australia", code: "AU", flagSvg: <FlagAU /> },
    { name: "Belgium", code: "BE", flagSvg: <FlagBE /> },
    { name: "Nigeria", code: "NG", flagSvg: <FlagNG /> },
    { name: "Ghana", code: "GH", flagSvg: <FlagGH /> },
];

const SMS_OPTIONS: SmsOption[] = [
    { count: 500, rate: 0.04, price: 20 },
    { count: 1000, rate: 0.04, price: 40 },
    { count: 2000, rate: 0.035, price: 70 },
    { count: 5000, rate: 0.034, price: 170 },
    { count: 10000, rate: 0.033, price: 330 },
    { count: 20000, rate: 0.032, price: 640 },
];

const SENDER_ID_OPTIONS: SenderIdOption[] = [
    {
        id: "alphanumeric",
        label: "Alphanumeric Sender ID (your company)",
        price: 10,
    },
    {
        id: "dedicated",
        label: "Dedicated Local Virtual Number",
        price: 15,
    },
    {
        id: "shared",
        label: "Standard Shared Pool (System ID)",
        price: 0,
    },
];

const formatEmailRate = (rate: number): string => {
    if (rate <= 0) return "0.00";
    if (rate < 0.01) {
        const fixed4 = rate.toFixed(4);
        const trimmed = parseFloat(fixed4).toString();
        return trimmed.includes(".") && trimmed.split(".")[1].length < 3
            ? rate.toFixed(3)
            : trimmed;
    }
    return rate.toFixed(2);
};

export default function SmsEmailCredits() {
    const queryClient = useQueryClient();

    // 🌐 Consume API Endpoints
    const {
        useGetEmailBundles,
        usePurchaseEmailBundle,
    } = useEmailBundles();

    const { data: bundlesApiData, isLoading: isLoadingBundles } = useGetEmailBundles({
        bundlesType: "active",
    });

    const purchaseBundleMutation = usePurchaseEmailBundle();

    // Process only data from the API endpoint (divide amount by 100 before displaying)
    const emailBundles: ProcessedEmailBundle[] = useMemo(() => {
        const rawList: IEmailBundle[] =
            bundlesApiData?.results ||
            (Array.isArray(bundlesApiData?.data)
                ? bundlesApiData.data
                : (bundlesApiData?.data as any)?.results) ||
            [];

        return rawList.map((item) => {
            const credits = item.credits || 0;
            const amount = (item.amount || 0) / 100;
            const rate = credits > 0 ? amount / credits : 0;
            const formattedRate = formatEmailRate(rate);
            return {
                id: item.id || item._id || "",
                credits,
                amount,
                rate,
                label: `${credits.toLocaleString()} Emails (£${formattedRate} per mail)`,
            };
        });
    }, [bundlesApiData]);

    // Selections (strictly initialized from endpoint)
    const [selectedEmail, setSelectedEmail] = useState<ProcessedEmailBundle | null>(null);
    const addSmsCredit = false // SMS hidden for now
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[1]); // Default UK
    const [selectedSms, setSelectedSms] = useState<SmsOption>(SMS_OPTIONS[0]); // 500 SMS
    const [selectedSenderId, setSelectedSenderId] = useState<SenderIdOption>(SENDER_ID_OPTIONS[0]);

    // Update selectedEmail dynamically as soon as the endpoint returns bundles
    useEffect(() => {
        if (emailBundles.length > 0) {
            setSelectedEmail((prev) => {
                if (prev && emailBundles.some((b) => b.id === prev.id)) {
                    return prev;
                }
                return emailBundles[0];
            });
        } else {
            setSelectedEmail(null);
        }
    }, [emailBundles]);

    // Active dropdown state: 'email' | 'country' | 'sms' | 'sender' | null
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [countrySearch, setCountrySearch] = useState("");

    // Stripe Checkout Modal
    const [stripeModal, setStripeModal] = useState<{
        isOpen: boolean;
        clientSecret: string;
        amount: number;
        bundleId: string;
        bundleName: string;
    } | null>(null);

    // Auto Recharge Modal
    const [showAutoRecharge, setShowAutoRecharge] = useState(false);
    const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
    const [autoRechargeThreshold, setAutoRechargeThreshold] = useState("10");

    // Click outside handler
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtered countries for search
    const filteredCountries = COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()),
    );

    // Calculations
    const processingFee = 2.0;
    const emailCost = selectedEmail?.amount || 0;
    const smsCost = addSmsCredit ? selectedSms.price : 0;
    const senderIdCost = addSmsCredit ? selectedSenderId.price : 0;
    const totalCredits = emailCost + smsCost + senderIdCost + processingFee;

    /** 🛒 Handle Buy Now Click: Calls POST /api/email-bundles/purchase-bundle/{bundleId} */
    const handleBuyNow = async () => {
        if (!selectedEmail?.id) {
            toast.danger("Please select a valid email bundle");
            return;
        }

        try {
            const res = await purchaseBundleMutation.mutateAsync(selectedEmail.id);
            const clientSecret =
                res?.paymentIntentSecret ||
                res?.clientSecret ||
                res?.data?.paymentIntentSecret ||
                res?.data?.clientSecret;

            if (clientSecret) {
                setStripeModal({
                    isOpen: true,
                    clientSecret,
                    amount: totalCredits,
                    bundleId: selectedEmail.id,
                    bundleName: selectedEmail.label,
                });
            } else {
                toast.success("Bundle purchase initialized successfully");
            }
        } catch (err: any) {
            console.error("Purchase error:", err);
            // toast error handled by mutation onError
        }
    };

    const navigate = useNavigate();

    /** 📊 Cost Breakdown Render Helper */
    const renderCostBreakdown = (isMobileInsideCard = false) => (
        <div className={`flex flex-col justify-between ${isMobileInsideCard ? "gap-6" : "min-h-[460px]"}`}>
            <div>
                <h2 className="text-xl font-bold text-[#37137F] mb-6">
                    Cost breakdown
                </h2>

                <div className="flex flex-col gap-4">
                    {/* Email Cost */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-900">Email:</span>
                        <span className="font-bold text-gray-900">
                            {selectedEmail ? formatNumber(emailCost, "£") : "£0.00"}
                        </span>
                    </div>

                    {/* SMS Cost (if enabled) */}
                    {addSmsCredit && (
                        <div className="flex justify-between items-start text-sm">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900">
                                    {selectedSms.count} SMS
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    £{selectedSms.rate} per SMS
                                </span>
                            </div>
                            <span className="font-bold text-gray-900">
                                {formatNumber(smsCost, "£")}
                            </span>
                        </div>
                    )}

                    {/* Alphanumeric Sender ID */}
                    {addSmsCredit && (
                        <div className="flex justify-between items-start text-sm">
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-gray-900">
                                    Alphanumeric
                                </span>
                                <span className="font-bold text-gray-900">
                                    Sender ID
                                </span>
                            </div>
                            <span className="font-bold text-gray-900">
                                {senderIdCost > 0 ? formatNumber(senderIdCost, "£") : "Free"}
                            </span>
                        </div>
                    )}

                    {/* Processing Fee */}
                    <div className="flex justify-between items-center text-sm pt-2">
                        <span className="font-bold text-emerald-600">
                            Processing fee:
                        </span>
                        <span className="font-bold text-emerald-600">
                            {formatNumber(processingFee, "£")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom: Estimated credits + Buy Now + Auto Recharge */}
            <div className={`flex flex-col gap-4 pt-6 ${isMobileInsideCard ? "" : "border-t border-gray-100 mt-6"}`}>
                <div>
                    <p className="text-xs font-medium text-gray-700">
                        Estimated credits required:
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-0.5">
                        {formatNumber(totalCredits, "£")}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                        for all selected pay-as-you-go services
                    </p>
                </div>

                {/* Buy Now Button */}
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={purchaseBundleMutation.isPending || isLoadingBundles || !selectedEmail}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#37137F] hover:bg-[#2c0f66] text-white font-bold text-sm sm:text-base transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                    {purchaseBundleMutation.isPending ? (
                        <>
                            <Spinner size="sm" color="current" />
                            <span>Initializing Purchase...</span>
                        </>
                    ) : (
                        "Buy now"
                    )}
                </button>

                {/* Auto Recharge Button */}
                <button
                    type="button"
                    onClick={() => setShowAutoRecharge(true)}
                    className="text-xs font-bold text-gray-900 hover:text-[#37137F] transition text-center cursor-pointer"
                >
                    Auto Recharge
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center py-4 sm:py-6 px-3 sm:px-6">
            {/* Optional Back to Settings */}
            <div className="w-full max-w-4xl hidden lg:flex items-center justify-start mb-3">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/settings?tab=profile")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#37137F] transition cursor-pointer"
                >
                    <BiChevronLeft size={18} />
                    <span>Back to Settings</span>
                </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#37137F] tracking-tight">
                    Purchase Email Credit
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                    Select Your Email Volume
                </p>
            </div>

            {/* Main Content Area: 2 Columns on Desktop, Unified / Stacked on Mobile */}
            <div
                ref={dropdownRef}
                className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
                {/* 👈 LEFT COLUMN: Configuration Cards */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Card 1: Email Volume & Add SMS Toggle */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-100 flex flex-col gap-4 relative">
                        {/* Email Volume Dropdown Trigger */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveDropdown(activeDropdown === "email" ? null : "email")
                                }
                                disabled={isLoadingBundles || emailBundles.length === 0}
                                className="w-full border border-gray-900 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between bg-white hover:border-[#37137F] transition text-left cursor-pointer shadow-xs disabled:opacity-60"
                            >
                                <span className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                    {isLoadingBundles
                                        ? "Loading email bundles..."
                                        : selectedEmail?.label || "No email bundles available"}
                                </span>
                                <BiChevronDown
                                    size={24}
                                    className={`text-gray-900 transition-transform duration-200 shrink-0 ${activeDropdown === "email" ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {/* Email Volume Popover */}
                            {activeDropdown === "email" && (
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                                    {emailBundles.length > 0 ? (
                                        emailBundles.map((opt) => {
                                            const isSelected = selectedEmail?.id === opt.id;
                                            const formattedRate = formatEmailRate(opt.rate);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmail(opt);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`w-full flex items-center px-6 py-3.5 transition text-left cursor-pointer ${isSelected
                                                        ? "bg-[#ECECEC]"
                                                        : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <span className="text-base font-bold text-gray-900">
                                                        {opt.credits.toLocaleString()} Emails{" "}
                                                    </span>
                                                    <span className="text-base font-medium text-[#8E8E93] ml-1">
                                                        (£{formattedRate} per mail)
                                                    </span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-500">
                                            No active email bundles returned from endpoint
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Helper Subtext */}
                        <p className="text-xs text-gray-700 text-center font-medium">
                            Email Feature Included AI Writing Assistance
                        </p>
                    </div>

                    {/* Card 2: SMS Options (Destination, Volume, Sender ID) */}
                    {addSmsCredit && (
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-100 flex flex-col gap-5 animate-in fade-in duration-200">
                            {/* Mobile Section Header (Image 2) */}
                            <h2 className="text-base sm:text-lg font-bold text-[#37137F] lg:hidden">
                                Send SMS
                            </h2>

                            {/* 1. Destination Country */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-xs font-bold text-gray-900">
                                    Select your destination country
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveDropdown(
                                            activeDropdown === "country" ? null : "country",
                                        );
                                        setCountrySearch("");
                                    }}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white hover:border-gray-300 transition text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        {selectedCountry.flagSvg}
                                        <span className="text-sm font-semibold text-gray-900">
                                            {selectedCountry.name}
                                        </span>
                                    </div>
                                    <BiChevronDown
                                        size={22}
                                        className={`text-gray-800 transition-transform ${activeDropdown === "country" ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* 📌 Destination Country Popover (Matching Image 2) */}
                                {activeDropdown === "country" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {/* Search Box with icon on right */}
                                        <div className="relative px-6 pt-4 pb-3 flex items-center">
                                            <input
                                                type="text"
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                placeholder="Search"
                                                className="w-full text-base font-medium text-gray-900 placeholder-[#8E8E93] focus:outline-hidden pr-8"
                                                autoFocus
                                            />
                                            <BiSearch
                                                size={22}
                                                className="text-[#8E8E93] absolute right-6 pointer-events-none"
                                            />
                                        </div>

                                        {/* Country List */}
                                        <div className="flex flex-col max-h-64 overflow-y-auto">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((c) => {
                                                    const isSelected =
                                                        selectedCountry.code === c.code;
                                                    return (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCountry(c);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`w-full flex items-center gap-4 px-6 py-3.5 transition text-left cursor-pointer ${isSelected
                                                                ? "bg-[#ECECEC]"
                                                                : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {c.flagSvg}
                                                            <span className="text-base font-semibold text-gray-900">
                                                                {c.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-gray-500 text-center py-4">
                                                    No countries found
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. SMS Volume */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-xs font-bold text-gray-900">
                                    Select your SMS volume
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === "sms" ? null : "sms",
                                        )
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white hover:border-gray-300 transition text-left cursor-pointer"
                                >
                                    <span className="text-sm font-semibold text-gray-900">
                                        {selectedSms.count} SMS (£{selectedSms.rate} per SMS)
                                    </span>
                                    <BiChevronDown
                                        size={22}
                                        className={`text-gray-800 transition-transform ${activeDropdown === "sms" ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* 📌 SMS Volume Popover (Matching Image 1) */}
                                {activeDropdown === "sms" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex flex-col max-h-72 overflow-y-auto">
                                            {SMS_OPTIONS.map((opt) => {
                                                const isSelected =
                                                    selectedSms.count === opt.count;
                                                return (
                                                    <button
                                                        key={opt.count}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSms(opt);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className={`w-full flex items-center px-6 py-3.5 transition text-left cursor-pointer ${isSelected
                                                            ? "bg-[#ECECEC]"
                                                            : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <span className="text-base font-bold text-gray-900">
                                                            {opt.count} SMS{" "}
                                                        </span>
                                                        <span className="text-base font-medium text-[#8E8E93] ml-1">
                                                            (£{opt.rate} per SMS)
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Get SMS Number / Sender ID */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-xs font-bold text-gray-900">
                                    <span className="hidden lg:inline">Get SMS number</span>
                                    <span className="lg:hidden">Send SMS from</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === "sender" ? null : "sender",
                                        )
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white hover:border-gray-300 transition text-left cursor-pointer"
                                >
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                        {selectedSenderId.label}
                                    </span>
                                    <BiChevronDown
                                        size={22}
                                        className={`text-gray-800 transition-transform shrink-0 ${activeDropdown === "sender" ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Sender ID Popover */}
                                {activeDropdown === "sender" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex flex-col">
                                            {SENDER_ID_OPTIONS.map((opt) => {
                                                const isSelected = selectedSenderId.id === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedSenderId(opt);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-6 py-3.5 transition text-left cursor-pointer ${isSelected
                                                            ? "bg-[#ECECEC]"
                                                            : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <span className="text-sm sm:text-base font-semibold text-gray-900">
                                                            {opt.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-[#37137F] shrink-0 ml-2">
                                                            {opt.price > 0 ? `£${opt.price}` : "Free"}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 📱 On Mobile: Cost Breakdown is nested inside Card 2 (Matching Image 2) */}
                            <div className="w-full border-t border-gray-100 my-2 lg:hidden" />
                            <div className="lg:hidden">
                                {renderCostBreakdown(true)}
                            </div>
                        </div>
                    )}

                    {/* 📱 On Mobile: When SMS is disabled, render Cost Breakdown card below Card 1 */}
                    {!addSmsCredit && (
                        <div className="lg:hidden bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-100">
                            {renderCostBreakdown(true)}
                        </div>
                    )}
                </div>

                {/* 👉 RIGHT COLUMN on Desktop: Cost Breakdown Card (Matching Image 1) */}
                <div className="hidden lg:flex lg:col-span-5 bg-white rounded-3xl p-7 shadow-xs border border-gray-100 flex-col justify-between min-h-[460px]">
                    {renderCostBreakdown(false)}
                </div>
            </div>

            {/* 💳 Stripe Checkout Modal */}
            {stripeModal?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Complete Credit Purchase
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {stripeModal.bundleName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStripeModal(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        {/* Total Highlight */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5 flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-bold text-[#37137F] text-base">
                                {formatNumber(stripeModal.amount, "£")}
                            </span>
                        </div>

                        {/* Stripe Elements Form */}
                        <div className="mt-2">
                            <StripePaymentForm
                                amount={stripeModal.amount}
                                intent={stripeModal.clientSecret}
                                id={stripeModal.bundleId}
                                type="email-bundle"
                                onSuccess={() => {
                                    setStripeModal(null);
                                    queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BALANCE] });
                                    toast.success("Credits added successfully!");
                                }}
                                onCancel={() => setStripeModal(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 🔄 Auto Recharge Settings Modal */}
            {showAutoRecharge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-[#37137F]">
                                    Auto Recharge Settings
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Keep your SMS & email campaigns running without interruption
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAutoRecharge(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        Enable Auto Recharge
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Automatically top up when balance is low
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAutoRechargeEnabled(!autoRechargeEnabled)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${autoRechargeEnabled ? "bg-[#37137F]" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${autoRechargeEnabled ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>

                            {autoRechargeEnabled && (
                                <div className="flex flex-col gap-1.5 animate-in fade-in">
                                    <label className="text-xs font-semibold text-gray-700">
                                        When credit drops below (£):
                                    </label>
                                    <select
                                        value={autoRechargeThreshold}
                                        onChange={(e) => setAutoRechargeThreshold(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-hidden focus:border-[#37137F]"
                                    >
                                        <option value="5">£5.00</option>
                                        <option value="10">£10.00 (Recommended)</option>
                                        <option value="20">£20.00</option>
                                        <option value="50">£50.00</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAutoRecharge(false);
                                    toast.success("Auto recharge settings saved!");
                                }}
                                className="w-full py-3 rounded-xl bg-[#37137F] hover:bg-[#2c0f66] text-white text-sm font-bold transition shadow-xs"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}