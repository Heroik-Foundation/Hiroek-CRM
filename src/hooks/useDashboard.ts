
import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";
import { periodSlugAtom } from "../utils/atom/period";
import type { IDashboard } from "../type/dashboard";

const useDashboard = () => {
    const user = useAtomValue(userAtom);
    const period = useAtomValue(periodSlugAtom);

    const useGetAcquisitionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_ACQUISITION_CHANNEL(user?._id ?? ""),
            name: [URLS.GET_ACQUISITION_CHANNEL(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetAudienceData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_AUDIENCE_BY_LOCATION(user?._id ?? ""),
            name: [URLS.GET_AUDIENCE_BY_LOCATION(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetConversionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_CONVERSION_FUNNEL(user?._id ?? ""),
            name: [URLS.GET_CONVERSION_FUNNEL(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetCustomerAgeData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_CUSTOMER_AGE_DISTRIBUTION(user?._id ?? ""),
            name: [URLS.GET_CUSTOMER_AGE_DISTRIBUTION(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetGenderSplitData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_GENDER_SPLIT(user?._id ?? ""),
            name: [URLS.GET_GENDER_SPLIT(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    const useGetDashboardData = () => {
        return useFetchData<IDashboard>({
            endpoint: URLS.GET_DASHBOARD_DATA(user?._id ?? ""),
            name: [URLS.GET_DASHBOARD_DATA(user?._id ?? "")],
            params: { period },
            enable: Boolean(user?._id),
        });
    };

    return {
        useGetAcquisitionData,
        useGetGenderSplitData,
        useGetAudienceData,
        useGetConversionData,
        useGetCustomerAgeData,
        useGetDashboardData
    };
};

export default useDashboard;