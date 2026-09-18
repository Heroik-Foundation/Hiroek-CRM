import type { IconType } from "react-icons/lib";
import type { IDashboard } from "../../type/dashboard";
import { LoadingLayout } from "../layout";


export default function OverviewCard(
    props: {
        title: string;
        icon: IconType;
        color: string;
        unit: string;
        body?: string;
        itemKey: keyof IDashboard;
        data: IDashboard;
        isLoading: boolean;
    }
) {
    return (
        <LoadingLayout loading={props.isLoading} >
            <div className=" min-h-36 sm:min-h-40.5 bg-white border border-[#37137F26] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between w-full shadow-2xs hover:shadow-xs transition-shadow " >
                <div className=" w-full flex justify-between items-start gap-2 " >
                    <div style={{ backgroundColor: props?.color }} className=" w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex justify-center items-center shrink-0 " >
                        <props.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className=" h-5 sm:h-5.75 px-1.5 sm:px-2 rounded-full sm:rounded-2xl flex justify-center items-center w-fit bg-[#4CAF5026] text-[9px] sm:text-[10px] font-medium text-[#08AF0F] shrink-0 " >
                        +0.00%
                    </div>
                </div>
                <div className=" flex flex-col mt-2 " >
                    <p className=" text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-1 " title={props?.title} >{props?.title}</p>
                    {props?.body && (
                        <p className=" text-[9px] sm:text-[10px] font-medium text-[#1E1E1EBF] leading-tight mt-0.5 line-clamp-2 " >{props?.body}</p>
                    )}
                    <p className=" text-sm sm:text-base font-bold text-gray-900 mt-1 " >
                        {props.unit === "%"
                            ? `${props.data?.[props.itemKey] ?? 0}${props.unit}`
                            : `${props.unit}${props.data?.[props.itemKey] ?? 0}`}
                    </p>
                </div>
            </div>
        </LoadingLayout>
    )
}