"use client";

import { useState, type FormEvent } from "react";
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../../config/stripe";
import { CustomButton } from "../ui";
import { Spinner, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export interface StripePaymentFormProps {
    amount?: number;
    intent: string; // client_secret (pi_... or seti_...)
    id?: string; // payment / plan / bundle ID
    linkID?: string;
    type?: string; // "subscription" | "bundle" | "payment"
    currency?: string;
    planName?: string;
    submitButtonText?: string;
    onSuccess?: (result: any) => void;
    onCancel?: () => void;
}

interface PaymentFormProps {
    intent: string;
    id?: string;
    linkID?: string;
    type?: string;
    amount?: number;
    planName?: string;
    submitButtonText?: string;
    onSuccess?: (result: any) => void;
    onCancel?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                               Payment Form                                 */
/* -------------------------------------------------------------------------- */

const elementStyle = {
    base: {
        fontSize: "14px",
        color: "#111827",
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "::placeholder": {
            color: "#9CA3AF",
        },
        iconColor: "#37137F",
    },
    invalid: {
        color: "#EF4444",
        iconColor: "#EF4444",
    },
};

function PaymentForm({
    intent,
    amount,
    planName,
    submitButtonText,
    onSuccess,
    onCancel,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [isNumberReady, setIsNumberReady] = useState(false);
    const [isExpiryReady, setIsExpiryReady] = useState(false);
    const [isCvcReady, setIsCvcReady] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);
    const [cardholderName, setCardholderName] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const isElementReady = isNumberReady && isExpiryReady && isCvcReady;
    const isSetupIntent = intent?.startsWith("seti_");

    const handleCardChange = (e: any) => {
        if (e.error) {
            setCardError(e.error.message);
        } else {
            setCardError(null);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            toast("Payment Error", {
                description: "Card field is not ready. Please try again.",
                variant: "danger",
            });
            return;
        }

        setIsLoading(true);
        setCardError(null);

        const returnUrl = `${window.location.origin}/payment`;
        const billingDetails = {
            name: cardholderName.trim() || undefined,
            address: postalCode.trim()
                ? { postal_code: postalCode.trim() }
                : undefined,
        };

        try {
            if (isSetupIntent) {
                // SetupIntent for recurring subscriptions / saved cards
                const result = await stripe.confirmCardSetup(intent, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: billingDetails,
                    },
                    return_url: returnUrl,
                });

                if (result.error) {
                    setCardError(result.error.message ?? "Card authorization failed.");
                    toast("Setup failed", {
                        description:
                            result.error.message ?? "Unable to authorize payment method.",
                        variant: "danger",
                    });
                    setIsLoading(false);
                    return;
                }

                // Synchronous success
                await queryClient.invalidateQueries({
                    queryKey: [URLS.GET_CURRENT_PLAN],
                });
                toast("Subscription Updated", {
                    description: planName
                        ? `Your subscription to ${planName} is confirmed!`
                        : "Payment method successfully authorized.",
                    variant: "success",
                });

                if (onSuccess) {
                    onSuccess(result.setupIntent);
                } else {
                    navigate("/payment?redirect_status=succeeded");
                }
            } else {
                // PaymentIntent for one-time payments or immediate invoice charges
                const result = await stripe.confirmCardPayment(intent, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: billingDetails,
                    },
                    return_url: returnUrl,
                });

                if (result.error) {
                    setCardError(result.error.message ?? "Payment failed.");
                    toast("Payment failed", {
                        description:
                            result.error.message ?? "Unable to complete payment.",
                        variant: "danger",
                    });
                    setIsLoading(false);
                    return;
                }

                // Synchronous success
                await queryClient.invalidateQueries({
                    queryKey: [URLS.GET_CURRENT_PLAN],
                });
                toast("Payment Successful", {
                    description: planName
                        ? `Successfully paid for ${planName}.`
                        : "Your payment was processed successfully.",
                    variant: "success",
                });

                if (onSuccess) {
                    onSuccess(result.paymentIntent);
                } else {
                    navigate("/payment?redirect_status=succeeded");
                }
            }
        } catch (err: any) {
            const msg =
                err?.message || "An unexpected error occurred. Please try again.";
            setCardError(msg);
            toast("Payment Error", {
                description: msg,
                variant: "danger",
            });
            setIsLoading(false);
        }
    };

    const buttonLabel =
        submitButtonText ||
        (amount != null && amount > 0
            ? `Pay £${amount.toFixed(2)}`
            : planName
                ? `Confirm ${planName}`
                : "Complete Payment");

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col gap-3">
                {/* 1. Cardholder Name */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="e.g. John Doe"
                        disabled={isLoading}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all disabled:opacity-50"
                    />
                </div>

                {/* 2. Card Number */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>Card Number</span>
                        <span className="text-[11px] font-normal text-gray-400">
                            Credit or Debit Card
                        </span>
                    </label>
                    <div className="relative min-h-[46px] w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-[#37137F] focus-within:ring-1 focus-within:ring-[#37137F] transition-all">
                        {!isNumberReady && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-gray-50/75 rounded-xl z-10">
                                <Spinner size="sm" />
                                <span className="text-xs text-gray-500 font-medium">
                                    Loading card field...
                                </span>
                            </div>
                        )}
                        <CardNumberElement
                            onReady={() => setIsNumberReady(true)}
                            onChange={handleCardChange}
                            options={{
                                style: elementStyle,
                                showIcon: true,
                            }}
                        />
                    </div>
                </div>

                {/* 3. Expiry Date & CVC */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Expiration Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">
                            Expiration Date
                        </label>
                        <div className="relative min-h-[46px] w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-[#37137F] focus-within:ring-1 focus-within:ring-[#37137F] transition-all">
                            {!isExpiryReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/75 rounded-xl z-10">
                                    <Spinner size="sm" />
                                </div>
                            )}
                            <CardExpiryElement
                                onReady={() => setIsExpiryReady(true)}
                                onChange={handleCardChange}
                                options={{ style: elementStyle }}
                            />
                        </div>
                    </div>

                    {/* CVC */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">
                            Security Code (CVC)
                        </label>
                        <div className="relative min-h-[46px] w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-[#37137F] focus-within:ring-1 focus-within:ring-[#37137F] transition-all">
                            {!isCvcReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/75 rounded-xl z-10">
                                    <Spinner size="sm" />
                                </div>
                            )}
                            <CardCvcElement
                                onReady={() => setIsCvcReady(true)}
                                onChange={handleCardChange}
                                options={{ style: elementStyle }}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Postal / ZIP Code */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>Postal / ZIP Code</span>
                        <span className="text-[11px] font-normal text-gray-400">
                            Billing Address
                        </span>
                    </label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. SW1A 1AA or 90210"
                        disabled={isLoading}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all disabled:opacity-50"
                    />
                </div>

                {cardError && (
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                        {cardError}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
                <CustomButton
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    disabled={!isElementReady || isLoading}
                >
                    {buttonLabel}
                </CustomButton>
            </div>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/*                              Stripe Wrapper                                */
/* -------------------------------------------------------------------------- */

export default function StripePaymentForm({
    amount,
    intent,
    id,
    linkID,
    type,
    planName,
    submitButtonText,
    onSuccess,
    onCancel,
}: StripePaymentFormProps) {
    if (!intent) {
        return (
            <div className="w-full py-8 flex flex-col items-center justify-center gap-2 text-center text-gray-500">
                <Spinner size="md" />
                <p className="text-xs">Preparing payment session...</p>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm
                intent={intent}
                id={id}
                linkID={linkID}
                type={type}
                amount={amount}
                planName={planName}
                submitButtonText={submitButtonText}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </Elements>
    );
}
