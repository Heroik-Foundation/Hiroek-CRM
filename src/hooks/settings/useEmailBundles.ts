import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { useFetchData } from "../useFetchData";
import httpService from "../../config/httpService";
import { toast } from "@heroui/react";

export interface IEmailBundle {
    id?: string;
    _id?: string;
    amount: number;
    credits: number;
    active?: number | boolean;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IEmailBundlesResponse {
    bundlesType?: string;
    page?: number;
    pageSize?: number;
    total?: number;
    results?: IEmailBundle[];
    data?: IEmailBundle[] | { results?: IEmailBundle[] };
}

export interface IPurchaseBundlePayload {
    bundleId: string;
    credits?: number;
    amount?: number;
}

export interface IPurchaseBundleResponse {
    paymentIntentId?: string;
    paymentIntentSecret?: string;
    clientSecret?: string;
    ephemeralKey?: string;
    customer?: string;
    data?: {
        paymentIntentId?: string;
        paymentIntentSecret?: string;
        clientSecret?: string;
        ephemeralKey?: string;
        customer?: string;
    };
}

export interface IEmailBalanceResponse {
    balance?: number;
    data?: {
        balance?: number;
    };
    result?: {
        balance?: number;
    };
}

export interface IEmailAutoPayCard {
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
}

export interface IEmailAutoPaySettings {
    enabled?: boolean;
    active?: boolean;
    status?: "active" | "inactive" | "paused" | string;
    bundleId?: string;
    bundle?: IEmailBundle;
    paymentMethodId?: string;
    card?: IEmailAutoPayCard;
    threshold?: number;
    monthlyLimit?: number; // in pence
    spentThisMonth?: number; // in pence
    pausedReason?: string | null;
    data?: any;
    result?: any;
}

export interface IEmailAutoPaySetupIntentResponse {
    clientSecret?: string;
    paymentIntentSecret?: string;
    setupIntentSecret?: string;
    ephemeralKey?: string;
    customer?: string;
    data?: {
        clientSecret?: string;
        paymentIntentSecret?: string;
        setupIntentSecret?: string;
        ephemeralKey?: string;
        customer?: string;
    };
}

export interface IUpdateEmailAutoPayPayload {
    bundleId: string;
    paymentMethodId: string;
    monthlyLimit: number; // in smallest currency unit (pence)
    threshold?: number; // credits threshold
}

const useEmailBundles = () => {
    const queryClient = useQueryClient();

    const useGetEmailBundles = (params?: {
        bundlesType?: "active" | "all";
        page?: number;
        pageSize?: number;
    }) => {
        return useFetchData<IEmailBundlesResponse>({
            endpoint: URLS.GET_EMAIL_BUNDLES,
            name: [URLS.GET_EMAIL_BUNDLES],
            params: params as Record<string, unknown>,
        });
    };

    const useGetEmailBalance = () => {
        return useFetchData<IEmailBalanceResponse>({
            endpoint: URLS.GET_EMAIL_BALANCE,
            name: [URLS.GET_EMAIL_BALANCE],
        });
    };

    const usePurchaseEmailBundle = () => {
        return useMutation({
            mutationFn: async (payload: string | IPurchaseBundlePayload) => {
                const bundleId = typeof payload === "string" ? payload : payload.bundleId;
                const body =
                    typeof payload === "string"
                        ? { bundleId }
                        : {
                              bundleId: payload.bundleId,
                              credits: payload.credits,
                              amount: payload.amount,
                          };

                const response = await httpService.post<IPurchaseBundleResponse>(
                    URLS.PURCHASE_EMAIL_BUNDLE(bundleId),
                    body,
                );
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BUNDLES] });
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BALANCE] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to initialize purchase";
                toast.danger(msg);
            },
        });
    };

    /** 🔹 GET /api/email-bundles/auto-pay: Get auto-pay settings */
    const useGetEmailAutoPay = () => {
        return useFetchData<IEmailAutoPaySettings>({
            endpoint: URLS.GET_EMAIL_AUTO_PAY,
            name: [URLS.GET_EMAIL_AUTO_PAY],
        });
    };

    /** 🔹 POST /api/email-bundles/auto-pay/setup-intent: Start saving card for auto-pay */
    const useCreateAutoPaySetupIntent = () => {
        return useMutation({
            mutationFn: async () => {
                const response = await httpService.post<IEmailAutoPaySetupIntentResponse>(
                    URLS.CREATE_EMAIL_AUTO_PAY_SETUP_INTENT,
                    {},
                );
                return response.data;
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to initialize card setup for auto pay";
                toast.danger(msg);
            },
        });
    };

    /** 🔹 PUT /api/email-bundles/auto-pay: Turn on (or change, or resume) auto-pay */
    const useUpdateEmailAutoPay = () => {
        return useMutation({
            mutationFn: async (payload: IUpdateEmailAutoPayPayload) => {
                const response = await httpService.put(
                    URLS.UPDATE_EMAIL_AUTO_PAY,
                    payload,
                );
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_AUTO_PAY] });
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BALANCE] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to update auto pay settings";
                toast.danger(msg);
            },
        });
    };

    /** 🔹 DELETE /api/email-bundles/auto-pay: Turn off auto-pay */
    const useDeleteEmailAutoPay = () => {
        return useMutation({
            mutationFn: async () => {
                const response = await httpService.delete(
                    URLS.DELETE_EMAIL_AUTO_PAY,
                );
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_AUTO_PAY] });
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BALANCE] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to turn off auto pay";
                toast.danger(msg);
            },
        });
    };

    return {
        useGetEmailBundles,
        useGetEmailBalance,
        usePurchaseEmailBundle,
        useGetEmailAutoPay,
        useCreateAutoPaySetupIntent,
        useUpdateEmailAutoPay,
        useDeleteEmailAutoPay,
    };
};

export default useEmailBundles;
