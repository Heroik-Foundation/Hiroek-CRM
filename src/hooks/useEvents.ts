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

/**
 * Hook for accessing events from GET /api/events
 * Documentation: https://dev.hiroek.io/api-docs/#tag/events/GET/api/events
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

    return {
        useGetEvents,
    };
};

export default useEvents;
