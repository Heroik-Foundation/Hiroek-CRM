import { useState, useRef, useEffect, useMemo } from "react";
import { BiChevronDown, BiSearch, BiX, BiEnvelope } from "react-icons/bi";
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
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 741 390">
        <rect width="741" height="390" fill="#b22234" />
        <path d="M0,30h741M0,90h741M0,150h741M0,210h741M0,270h741M0,330h741" stroke="#fff" strokeWidth="30" />
        <rect width="296" height="210" fill="#3c3b6e" />
        <circle cx="148" cy="105" r="18" fill="#fff" opacity="0.9" />
    </svg>
);

const FlagUK = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 60 30">
        <clipPath id="uk-clip">
            <rect width="60" height="30" />
        </clipPath>
        <g clipPath="url(#uk-clip)">
            <rect width="60" height="30" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        </g>
    </svg>
);

const FlagCA = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 64 32">
        <rect width="16" height="32" fill="#d80027" />
        <rect x="16" width="32" height="32" fill="#fff" />
        <rect x="48" width="16" height="32" fill="#d80027" />
        <path d="M32 9l2 5h4l-3 3 1 5-4-3-4 3 1-5-3-3h4z" fill="#d80027" />
    </svg>
);

const FlagAU = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 64 32">
        <rect width="64" height="32" fill="#00008b" />
        <rect width="28" height="16" fill="#012169" />
        <path d="M0,0 L28,16 M28,0 L0,16" stroke="#fff" strokeWidth="3" />
        <path d="M14,0 v16 M0,8 h28" stroke="#c8102e" strokeWidth="2.5" />
        <circle cx="48" cy="18" r="2.5" fill="#fff" />
        <circle cx="56" cy="10" r="1.5" fill="#fff" />
    </svg>
);

const FlagBE = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 30 20">
        <rect width="10" height="20" fill="#000" />
        <rect x="10" width="10" height="20" fill="#ffd90c" />
        <rect x="20" width="10" height="20" fill="#ed2939" />
    </svg>
);

const FlagNG = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 30 20">
        <rect width="10" height="20" fill="#008751" />
        <rect x="10" width="10" height="20" fill="#fff" />
        <rect x="20" width="10" height="20" fill="#008751" />
    </svg>
);

