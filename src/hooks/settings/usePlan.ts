// import { useFormik } from "formik";
import type { IPlan, IUserSubscription } from "../../type/plans";
import { URLS } from "../../utils/urls";
import { useFetchData } from "../useFetchData";

const usePlan = () => {
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

    return {
        useSubscriptionPlan,
        useCurrentPlan,
    };
};

export default usePlan;
