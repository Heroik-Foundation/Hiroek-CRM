
import { useAtomValue } from "jotai";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import { userAtom } from "../utils/atom/user";

const useSpending = () => {

    const user = useAtomValue(userAtom)

    const useGetSpendingData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_SPENDING(user?._id ?? ""),
            name: [URLS.GET_SPENDING(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    const useGetTicketSpendDistributionData = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_TICKET_SPEND_DISTRIBUTION(user?._id ?? ""),
            name: [URLS.GET_TICKET_SPEND_DISTRIBUTION(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };


    return {
        useGetSpendingData,
        useGetTicketSpendDistributionData,
    };
};

export default useSpending;