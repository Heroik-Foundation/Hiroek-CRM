import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";

export interface ReviewUser {
    _id?: string;
    fullname?: string;
    username?: string;
    phone?: string;
    photo?: string | null;
    email?: string;
}

export interface ReviewEvent {
    _id?: string;
    name?: string;
    title?: string;
    photo?: string;
    description?: string;
}

export interface ReviewOrganizer {
    _id?: string;
    name?: string;
    logo?: string;
}

export interface ReviewItemResponse {
    _id?: string;
    id?: string | number;
    user?: ReviewUser;
    event?: ReviewEvent | string;
    organizer?: ReviewOrganizer;
    comment?: string;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewPagination {
    page?: number;
    limit?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
}

export interface ReviewsResponse {
    data?: ReviewItemResponse[];
    pagination?: ReviewPagination;
    result?: {
        data?: ReviewItemResponse[];
        pagination?: ReviewPagination;
    };
}

export interface RatingDistributionItem {
    rating: number;
    count: number;
    percentage: number;
}

export interface RatingStatsAverages {
    averageRating?: number;
    previousAverageRating?: number;
    percentageChange?: number;
    trend?: "increased" | "decreased" | string;
    currentQuarterReviews?: number;
    previousQuarterReviews?: number;
}

export interface RatingAnalyticsResponse {
    ratingDistribution?: {
        summary?: Record<string, unknown>;
        ratingDistribution?: RatingDistributionItem[];
    };
    statsAverages?: RatingStatsAverages;
    data?: {
        ratingDistribution?: {
            summary?: Record<string, unknown>;
            ratingDistribution?: RatingDistributionItem[];
        };
        statsAverages?: RatingStatsAverages;
    };
    result?: {
        ratingDistribution?: {
            summary?: Record<string, unknown>;
            ratingDistribution?: RatingDistributionItem[];
        };
        statsAverages?: RatingStatsAverages;
    };
}

export interface ReviewQueryParams {
    page?: number;
    pageSize?: number;
    limit?: number;
    ratingFloor?: number | string;
    eventId?: string;
}

export interface ReviewStatsQueryParams {
    ratingFloor?: number | string;
    eventId?: string;
}

const useReview = () => {
    const user = useAtomValue(userAtom);

    const useGetReviews = (params?: ReviewQueryParams) => {
        // Filter out undefined / empty values
        const cleanParams: Record<string, unknown> = {};
        if (params?.page !== undefined) cleanParams.page = params.page;
        if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
        if (params?.limit !== undefined) cleanParams.limit = params.limit;
        if (params?.ratingFloor !== undefined && params?.ratingFloor !== "") {
            cleanParams.ratingFloor = params.ratingFloor;
        }
        if (params?.eventId) cleanParams.eventId = params.eventId;

        return useFetchData<ReviewsResponse>({
            endpoint: URLS.GET_REVIEWS(user?._id ?? ""),
            name: [
                URLS.GET_REVIEWS(user?._id ?? ""),
                JSON.stringify(cleanParams),
            ],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    const useGetReviewStats = (params?: ReviewStatsQueryParams) => {
        const cleanParams: Record<string, unknown> = {};
        if (params?.ratingFloor !== undefined && params?.ratingFloor !== "") {
            cleanParams.ratingFloor = params.ratingFloor;
        }
        if (params?.eventId) cleanParams.eventId = params.eventId;

        return useFetchData<RatingAnalyticsResponse>({
            endpoint: URLS.GET_REVIEWS_STATS(user?._id ?? ""),
            name: [
                URLS.GET_REVIEWS_STATS(user?._id ?? ""),
                JSON.stringify(cleanParams),
            ],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    const useGetAllEvents = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_ALL_EVENTS,
            name: [URLS.GET_ALL_EVENTS],
        });
    };

    return {
        useGetReviews,
        useGetReviewStats,
        useGetAllEvents,
    };
};

export default useReview;
