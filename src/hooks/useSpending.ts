
import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";
import { periodSlugAtom } from "../utils/atom/period";

export interface TopSpenderItem {
    id?: string | number;
    rank?: number;
    customerId?: string;
    fullname?: string;
    username?: string;
    totalSpent?: number;
    totalEvents?: number;
    totalTicketsPurchased?: number;
    [key: string]: any;
}

export interface TopSpendersParams {
    period?: "weekly" | "monthly" | "last6Months" | "lastYear" | "allTime" | string;
    eventId?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
}

export interface TopSpendersResponse {
    data?: TopSpenderItem[];
    pagination?: {
        total?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
    };
    total?: number;
}

const useSpending = () => {
    const user = useAtomValue(userAtom);
    const period = useAtomValue(periodSlugAtom);

    const useGetSpendingData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_SPENDING(user?._id ?? ""),
            name: [URLS.GET_SPENDING(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetTicketSpendDistributionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_TICKET_SPEND_DISTRIBUTION(user?._id ?? ""),
            name: [URLS.GET_TICKET_SPEND_DISTRIBUTION(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetTopSpenders = (params?: TopSpendersParams) => {
        const cleanParams: Record<string, unknown> = {};
        cleanParams.period = params?.period ?? period;
        if (params?.eventId) cleanParams.eventId = params.eventId;
        if (params?.page !== undefined) cleanParams.page = params.page;
        if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
        if (params?.limit !== undefined) cleanParams.limit = params.limit;

        return useFetchData<TopSpendersResponse | TopSpenderItem[]>({
            endpoint: URLS.GET_TOP_SPENDERS(user?._id ?? ""),
            name: [
                URLS.GET_TOP_SPENDERS(user?._id ?? ""),
                JSON.stringify(cleanParams),
            ],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetSpendingData,
        useGetTicketSpendDistributionData,
        useGetTopSpenders,
    };
};

export default useSpending;