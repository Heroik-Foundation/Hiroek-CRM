import { FaArrowTrendUp } from "react-icons/fa6";

export interface RevenueCardProps {
    title: string;
    value: string | number;
    icon?: any;
    bg?: string;
}

export default function RevenueCard({
    title,
    value,
    icon: Icon,
    bg = "linear-gradient(180deg, #45B949 0%, #156518 100%)",
}: RevenueCardProps) {
    return (
        <div
            style={{ background: bg }}
            className="h-40.5 text-white rounded-2xl p-5 flex flex-col justify-between w-full shadow-sm"
        >
            <div className="w-full flex justify-between items-start">
                <div className="w-11 h-11 bg-[#FFFFFF33] rounded-xl flex justify-center items-center text-white">
                    {Icon ? <Icon size={22} /> : null}
                </div>

                <div className="flex justify-center items-center w-fit text-white/80">
                    <FaArrowTrendUp size={16} />
                </div>
            </div>
            <div className="flex flex-col mt-2">
                <p className="text-xs font-medium text-white/90">{title}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}
