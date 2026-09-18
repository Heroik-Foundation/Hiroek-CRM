
import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";

const useTrendingAndPrediction = () => {

    const user = useAtomValue(userAtom)

    const useGetPeakEventTimesData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_PEAK_EVENT_TIMES(user?._id ?? ""),
            name: [URLS.GET_PEAK_EVENT_TIMES(user?._id ?? "")],
            enable: Boolean(user?._id)
        });
    };

    const useGetAttendanceByDateData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_ATTENDANCE_BY_DATE(user?._id ?? ""),
            name: [URLS.GET_ATTENDANCE_BY_DATE(user?._id ?? "")],
            enable: Boolean(user?._id)
        });
    };

    const useGetEventCategoryPopularityData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_EVENT_CATEGORY_POPULARITY(user?._id ?? ""),
            name: [URLS.GET_EVENT_CATEGORY_POPULARITY(user?._id ?? "")],
            enable: Boolean(user?._id)
        });
    };

    const useGetForecastData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_FORCAST(user?._id ?? ""),
            name: [URLS.GET_FORCAST(user?._id ?? "")],
            enable: Boolean(user?._id)
        });
    };


    return {
        useGetPeakEventTimesData,
        useGetAttendanceByDateData,
        useGetEventCategoryPopularityData,
        useGetForecastData,
    };
};

export default useTrendingAndPrediction;