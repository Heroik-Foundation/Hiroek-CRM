import type { IOrganizer, IMembershipApiResponse } from "../type/user";
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

    /** 🔹 GET /api/event-partners/me/membership: Fetch signed-in member role, permissions, and account */
    const useGetMembershipData = () => {
        return useFetchData<IMembershipApiResponse>({
            endpoint: URLS.GET_MEMBERSHIP,
            name: [URLS.GET_MEMBERSHIP],
        });
    };

    return {
        useGetUsersData,
        useGetMembershipData,
    };
};

export default useCurrentUser;