const FlagGH = () => (
    <svg className="w-8 h-6 rounded-xs shadow-xs shrink-0" viewBox="0 0 30 20">
        <rect width="30" height="6.66" fill="#006b3f" />
        <rect y="6.66" width="30" height="6.66" fill="#fcd116" />
        <rect y="13.33" width="30" height="6.67" fill="#ce1126" />
        <polygon points="15,7.5 16.2,11.2 20,11.2 16.9,13.4 18,17 15,14.8 12,17 13.1,13.4 10,11.2 13.8,11.2" fill="#000" transform="translate(0, -1)" />
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

export default function SmsEmailCredits() {
    const queryClient = useQueryClient();

    // 🌐 Consume API Endpoints
    const {
        useGetEmailBundles,
        useGetEmailBalance,
        usePurchaseEmailBundle,
    } = useEmailBundles();

    const { data: bundlesApiData, isLoading: isLoadingBundles } = useGetEmailBundles({
        bundlesType: "active",
    });

    const { data: balanceApiData, isLoading: isLoadingBalance } = useGetEmailBalance();
    const purchaseBundleMutation = usePurchaseEmailBundle();

    // Remaining email credit balance from GET /api/email-bundles/balance
    const emailBalance = useMemo(() => {
        if (typeof balanceApiData?.balance === "number") return balanceApiData.balance;
        if (typeof balanceApiData?.data?.balance === "number") return balanceApiData.data.balance;
        if (typeof balanceApiData?.result?.balance === "number") return balanceApiData.result.balance;
        return 0;
    }, [balanceApiData]);

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
            const formattedRate = rate < 0.01 ? rate.toFixed(4) : rate.toFixed(2);
            return {
                id: item.id || item._id || "",
                credits,
                amount,
                rate,
                label:
                    item.name ||
                    `${credits.toLocaleString()} Emails (£${formattedRate} per mail)`,
            };
        });
    }, [bundlesApiData]);

    // Selections (strictly initialized from endpoint)
    const [selectedEmail, setSelectedEmail] = useState<ProcessedEmailBundle | null>(null);
    const [addSmsCredit, setAddSmsCredit] = useState<boolean>(true);
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

    return (
        <div className="w-full flex flex-col items-center py-6 px-3 sm:px-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#37137F] tracking-tight">
                    Purchase Email Credit
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                    Select Your Email Volume
                </p>
            </div>

            {/* ✉️ Email Credit Balance Card */}
            <div className="w-full max-w-4xl bg-gradient-to-r from-[#37137F]/5 via-[#37137F]/10 to-[#37137F]/5 border border-[#37137F]/15 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#37137F] text-white flex items-center justify-center shadow-xs shrink-0">
                        <BiEnvelope size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Current Email Credit Balance
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            {isLoadingBalance ? (
                                <div className="h-7 w-28 bg-[#37137F]/20 rounded-md animate-pulse"></div>
                            ) : (
                                <>
                                    <span className="text-2xl sm:text-3xl font-black text-[#37137F] tracking-tight">
                                        {Number(emailBalance).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-600">
                                        Credits Available
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/80 border border-gray-200/80 rounded-2xl px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1 Credit = 1 Sent Email</span>
                </div>
            </div>

            {/* Main Content Area: 2 Columns */}
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
                                className="w-full border border-gray-900 rounded-xl px-4 py-3.5 flex items-center justify-between bg-white hover:border-[#37137F] transition text-left cursor-pointer shadow-xs disabled:opacity-60"
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
                                <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                                    {emailBundles.length > 0 ? (
                                        emailBundles.map((opt) => {
                                            const isSelected = selectedEmail?.id === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmail(opt);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between transition cursor-pointer ${isSelected
                                                            ? "bg-gray-100 font-bold text-gray-900"
                                                            : "hover:bg-gray-50 text-gray-700"
                                                        }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    <span className="text-xs font-semibold text-[#37137F]">
                                                        £{opt.amount.toFixed(2)}
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

                        {/* Add SMS Credit Toggle Switch */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <span className="text-sm font-bold text-gray-900">
                                Add SMS Credit
                            </span>
                            <button
                                type="button"
                                onClick={() => setAddSmsCredit(!addSmsCredit)}
                                className={`w-14 h-7 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${addSmsCredit ? "bg-[#37137F]" : "bg-gray-300"
                                    }`}
                                aria-label="Toggle SMS Credit"
                            >
                                <span
                                    className={`absolute text-[10px] font-bold text-white transition-opacity ${addSmsCredit
                                            ? "left-2.5 opacity-100"
                                            : "right-2.5 opacity-0"
                                        }`}
                                >
                                    Yes
                                </span>
                                <span
                                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${addSmsCredit ? "translate-x-7" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Card 2: SMS Options (Destination, Volume, Sender ID) */}
                    {addSmsCredit && (
                        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-100 flex flex-col gap-5 animate-in fade-in duration-200">
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

                                {/* 📌 Destination Country Popover (Matching image exactly) */}
                                {activeDropdown === "country" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                                        {/* Search Box with icon on right */}
                                        <div className="relative mb-3 flex items-center border-b border-gray-100 pb-2.5">
                                            <input
                                                type="text"
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                placeholder="Search"
                                                className="w-full text-base font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden pr-8 pl-1"
                                                autoFocus
                                            />
                                            <BiSearch
                                                size={22}
                                                className="text-gray-500 absolute right-1 pointer-events-none"
                                            />
                                        </div>

                                        {/* Country List */}
                                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
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
                                                            className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl transition text-left cursor-pointer ${isSelected
                                                                    ? "bg-gray-100"
                                                                    : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {c.flagSvg}
                                                            <span className="text-sm sm:text-base font-semibold text-gray-900">
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
                                        )}
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

                                {/* 📌 SMS Volume Popover (Matching image exactly) */}
                                {activeDropdown === "sms" && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-3xl p-3 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex flex-col gap-1">
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
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition text-left cursor-pointer ${isSelected
                                                                ? "bg-gray-100"
                                                                : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm sm:text-base font-bold text-gray-900">
                                                                {opt.count} SMS
                                                            </span>
                                                            <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                                                (£{opt.rate} per SMS)
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#37137F]">
                                                            £{opt.price}
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
                                    Get SMS number
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === "sender" ? null : "sender",
                                        )}
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
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl p-2.5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex flex-col gap-1">
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
                                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition text-left cursor-pointer ${isSelected
                                                                ? "bg-gray-100 font-bold"
                                                                : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
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
                        </div>
                    )}
                </div>

                {/* 👉 RIGHT COLUMN: Cost Breakdown Card */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-7 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[460px]">
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
                    <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 mt-6">
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
                            className="w-full py-3.5 px-6 rounded-2xl bg-[#37137F] hover:bg-[#2c0f66] text-white font-bold text-sm sm:text-base transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {purchaseBundleMutation.isPending ? (
                                <>
                                    <Spinner size="sm" color="current" />
                                    <span>Initializing Purchase...</span>
                                </>
                            ) : (
                                "Buy Now"
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