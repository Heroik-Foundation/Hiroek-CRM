import { loadStripe } from "@stripe/stripe-js";

export const STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_APP_STRIPE_PUB_KEY ||
    "pk_test_51JnO6tLn8PJ59ABE0TOyJjKepC8cZ79Is85jc5RghwQtxLbDgQ3ROODPBgyXBrMtUWXQvCX72z4RRDwjQjCJDPZo00MUS3GiFo";

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
