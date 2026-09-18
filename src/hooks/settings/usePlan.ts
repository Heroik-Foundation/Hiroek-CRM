import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IChangePlanPayload, IChangePlanResponse, IPlan, IUserSubscription } from "../../type/plans";
import { URLS } from "../../utils/urls";
import { useFetchData } from "../useFetchData";
import httpService from "../../config/httpService";

const usePlan = () => {
    const queryClient = useQueryClient();

    const useSubscriptionPlan = () => {
        return useFetchData<IPlan[]>({
            endpoint: URLS.GET_PLANS,
            name: [URLS.GET_PLANS]
        });
    };

    const useCurrentPlan = () => {
        return useFetchData<IUserSubscription>({
            endpoint: URLS.GET_CURRENT_PLAN,
            name: [URLS.GET_CURRENT_PLAN]
        });
    };

    const useChangePlan = () => {
        return useMutation({
            mutationFn: async (payload: IChangePlanPayload) => {
                const response = await httpService.post<IChangePlanResponse>(
                    URLS.CHANGE_PLANS,
                    payload
                );
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_CURRENT_PLAN] });
            },
        });
    };

    return {
        useSubscriptionPlan,
        useCurrentPlan,
        useChangePlan,
    };
};

export default usePlan;

