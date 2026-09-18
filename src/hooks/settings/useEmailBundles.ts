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
            mutationFn: async (bundleId: string) => {
                const response = await httpService.post<IPurchaseBundleResponse>(
                    URLS.PURCHASE_EMAIL_BUNDLE(bundleId),
                    {},
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

    return {
        useGetEmailBundles,
        useGetEmailBalance,
        usePurchaseEmailBundle,
    };
};

export default useEmailBundles;
