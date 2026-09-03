import usePlan from "../../../hooks/settings/usePlan";
import { Header } from "../../common";
import { BiChevronLeft } from "react-icons/bi";
import { LoadingLayout } from "../../layout"; 
import { formatNumber } from "../../../config/numberFormat";
import { useNavigate } from "react-router-dom";

export default function SelectPlan() {

    const navigate = useNavigate()
    const { useSubscriptionPlan } = usePlan(); 
    const { data, isLoading } = useSubscriptionPlan(); 

    return (
        <LoadingLayout loading={isLoading} length={data?.length}>
            <section className=" flex-1 rounded-2xl p-5 bg-white flex flex-col gap-6 ">
                <div className=" flex items-center gap-3 ">
                    <button onClick={() => navigate(-1)} type="button" className=" w-11 h-11 bg-[#37137F] text-white rounded-lg flex justify-center items-center ">
                        <BiChevronLeft size={25} />
                    </button>
                    <Header
                        title="Subscription Plans"
                        body="Buy and upgrade your plan for a better experience"
                    />
                </div>
                <div className=" w-auto flex overflow-x-auto gap-3 ">
                    {data?.map((item, index) => {
                        return (
                            <div className=" w-fit flex gap-3 " >
                                {item?.price?.map((subitem) => {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                background:
                                                    index === 1
                                                        ? "linear-gradient(180deg, #F0276C 0%, #8A163E 100%)"
                                                        : "linear-gradient(180deg, #3D2188 0%, #23086D 100%)",
                                            }}
                                            className=" w-110 text-white rounded-3xl p-5 flex flex-col gap-8 "
                                        >
                                            <p className=" text-2xl capitalize font-semibold ">
                                                {item?.name}
                                            </p>
                                            <div className=" border-b border-white py-4 ">
                                                <p className=" text-sm font-semibold capitalize ">
                                                    {formatNumber(subitem?.basePrice/100)}{"/"}{subitem?.billingInterval+"ly"}
                                                </p>
                                            </div>
                                            <p className=" text-sm font-semibold ">
                                                Plan Features:
                                            </p>
                                            <ul className=" list-decimal text-sm px-5 flex flex-col gap-1 ">
                                                {item?.features?.map(
                                                    (subitem, subindex) => {
                                                        return (
                                                            <li key={subindex}>
                                                                {subitem}
                                                            </li>
                                                        );
                                                    },
                                                )}
                                            </ul>
                                            <button
                                                disabled
                                                className=" w-full h-12 mt-auto rounded-2xl font-semibold text-xs bg-white text-[#37137F]  "
                                            >
                                                Current Plan
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </section>
        </LoadingLayout>
    );
}
