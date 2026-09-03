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
    planVersion: IPlanVersion;
    status:
        | "active"
        | "inactive"
        | "cancelled"
        | "expired"
        | "trial"
        | "none"
        | string;
    cancelAtPeriodEnd: boolean;
    failedPaymentAttempts: number;
    __v: number;
}

export interface IPlanVersion {
    isFree: boolean;
    _id: string;
    plan: string;
    version: number;
    name: string;
    features: string[];
    isActive: boolean;
}
