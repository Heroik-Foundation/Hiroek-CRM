import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";

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
}

const useAudienceSegment = () => {
    const user = useAtomValue(userAtom);

    const useGetAudienceSegmentMetrics = () => {
        return useFetchData<AudienceSegmentMetrics>({
            endpoint: URLS.GET_AUDIENCE_SEGMENT_METRICS(user?._id ?? ""),
            name: [URLS.GET_AUDIENCE_SEGMENT_METRICS(user?._id ?? "")],
            enable: Boolean(user?._id),
        });
    };

    const useGetAudienceSegmentCustomer = (params?: AudienceSegmentParams) => {
        return useFetchData<any>({
            endpoint: URLS.GET_AUDIENCE_SEGMENT_CUSTOMER(user?._id ?? ""),
            name: [
                URLS.GET_AUDIENCE_SEGMENT_CUSTOMER(user?._id ?? ""),
                JSON.stringify(params ?? {}),
            ],
            params: params as Record<string, unknown>,
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetAudienceSegmentMetrics,
        useGetAudienceSegmentCustomer,
    };
};

export default useAudienceSegment;