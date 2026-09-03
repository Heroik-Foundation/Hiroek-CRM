import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";

export interface RevenueMetrics {
    totalRevenue?: number;
    totalCustomers?: number;
    totalTickets?: number;
    averageTicketPrice?: number;
}

export interface MonthlyRevenueTrendItem {
    year?: number;
    month?: number;
    label?: string;
    revenue?: number;
}

export interface EventRevenueItem {
    eventName?: string;
    label?: string;
    category?: string;
    revenue?: number;
    value?: number;
}

export interface EventPerformanceParams {
    page?: number;
    limit?: number;
    search?: string;
}

const useRevenue = () => {
    const user = useAtomValue(userAtom);

    const useGetRevenueMetrics = () => {
        return useFetchData<RevenueMetrics>({
            endpoint: URLS.GET_REVENUE_METRICS(user?._id ?? ""),
            name: [URLS.GET_REVENUE_METRICS(user?._id ?? "")],
            enable: Boolean(user?._id),
        });
    };

    const useGetMonthlyRevenueTrend = () => {
        return useFetchData<MonthlyRevenueTrendItem[]>({
            endpoint: URLS.GET_MONTHLY_REVENUE_TREND(user?._id ?? ""),
            name: [URLS.GET_MONTHLY_REVENUE_TREND(user?._id ?? "")],
            enable: Boolean(user?._id),
        });
    };

    const useGetRevenueByEvent = () => {
        return useFetchData<EventRevenueItem[]>({
            endpoint: URLS.GET_REVENUE_BY_EVENT(user?._id ?? ""),
            name: [URLS.GET_REVENUE_BY_EVENT(user?._id ?? "")],
            enable: Boolean(user?._id),
        });
    };

    const useGetEventPerformanceRecord = (params?: EventPerformanceParams) => {
        return useFetchData<any>({
            endpoint: URLS.GET_EVENT_PERFORMANCE_RECORD(user?._id ?? ""),
            name: [
                URLS.GET_EVENT_PERFORMANCE_RECORD(user?._id ?? ""),
                JSON.stringify(params ?? {}),
            ],
            params: params as Record<string, unknown>,
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetRevenueMetrics,
        useGetMonthlyRevenueTrend,
        useGetRevenueByEvent,
        useGetEventPerformanceRecord,
    };
};

export default useRevenue;
