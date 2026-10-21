import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";
import { periodSlugAtom } from "../utils/atom/period";

export interface AudienceSegmentMetrics {
    all?: number;
    frequentBuyers?: number;
    highSpenders?: number;
    atRisk?: number;
    localFans?: number;
}

export interface AudienceSegmentParams {
    page?: number;
    limit?: number;
    segment?: string;
    search?: string;
    period?: string;
}

const useAudienceSegment = () => {
    const user = useAtomValue(userAtom);
    const period = useAtomValue(periodSlugAtom);

    const useGetAudienceSegmentMetrics = () => {
        return useFetchData<AudienceSegmentMetrics>({
            endpoint: URLS.GET_AUDIENCE_SEGMENT_METRICS(user?._id ?? ""),
            name: [URLS.GET_AUDIENCE_SEGMENT_METRICS(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetAudienceSegmentCustomer = (params?: AudienceSegmentParams) => {
        const cleanParams: Record<string, unknown> = {
            ...(params ?? {}),
        };

        return useFetchData<any>({
            endpoint: URLS.GET_AUDIENCE_SEGMENT_CUSTOMER(user?._id ?? ""),
            name: [
                URLS.GET_AUDIENCE_SEGMENT_CUSTOMER(user?._id ?? ""),
                JSON.stringify(cleanParams),
            ],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetAudienceSegmentMetrics,
        useGetAudienceSegmentCustomer,
    };
};

export default useAudienceSegment;