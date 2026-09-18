import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePlan from "../../../hooks/settings/usePlan";
import { formatNumber } from "../../../config/numberFormat";
import moment from "moment";
import { Spinner } from "@heroui/react";
import { BiCalendar, BiCheckCircle, BiCreditCard, BiInfoCircle } from "react-icons/bi";
import type { IPlanPrice } from "../../../type/plans";

export default function CurrentPlan() {
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<"month" | "year">("month");

    const { useCurrentPlan, useSubscriptionPlan } = usePlan();
    const { data, isLoading, isError, refetch } = useCurrentPlan();
    const { data: plans } = useSubscriptionPlan();

    const planVersion = Array.isArray(data?.planVersion)
        ? data?.planVersion[0]
        : data?.planVersion;

    const activePlanPrice = Array.isArray(data?.planPrice)
        ? data?.planPrice[0]
        : data?.planPrice;

    const activeInterval = useMemo<"month" | "year">(() => {
        return activePlanPrice?.billingInterval === "year" ? "year" : "month";
    }, [activePlanPrice]);

    const matchingPlan = useMemo(() => {
        if (!plans || !planVersion) return null;
        return plans.find((p) => {
            if (planVersion._id && p._id === planVersion._id) return true;
            if (planVersion.name && p.name?.toLowerCase() === planVersion.name?.toLowerCase()) return true;
            const planInfo = typeof planVersion.plan === "object" ? planVersion.plan : null;
            if (planInfo?._id && p.plan?._id === planInfo._id) return true;
            return false;
        });
    }, [plans, planVersion]);

    const availablePrices: IPlanPrice[] = useMemo(() => {
        if (matchingPlan?.price && matchingPlan.price.length > 0) {
            return matchingPlan.price;
        }
        if (Array.isArray(data?.planPrice)) {
            return data.planPrice;
        }
        if (data?.planPrice) {
            return [data.planPrice];
        }
        return [];
    }, [matchingPlan, data]);

    const displayedPriceItem = useMemo(() => {
        const found = availablePrices.find((p) => p.billingInterval === selectedInterval);
        if (found) return found;
        return activePlanPrice;
    }, [availablePrices, selectedInterval, activePlanPrice]);

    const planInfo = typeof planVersion?.plan === "object" ? planVersion.plan : null;
    const planName =
        planInfo?.name ||
        planVersion?.name ||
        matchingPlan?.name ||
        (data?.status && data.status !== "none" ? `${data.status.toUpperCase()} PLAN` : null);

    const features = planVersion?.features || matchingPlan?.features || [];
    const billingInterval = displayedPriceItem?.billingInterval || selectedInterval;
    const priceFormatted = displayedPriceItem?.basePrice != null
        ? formatNumber(displayedPriceItem.basePrice / 100, "£")
        : (planVersion?.isFree || matchingPlan?.isFree ? "Free" : null);

    const status = data?.status || (data ? "active" : "none");
    const hasSubscription = Boolean(data && data.status && data.status !== "none" && (planVersion || planName));

    const isCurrentIntervalActive = Boolean(hasSubscription && activeInterval === selectedInterval);

    const yearlySavings = useMemo(() => {
        const monthItem = availablePrices.find((p) => p.billingInterval === "month");
        const yearItem = availablePrices.find((p) => p.billingInterval === "year");
        if (monthItem?.basePrice != null && yearItem?.basePrice != null) {
            const annualCostIfMonthly = (monthItem.basePrice * 12);
            const savings = (annualCostIfMonthly - yearItem.basePrice) / 100;
            if (savings > 0) return savings;
        }
        return null;
    }, [availablePrices]);

    const renewalDate = data?.currentPeriodEnd
        ? moment(data.currentPeriodEnd).format("MMM DD, YYYY")
        : null;

    const getStatusBadge = (overrideStatus?: string) => {
        if (overrideStatus === "none" || overrideStatus === "inactive") {
            return (
                <span className="bg-white/20 text-white/90 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                    Inactive
                </span>
            );
        }

        if (!hasSubscription) {
            return (
                <span className="bg-white/20 text-white/90 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                    Inactive
                </span>
            );
        }

        // Only show Active if this specific interval is the one paid for
        if (!isCurrentIntervalActive) {
            return (
                <span className="bg-white/20 text-white/90 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                    Inactive on {selectedInterval === "year" ? "Yearly" : "Monthly"}
                </span>
            );
        }

        const s = (overrideStatus || status)?.toLowerCase();
        switch (s) {
            case "active":
                return (
                    <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        Active
                    </span>
                );
            case "trial":
                return (
                    <span className="bg-sky-500/20 text-sky-200 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        Trial
                    </span>
                );
            case "past_due":
                return (
                    <span className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        Past Due
                    </span>
                );
            case "canceled":
            case "cancelled":
                return (
                    <span className="bg-rose-500/20 text-rose-200 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        Cancelled
                    </span>
                );
            case "unpaid":
            case "incomplete":
            case "incomplete_expired":
                return (
                    <span className="bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        Payment Required
                    </span>
                );
            default:
                return (
                    <span className="bg-white/20 text-white/90 border border-white/30 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide">
                        {status || "Inactive"}
                    </span>
                );
        }
    };

    return (
        <section className="flex-1">
            <div className="max-w-175 w-full bg-white rounded-xl p-6 flex flex-col gap-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold text-lg text-gray-900">
                            Subscriptions & Payment
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage your plan, billing details, and assigned team seats
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Month and Year Filter */}
                        <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setSelectedInterval("month")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    selectedInterval === "month"
                                        ? "bg-[#37137F] text-white shadow-xs"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedInterval("year")}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                    selectedInterval === "year"
                                        ? "bg-[#37137F] text-white shadow-xs"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <span>Yearly</span>
                                {yearlySavings != null && (
                                    <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                        Save £{Math.round(yearlySavings)}
                                    </span>
                                )}
                            </button>
                        </div>

                        {isError && (
                            <button
                                onClick={() => refetch()}
                                className="text-xs text-[#37137F] hover:underline font-medium ml-1"
                            >
                                Retry loading
                            </button>
                        )}
                    </div>
                </div>

                {/* Plan Card */}
                {isLoading ? (
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-3">
                        <Spinner size="lg" />
                        <p className="text-xs text-gray-500">Loading your subscription details...</p>
                    </div>
                ) : hasSubscription ? (
                    <div
                        style={{
                            background:
                                "linear-gradient(180deg, #F0276C 0%, #8A163E 100%)",
                        }}
                        className="w-full text-white rounded-3xl p-6 flex flex-col gap-5 shadow-md"
                    >
                        <div className="w-full flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2.5">
                                    <p className="text-xs uppercase tracking-wider text-white/80 font-medium">
                                        Current Plan
                                    </p>
                                    {getStatusBadge()}
                                </div>
                                <p className="text-3xl font-bold capitalize mt-1">
                                    {planName}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(`/dashboard/settings?tab=plan&interval=${selectedInterval}`)
                                }
                                className="px-5 h-11 rounded-2xl font-semibold text-xs bg-white text-[#37137F] hover:bg-white/90 active:scale-95 transition shadow-sm cursor-pointer"
                            >
                                {isCurrentIntervalActive
                                    ? "Upgrade Plan"
                                    : `Switch to ${selectedInterval === "year" ? "Yearly" : "Monthly"}`}
                            </button>
                        </div>

                        {/* Informational banner when viewing the interval that isn't currently active */}
                        {!isCurrentIntervalActive && (
                            <div className="bg-white/10 border border-white/20 text-white/90 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <BiInfoCircle size={18} className="shrink-0 text-amber-300" />
                                    <span>
                                        You are currently subscribed to the <strong>{activeInterval === "year" ? "Yearly" : "Monthly"}</strong> plan. Showing <strong>{selectedInterval === "year" ? "Yearly" : "Monthly"}</strong> rate.
                                    </span>
                                </div>
                                <button
                                    onClick={() =>
                                        navigate(`/dashboard/settings?tab=plan&interval=${selectedInterval}`)
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-white text-[#37137F] font-semibold text-xs shrink-0 hover:bg-white/90 transition shadow-2xs self-start sm:self-auto cursor-pointer"
                                >
                                    Switch to {selectedInterval === "year" ? "Yearly" : "Monthly"}
                                </button>
                            </div>
                        )}

                        {/* Price & Cycle */}
                        <div className="border-y border-white/20 py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">
                                    {priceFormatted ?? "Custom"}
                                </span>
                                {billingInterval && (
                                    <span className="text-white/80 text-xs capitalize">
                                        /{billingInterval}
                                    </span>
                                )}
                                <span
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ml-1 ${
                                        isCurrentIntervalActive
                                            ? "bg-white/20 border-white/30 text-white"
                                            : "bg-amber-400/25 border-amber-300/40 text-amber-200"
                                    }`}
                                >
                                    {isCurrentIntervalActive
                                        ? `Active ${selectedInterval === "year" ? "Annual" : "Monthly"} Cycle`
                                        : `Available on ${selectedInterval === "year" ? "Annual" : "Monthly"}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isCurrentIntervalActive && (
                                    <button
                                        onClick={() =>
                                            navigate(`/dashboard/settings?tab=plan&interval=${selectedInterval}`)
                                        }
                                        className="text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/30 transition cursor-pointer"
                                    >
                                        Switch to {selectedInterval === "year" ? "Annual" : "Monthly"} →
                                    </button>
                                )}

                                {renewalDate && (
                                    <div className="flex items-center gap-1.5 text-xs text-white/90 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                                        <BiCalendar size={15} />
                                        <span>
                                            {isCurrentIntervalActive
                                                ? (data?.cancelAtPeriodEnd
                                                    ? `Expires on ${renewalDate}`
                                                    : `Renews on ${renewalDate}`)
                                                : `Active ${activeInterval} cycle renews on ${renewalDate}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {data?.cancelAtPeriodEnd && (
                            <div className="bg-amber-400/20 border border-amber-300/30 text-amber-100 rounded-xl p-3 text-xs flex items-start gap-2">
                                <BiInfoCircle size={16} className="shrink-0 mt-0.5" />
                                <span>
                                    Cancellation scheduled. Your access remains active until the end of the current billing cycle.
                                </span>
                            </div>
                        )}

                        {/* Features */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                                Included Features:
                            </p>

                            {features.length > 0 ? (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/95">
                                    {features.map((item, index) => (
                                        <li key={index} className="flex items-center gap-2 capitalize">
                                            <BiCheckCircle size={15} className="text-emerald-300 shrink-0" />
                                            <span>{item.replace(/_/g, " ")}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-white/70">
                                    All standard event partner capabilities included.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            background:
                                "linear-gradient(180deg, #3D2188 0%, #23086D 100%)",
                        }}
                        className="w-full text-white rounded-3xl p-6 flex flex-col gap-5 shadow-md"
                    >
                        <div className="w-full flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <p className="text-xs uppercase tracking-wider text-white/80 font-medium">
                                    Current Plan
                                </p>
                                {getStatusBadge("none")}
                            </div>

                            <button
                                onClick={() =>
                                    navigate(`/dashboard/settings?tab=plan&interval=${selectedInterval}`)
                                }
                                className="px-5 h-11 rounded-2xl font-semibold text-xs bg-white text-[#37137F] hover:bg-white/90 active:scale-95 transition cursor-pointer"
                            >
                                Choose a Plan
                            </button>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">No Active Subscription</p>
                            <p className="text-xs text-white/80 mt-1 max-w-md">
                                You currently do not have an active subscription. Choose a plan to access advanced ticketing, analytics, and organizer tools.
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-gray-900">Payment Method</p>
                    <div className="w-full border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#37137F] flex items-center justify-center shrink-0">
                                <BiCreditCard size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {data?.stripeSubscriptionId ? "Card on File (Stripe)" : "No Payment Method Added"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {data?.stripeSubscriptionId
                                        ? `Subscription ID: ${data.stripeSubscriptionId}`
                                        : "Add a payment method to automatically renew your subscription"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/dashboard/settings?tab=plan&interval=${selectedInterval}`)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-[#37137F] hover:bg-gray-100 transition shrink-0 cursor-pointer"
                        >
                            {data?.stripeSubscriptionId ? "Change Plan" : "+ Add Payment Method"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

