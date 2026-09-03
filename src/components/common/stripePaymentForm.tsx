"use client";

import { useState, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { CustomButton } from "../ui";

import { toast } from "@heroui/react";

/* -------------------------------------------------------------------------- */
/*                                   Stripe                                   */
/* -------------------------------------------------------------------------- */

const stripePromise = loadStripe(
    import.meta.env.VITE_APP_STRIPE_PUB_KEY as string,
);

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

interface StripePaymentFormProps {
    amount: number; // dollars
    intent: string; // client_secret
    id: string; // payment / order id
    linkID?: string;
    type: string;
}

interface PaymentFormProps {
    intent: string;
    id: string;
    linkID?: string;
    type: string;
}

/* -------------------------------------------------------------------------- */
/*                               Payment Form                                 */
/* -------------------------------------------------------------------------- */

function PaymentForm({ intent }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const { error: submitError } = await elements.submit();

        if (submitError) {
            toast("Payment failed", {
                description:
                    submitError.message ?? "Unable to complete payment",
                variant: "danger",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                clientSecret: intent,
                confirmParams: {
                    return_url: `${window.location.origin}/payment`,
                },
            });

            // ❗ Only handle errors here
            if (error) {
                toast("Payment failed", {
                    description: error.message ?? "Unable to complete payment",
                    variant: "danger",
                });
                setIsLoading(false);
            }
        } catch {
            toast("Error", {
                description: "Something went wrong. Please try again.",
                variant: "danger",
            });
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <PaymentElement />

            <CustomButton type="submit" fullWidth loading={isLoading}>
                Pay Now
            </CustomButton>
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
}: StripePaymentFormProps) {
    const amountInCents = Math.round(amount * 100);

    const options: StripeElementsOptions = {
        mode: "payment",
        currency: "usd",
        amount: amountInCents,
        appearance: {
            theme: "stripe",
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentForm intent={intent} id={id} linkID={linkID} type={type} />
        </Elements>
    );
}
