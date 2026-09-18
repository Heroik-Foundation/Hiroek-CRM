import { useState } from "react";
import usePlan from "../../../hooks/settings/usePlan";
import { Header } from "../../common";
import { BiChevronLeft, BiCheckCircle, BiX } from "react-icons/bi";
import { LoadingLayout } from "../../layout"; 
import { formatNumber } from "../../../config/numberFormat";
import { useNavigate, useSearchParams } from "react-router-dom";
import StripePaymentForm from "../../common/stripePaymentForm";
import { toast } from "@heroui/react";
import type { IPlanPrice } from "../../../type/plans";

export default function SelectPlan() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryInterval = searchParams.get("interval");
    const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
        queryInterval === "year" ? "year" : "month"
    );

    const { useSubscriptionPlan, useCurrentPlan, useChangePlan } = usePlan(); 
    const { data: plans, isLoading } = useSubscriptionPlan(); 
    const { data: currentSubscription } = useCurrentPlan();
    const changePlan = useChangePlan();

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        clientSecret: string;
        amount: number;
        planName: string;
        planId: string;
    } | null>(null);

    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const currentPlanVersion = Array.isArray(currentSubscription?.planVersion)
        ? currentSubscription?.planVersion[0]
        : currentSubscription?.planVersion;

    const currentPlanPrice = Array.isArray(currentSubscription?.planPrice)
        ? currentSubscription?.planPrice[0]
        : currentSubscription?.planPrice;

    const currentPlanName = (typeof currentPlanVersion?.plan === "object" ? currentPlanVersion?.plan?.name : null) || currentPlanVersion?.name;

    const handleSelectPlan = async (
        planId: string,
        planName: string,
        subitem?: IPlanPrice,
    ) => {
        const interval = subitem?.billingInterval || selectedInterval || "month";
        const key = `${planId}-${interval}`;
        setSelectedKey(key);

        try {
            const res = await changePlan.mutateAsync({
                planId,
                interval,
            });

            if (res?.clientSecret) {
                const amount = subitem?.basePrice ? subitem.basePrice / 100 : 0;
                setPaymentModal({
                    isOpen: true,
                    clientSecret: res.clientSecret,
                    amount,
                    planName,
                    planId,
                });
            } else {
                toast("Subscription Plan Updated", {
                    description: `You are now subscribed to the ${planName}.`,
                    variant: "success",
                });
                navigate("/dashboard/settings?tab=subscriptions");
            }
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error?.message ||
                "Failed to change subscription plan. Please try again.";
            toast("Error Changing Plan", {
                description: errorMsg,
                variant: "danger",
            });
        } finally {
            setSelectedKey(null);
        }
    };

    return (
        <LoadingLayout loading={isLoading} length={plans?.length}>
            <section className="flex-1 rounded-2xl p-5 bg-white flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            type="button"
                            className="w-11 h-11 bg-[#37137F] text-white rounded-lg flex justify-center items-center hover:opacity-90 transition cursor-pointer"
                        >
                            <BiChevronLeft size={25} />
                        </button>
                        <Header
                            title="Subscription Plans"
                            body="Buy and upgrade your plan for a better experience"
                        />
                    </div>

                    {/* Month and Year Filter */}
                    <div className="inline-flex items-center self-start sm:self-auto bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setSelectedInterval("month")}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                selectedInterval === "year"
                                    ? "bg-[#37137F] text-white shadow-xs"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <div className="w-auto flex overflow-x-auto gap-4 pb-4">
                    {plans?.map((item, index) => {
                        const matchingPrice = item?.price?.find(
                            (p) => p.billingInterval === selectedInterval
                        ) || (item?.price && item.price.length > 0 ? item.price[0] : null);

                        const interval = matchingPrice?.billingInterval || selectedInterval;
                        const currentBillingInterval =
                            currentPlanPrice?.billingInterval === "year" ? "year" : "month";

                        const isSubscriptionActive = Boolean(
                            currentSubscription &&
                            currentSubscription.status &&
                            currentSubscription.status.toLowerCase() === "active"
                        );

                        const isSamePlan = Boolean(
                            (currentPlanVersion?._id && item._id === currentPlanVersion._id) ||
                            (currentPlanName &&
                                item?.name &&
                                currentPlanName.toLowerCase() === item.name.toLowerCase())
                        );

                        const isCurrent = Boolean(
                            isSubscriptionActive &&
                            isSamePlan &&
                            currentBillingInterval === selectedInterval
                        );

                        const isSelectedLoading =
                            changePlan.isPending &&
                            selectedKey === `${item._id}-${interval}`;

                        return (
                            <div
                                key={item._id || index}
                                style={{
                                    background:
                                        index === 1
                                            ? "linear-gradient(180deg, #F0276C 0%, #8A163E 100%)"
                                            : "linear-gradient(180deg, #3D2188 0%, #23086D 100%)",
                                }}
                                className="w-110 min-w-85 text-white rounded-3xl p-6 flex flex-col gap-6 shadow-md"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <p className="text-2xl capitalize font-bold">
                                            {item?.name}
                                        </p>
                                        <p className="text-xs text-white/75 mt-0.5">
                                            {item?.plan?.name || "Event Partner Tier"}
                                        </p>
                                    </div>
                                    {isCurrent && (
                                        <span className="bg-white/20 border border-white/40 text-xs px-3 py-1 rounded-full font-semibold">
                                            Active Plan
                                        </span>
                                    )}
                                </div>

                                <div className="border-b border-white/25 pb-4">
                                    {matchingPrice?.basePrice != null ? (
                                        <p className="text-2xl font-bold">
                                            {formatNumber(matchingPrice.basePrice / 100, "£")}
                                            <span className="text-sm font-normal text-white/80">
                                                /{matchingPrice.billingInterval}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {item.isFree ? "Free" : "Standard"}
                                        </p>
                                    )}
                                </div>

                                <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                                    Plan Features:
                                </p>

                                <ul className="flex flex-col gap-2 text-xs text-white/90 flex-1">
                                    {item?.features?.map((feat, featIdx) => (
                                        <li key={featIdx} className="flex items-center gap-2 capitalize">
                                            <BiCheckCircle size={15} className="text-emerald-300 shrink-0" />
                                            <span>{feat.replace(/_/g, " ")}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={isCurrent || isSelectedLoading || changePlan.isPending}
                                    onClick={() =>
                                        handleSelectPlan(
                                            item._id,
                                            item.name,
                                            matchingPrice ?? undefined,
                                        )
                                    }
                                    className={`w-full h-12 mt-auto rounded-2xl font-semibold text-xs transition active:scale-95 cursor-pointer ${
                                        isCurrent
                                            ? "bg-white/40 text-white/80 cursor-not-allowed"
                                            : "bg-white text-[#37137F] hover:bg-white/95 shadow-sm"
                                    }`}
                                >
                                    {isCurrent
                                        ? "Current Plan"
                                        : isSelectedLoading
                                          ? "Processing..."
                                          : "Select Plan"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Stripe Checkout Modal */}
                {paymentModal?.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex justify-between items-center border-b pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Complete Subscription
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Upgrading to {paymentModal.planName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPaymentModal(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <BiX size={24} />
                                </button>
                            </div>

                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex justify-between items-center text-sm">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold text-[#37137F] text-base">
                                    {formatNumber(paymentModal.amount, "£")}
                                </span>
                            </div>

                            <div className="mt-2">
                                <StripePaymentForm
                                    amount={paymentModal.amount}
                                    intent={paymentModal.clientSecret}
                                    id={paymentModal.planId}
                                    planName={paymentModal.planName}
                                    type="subscription"
                                    onSuccess={() => {
                                        setPaymentModal(null);
                                        navigate("/dashboard/settings?tab=subscriptions");
                                    }}
                                    onCancel={() => setPaymentModal(null)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </LoadingLayout>
    );
}

