"use client";

import { useState, type FormEvent } from "react";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "../../config/stripe";
import { CustomButton } from "../ui";
import { Spinner, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { BiLockAlt, BiShield } from "react-icons/bi";
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
    const [isElementReady, setIsElementReady] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const isSetupIntent = intent?.startsWith("seti_");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: submitError } = await elements.submit();

        if (submitError) {
            toast("Payment validation failed", {
                description:
                    submitError.message ?? "Please check your payment details.",
                variant: "danger",
            });
            setIsLoading(false);
            return;
        }

        const returnUrl = `${window.location.origin}/payment`;

        try {
            if (isSetupIntent) {
                // SetupIntent for recurring subscriptions / saved cards
                const result = await stripe.confirmSetup({
                    elements,
                    clientSecret: intent,
                    confirmParams: {
                        return_url: returnUrl,
                    },
                    redirect: "if_required",
                });

                if (result.error) {
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
                const result = await stripe.confirmPayment({
                    elements,
                    clientSecret: intent,
                    confirmParams: {
                        return_url: returnUrl,
                    },
                    redirect: "if_required",
                });

                if (result.error) {
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
            toast("Payment Error", {
                description:
                    err?.message || "An unexpected error occurred. Please try again.",
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
            <div className="relative min-h-[160px]">
                {!isElementReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50/75 rounded-xl">
                        <Spinner size="sm" />
                        <span className="text-xs text-gray-500 font-medium">
                            Loading secure payment fields...
                        </span>
                    </div>
                )}
                <PaymentElement
                    onReady={() => setIsElementReady(true)}
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
                <BiShield size={16} className="text-emerald-600 shrink-0" />
                <span className="flex items-center gap-1">
                    <BiLockAlt size={13} className="text-gray-400" />
                    256-bit encrypted checkout via Stripe
                </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
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

    const options: StripeElementsOptions = {
        clientSecret: intent,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#37137F",
                colorBackground: "#ffffff",
                colorText: "#111827",
                colorDanger: "#ef4444",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                borderRadius: "12px",
                spacingUnit: "4px",
            },
            rules: {
                ".Input": {
                    borderColor: "#E5E7EB",
                    boxShadow: "none",
                },
                ".Input:focus": {
                    borderColor: "#37137F",
                    boxShadow: "0 0 0 1px #37137F",
                },
                ".Tab": {
                    borderColor: "#E5E7EB",
                },
                ".Tab--selected": {
                    borderColor: "#37137F",
                    boxShadow: "0 0 0 1px #37137F",
                },
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
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
