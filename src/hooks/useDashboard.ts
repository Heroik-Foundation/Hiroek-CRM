
import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";
import type { IDashboard } from "../type/dashboard";

const useDashboard = () => {

    const user = useAtomValue(userAtom)

    const useGetAcquisitionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_ACQUISITION_CHANNEL(user?._id ?? ""),
            name: [URLS.GET_ACQUISITION_CHANNEL(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetAudienceData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_AUDIENCE_BY_LOCATION(user?._id ?? ""),
            name: [URLS.GET_AUDIENCE_BY_LOCATION(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetConversionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_CONVERSION_FUNNEL(user?._id ?? ""),
            name: [URLS.GET_CONVERSION_FUNNEL(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetCustomerAgeData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_CUSTOMER_AGE_DISTRIBUTION(user?._id ?? ""),
            name: [URLS.GET_CUSTOMER_AGE_DISTRIBUTION(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetGenderSplitData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_GENDER_SPLIT(user?._id ?? ""),
            name: [URLS.GET_GENDER_SPLIT(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetDashboardData = () => {
        return useFetchData<IDashboard>({
            endpoint: URLS.GET_DASHBOARD_DATA(user?._id ?? ""),
            name: [URLS.GET_DASHBOARD_DATA(user?._id ?? "")],
            enable: user?._id ? true : false
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