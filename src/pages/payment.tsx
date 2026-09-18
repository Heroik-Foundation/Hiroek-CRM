import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../config/stripe";
import StripePaymentForm from "../components/common/stripePaymentForm";
import usePlan from "../hooks/settings/usePlan";
import { useQueryClient } from "@tanstack/react-query";
import { URLS } from "../utils/urls";
import { Spinner } from "@heroui/react";
import {
    BiCheckCircle,
    BiErrorCircle,
    BiTimeFive,
    BiArrowBack,
    BiCreditCard,
    BiShieldQuarter,
} from "react-icons/bi";
import { formatNumber } from "../config/numberFormat";

function PaymentStatusContent() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const stripe = useStripe();

    const [status, setStatus] = useState<
        "loading" | "succeeded" | "processing" | "requires_payment_method" | "checkout" | "idle"
    >("loading");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [intentId, setIntentId] = useState<string | null>(null);

    // Location state passed during programmatic navigation
    const checkoutState = location.state as {
        clientSecret?: string;
        amount?: number;
        planName?: string;
        planId?: string;
        type?: string;
    } | null;

    const redirectStatus = searchParams.get("redirect_status");
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");
    const setupIntentClientSecret = searchParams.get("setup_intent_client_secret");
    const paymentIntentId = searchParams.get("payment_intent");
    const setupIntentId = searchParams.get("setup_intent");

    useEffect(() => {
        // Case 1: Stripe Redirect Callback
        if (redirectStatus) {
            setIntentId(paymentIntentId || setupIntentId);

            if (redirectStatus === "succeeded") {
                setStatus("succeeded");
                setStatusMessage("Your payment has been successfully processed.");
                queryClient.invalidateQueries({ queryKey: [URLS.GET_CURRENT_PLAN] });
            } else if (redirectStatus === "processing") {
                setStatus("processing");
                setStatusMessage(
                    "Your payment is currently processing. We'll update your account as soon as it clears."
                );
            } else if (redirectStatus === "requires_payment_method") {
                setStatus("requires_payment_method");
                setStatusMessage(
                    "Payment failed or was declined. Please choose a different payment method and try again."
                );
            } else {
                setStatus("requires_payment_method");
                setStatusMessage("Unable to complete payment. Please try again.");
            }
            return;
        }

        // Case 2: Inspect via Stripe Client Secret if redirected without status query
        if (stripe && (paymentIntentClientSecret || setupIntentClientSecret)) {
            if (paymentIntentClientSecret) {
                stripe.retrievePaymentIntent(paymentIntentClientSecret).then(({ paymentIntent }) => {
                    if (!paymentIntent) return;
                    setIntentId(paymentIntent.id);
                    switch (paymentIntent.status) {
                        case "succeeded":
                            setStatus("succeeded");
                            setStatusMessage("Your payment has been successfully processed.");
                            queryClient.invalidateQueries({ queryKey: [URLS.GET_CURRENT_PLAN] });
                            break;
                        case "processing":
                            setStatus("processing");
                            setStatusMessage("Your payment is processing.");
                            break;
                        case "requires_payment_method":
                            setStatus("requires_payment_method");
                            setStatusMessage("Payment failed. Please try another payment method.");
                            break;
                        default:
                            setStatus("requires_payment_method");
                            setStatusMessage("Payment incomplete. Please try again.");
                            break;
                    }
                });
            } else if (setupIntentClientSecret) {
                stripe.retrieveSetupIntent(setupIntentClientSecret).then(({ setupIntent }) => {
                    if (!setupIntent) return;
                    setIntentId(setupIntent.id);
                    switch (setupIntent.status) {
                        case "succeeded":
                            setStatus("succeeded");
                            setStatusMessage("Your payment method has been authorized.");
                            queryClient.invalidateQueries({ queryKey: [URLS.GET_CURRENT_PLAN] });
                            break;
                        case "processing":
                            setStatus("processing");
                            setStatusMessage("Authorization is processing.");
                            break;
                        case "requires_payment_method":
                            setStatus("requires_payment_method");
                            setStatusMessage("Payment authorization failed.");
                            break;
                        default:
                            setStatus("requires_payment_method");
                            setStatusMessage("Authorization incomplete. Please try again.");
                            break;
                    }
                });
            }
            return;
        }

        // Case 3: Direct Checkout Mode via router state
        if (checkoutState?.clientSecret) {
            setStatus("checkout");
            return;
        }

        // Case 4: Visited directly without parameters
        setStatus("idle");
    }, [
        stripe,
        redirectStatus,
        paymentIntentClientSecret,
        setupIntentClientSecret,
        paymentIntentId,
        setupIntentId,
        checkoutState,
        queryClient,
    ]);

    const { useCurrentPlan } = usePlan();
    const { data: currentSubscription, isLoading: isPlanLoading } = useCurrentPlan();

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50/20 to-gray-100 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center">
                {/* Status: Loading */}
                {status === "loading" && (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-sm font-semibold text-gray-700">
                            Verifying payment details...
                        </p>
                        <p className="text-xs text-gray-500 max-w-xs">
                            Please wait while we connect with Stripe to confirm your transaction.
                        </p>
                    </div>
                )}

                {/* Status: Succeeded */}
                {status === "succeeded" && (
                    <div className="w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                            <BiCheckCircle size={44} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                {statusMessage || "Your subscription has been updated and your receipt has been generated."}
                            </p>
                        </div>

                        {intentId && (
                            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex flex-col gap-1 text-left text-xs">
                                <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">
                                    Transaction Reference
                                </span>
                                <span className="font-mono text-gray-700 break-all">
                                    {intentId}
                                </span>
                            </div>
                        )}

                        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=subscriptions")}
                                className="flex-1 h-12 rounded-2xl bg-[#37137F] hover:bg-[#2e0e6c] text-white font-semibold text-xs transition shadow-md active:scale-95"
                            >
                                View Subscription
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition active:scale-95"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Status: Processing */}
                {status === "processing" && (
                    <div className="w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-18 h-18 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <BiTimeFive size={42} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Payment Processing
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                {statusMessage}
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-3 pt-2">
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=subscriptions")}
                                className="w-full h-12 rounded-2xl bg-[#37137F] text-white font-semibold text-xs transition"
                            >
                                Back to Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Status: Failed / Requires Action */}
                {status === "requires_payment_method" && (
                    <div className="w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-18 h-18 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <BiErrorCircle size={44} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Payment Unsuccessful
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                {statusMessage}
                            </p>
                        </div>

                        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=plan")}
                                className="flex-1 h-12 rounded-2xl bg-[#37137F] text-white font-semibold text-xs transition shadow-md"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=subscriptions")}
                                className="flex-1 h-12 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-xs transition"
                            >
                                View Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Status: Standalone Checkout Form */}
                {status === "checkout" && checkoutState?.clientSecret && (
                    <div className="w-full flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                            >
                                <BiArrowBack size={18} />
                            </button>
                            <span>Back</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Complete Checkout
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Upgrade to {checkoutState.planName || "Subscription Plan"}
                            </p>
                        </div>

                        {checkoutState.amount != null && checkoutState.amount > 0 && (
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-purple-900 font-medium">
                                        Total Due Today
                                    </span>
                                    <p className="text-xs text-purple-700">
                                        {checkoutState.planName || "Plan Upgrade"}
                                    </p>
                                </div>
                                <span className="font-bold text-2xl text-[#37137F]">
                                    {formatNumber(checkoutState.amount, "£")}
                                </span>
                            </div>
                        )}

                        <div className="pt-2">
                            <StripePaymentForm
                                intent={checkoutState.clientSecret}
                                amount={checkoutState.amount}
                                planName={checkoutState.planName}
                                id={checkoutState.planId}
                                type={checkoutState.type || "subscription"}
                                onSuccess={() => {
                                    setStatus("succeeded");
                                    setStatusMessage("Your payment has been successfully processed.");
                                }}
                                onCancel={() => navigate(-1)}
                            />
                        </div>
                    </div>
                )}

                {/* Status: Idle (Visited without params) */}
                {status === "idle" && (
                    <div className="w-full flex flex-col items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#37137F] flex items-center justify-center">
                            <BiCreditCard size={36} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Payments & Billing
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                Manage and review your subscription and payment methods.
                            </p>
                        </div>

                        {isPlanLoading ? (
                            <Spinner size="sm" />
                        ) : currentSubscription ? (
                            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left text-xs flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Subscription Status:</span>
                                    <span className="font-semibold text-emerald-700 capitalize bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        {currentSubscription.status || "Active"}
                                    </span>
                                </div>
                                {currentSubscription.stripeSubscriptionId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Subscription ID:</span>
                                        <span className="font-mono text-gray-700">
                                            {currentSubscription.stripeSubscriptionId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=plan")}
                                className="flex-1 h-12 rounded-2xl bg-[#37137F] text-white font-semibold text-xs transition shadow-md active:scale-95"
                            >
                                View Plans & Upgrade
                            </button>
                            <button
                                onClick={() => navigate("/dashboard/settings?tab=subscriptions")}
                                className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition active:scale-95"
                            >
                                Settings
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-2">
                            <BiShieldQuarter size={14} />
                            <span>Powered by Stripe Payments</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Payment() {
    return (
        <Elements stripe={stripePromise}>
            <PaymentStatusContent />
        </Elements>
    );
}