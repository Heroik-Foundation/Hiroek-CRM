import type { IOrganizer } from "../type/user";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";

const useCurrentUser = () => {
    
    const useGetUsersData = () => {
        return useFetchData<{
            eventPartner: IOrganizer
        }>({
            endpoint: URLS.GET_USERS_DATA,
            name: [URLS.GET_USERS_DATA],
        });
    };

    return {
        useGetUsersData, 
    };
};

export default useCurrentUser;