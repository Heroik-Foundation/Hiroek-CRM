import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";
import { periodSlugAtom } from "../utils/atom/period";

export interface DonationMetrics {
    totalDonors?: number;
    totalDonationsAmount?: number;
    totalDonations?: number;
    averageDonationAmount?: number;
}

export interface DonationTrendItem {
    label?: string;
    donationAmount?: number;
    totalDonations?: number;
    value?: number;
}

export interface DonationFrequencyBucket {
    frequency?: string;
    count?: number;
    percentage?: number;
}

export interface DonationFrequencyData {
    totalDonors?: number;
    buckets?: DonationFrequencyBucket[];
}

const useDonation = () => {
    const user = useAtomValue(userAtom);
    const period = useAtomValue(periodSlugAtom);

    const useGetDonationMetrics = () => {
        return useFetchData<DonationMetrics>({
            endpoint: URLS.GET_DONATION_METRICS(user?._id ?? ""),
            name: [URLS.GET_DONATION_METRICS(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetDonationTrend = () => {
        return useFetchData<DonationTrendItem[]>({
            endpoint: URLS.GET_DONATION_TREND(user?._id ?? ""),
            name: [URLS.GET_DONATION_TREND(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetDonationFrequency = () => {
        return useFetchData<DonationFrequencyData>({
            endpoint: URLS.GET_DONATION_FREQUENCY(user?._id ?? ""),
            name: [URLS.GET_DONATION_FREQUENCY(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetTopDonors = (params?: { page?: number; limit?: number; period?: string }) => {
        const cleanParams: Record<string, unknown> = {
            period,
            ...(params ?? {}),
        };

        return useFetchData<any>({
            endpoint: URLS.GET_TOP_DONORS(user?._id ?? ""),
            name: [URLS.GET_TOP_DONORS(user?._id ?? ""), JSON.stringify(cleanParams)],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    const useGetEventDonations = (params?: { page?: number; limit?: number; period?: string }) => {
        const cleanParams: Record<string, unknown> = {
            period,
            ...(params ?? {}),
        };

        return useFetchData<any>({
            endpoint: URLS.GET_EVENT_DONATIONS(user?._id ?? ""),
            name: [URLS.GET_EVENT_DONATIONS(user?._id ?? ""), JSON.stringify(cleanParams)],
            params: cleanParams,
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetDonationMetrics,
        useGetDonationTrend,
        useGetDonationFrequency,
        useGetTopDonors,
        useGetEventDonations,
    };
};

export default useDonation;
