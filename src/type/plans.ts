export interface IPlan {
    isFree: boolean;
    _id: string;
    plan: IPlanInfo;
    version: number;
    name: string;
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    price: IPlanPrice[];
}

export interface IPlanInfo {
    _id: string;
    code: string;
    name: string;
}

export interface IPlanPrice {
    _id: string;
    planVersion: string;
    billingInterval: "month" | "year";
    basePrice: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    stripeBasePriceId: string;
}

export interface IUserSubscription {
    _id: string;
    user: string;
    planPrice?: IPlanPrice | IPlanPrice[];
    planVersion?: IPlanVersion | IPlanVersion[];
    stripeSubscriptionId?: string;
    stripeSubscriptionItemId?: string;
    status:
        | "active"
        | "inactive"
        | "cancelled"
        | "canceled"
        | "past_due"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "expired"
        | "trial"
        | "none"
        | string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
    lastPaymentFailedAt?: string;
    failedPaymentAttempts?: number;
    __v?: number;
}

export interface IPlanVersion {
    isFree: boolean;
    _id: string;
    plan: IPlanInfo | string;
    version: number;
    name: string;
    features: string[];
    isActive: boolean;
}

export interface IChangePlanPayload {
    planId: string;
    interval?: "month" | "year";
}

export interface IChangePlanResponse {
    clientSecret?: string;
    message?: string;
}

