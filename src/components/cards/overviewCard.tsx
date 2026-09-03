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
            <div className=" h-40.5 bg-white border border-[#37137F26] rounded-2xl p-5 flex flex-col justify-between w-full " >
                <div className=" w-full flex justify-between " >
                    <div style={{ backgroundColor: props?.color }} className="  w-11 h-11 rounded-2xl flex justify-center items-center " >
                        <props.icon size={16} color="white" />
                    </div>
                    <div className=" h-5.75 px-2 rounded-2xl flex justify-center items-center w-fit bg-[#4CAF5026] text-[10px] text-[#08AF0F] " >
                        +0.00%
                    </div>
                </div>
                <div className=" flex flex-col " >
                    <p className=" text-sm font-semibold " >{props?.title}</p>
                    <p className=" text-[10px] font-semibold text-[#1E1E1EBF] " >{props?.body}</p>
                    <p className=" text-sm font-semibold " >
                        {props.unit === "%"
                            ? `${props.data?.[props.itemKey] ?? 0}${props.unit}`
                            : `${props.unit}${props.data?.[props.itemKey] ?? 0}`}
                    </p>
                </div>
            </div>
        </LoadingLayout>
    )
}