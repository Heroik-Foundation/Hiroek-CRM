import { useFetchData } from "./useFetchData";
import { URLS } from "../utils/urls";

export interface EventItem {
    _id?: string;
    id?: string;
    name?: string;
    title?: string;
    photo?: string;
    description?: string;
    organization?: string;
    category?: unknown;
    subcategory?: unknown;
    eventEndDate?: string;
    launchedAt?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface GetEventsParams {
    searchQuery?: string;
    page?: number;
    pageSize?: number;
    userId?: string;
    startDateQuery?: string;
    endDateQuery?: string;
    categoryQuery?: string;
    subCategoryQuery?: string;
    currentUser?: string;
    [key: string]: unknown;
}

export interface GetEventsResponse {
    events?: EventItem[];
    result?: EventItem[];
    data?: EventItem[];
    total?: number;
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
}

export interface GetMyEventsParams {
    timeline?: "all" | "past" | "present" | "upcoming";
    search?: string;
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
}

export interface GetMyEventsResponse {
    data?: EventItem[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    events?: EventItem[];
    result?: EventItem[];
    [key: string]: unknown;
}

/**
 * Hook for accessing events from GET /api/events and GET /api/event-partners/my-events
 * Documentation: https://dev.hiroek.io/api-docs#tag/eventpartners/GET/api/event-partners/my-events
 */
const useEvents = () => {
    const useGetEvents = (params?: GetEventsParams, enable: boolean = true) => {
        return useFetchData<GetEventsResponse | EventItem[]>({
            endpoint: URLS.GET_EVENTS,
            name: [URLS.GET_EVENTS, JSON.stringify(params ?? {})],
            params: params as Record<string, unknown>,
            enable,
        });
    };

    const useGetMyEvents = (params?: GetMyEventsParams, enable: boolean = true) => {
        return useFetchData<GetMyEventsResponse | EventItem[]>({
            endpoint: URLS.GET_MY_EVENTS,
            name: [URLS.GET_MY_EVENTS, JSON.stringify(params ?? {})],
            params: params as Record<string, unknown>,
            enable,
        });
    };

    return {
        useGetEvents,
        useGetMyEvents,
    };
};

export default useEvents;
