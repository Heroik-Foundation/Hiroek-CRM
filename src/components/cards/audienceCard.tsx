import { IoIosPeople } from "react-icons/io";

export interface AudienceCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    iconColor?: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function AudienceCard({
    title,
    value,
    subtitle,
    iconColor = "#37137F",
    isSelected = false,
    onClick,
}: AudienceCardProps) {
    return (
        <div
            onClick={onClick}
            className={`h-40.5 bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between w-full cursor-pointer transition-all duration-200 select-none ${
                isSelected
                    ? "border-2 border-[#37137F] shadow-sm ring-1 ring-[#37137F1A]"
                    : "border border-[#37137F26] hover:border-[#37137F66]"
            }`}
        >
            <div className="w-full flex justify-between items-start">
                <div
                    className="w-11 h-11 rounded-2xl flex justify-center items-center text-white"
                    style={{ backgroundColor: iconColor }}
                >
                    <IoIosPeople size={24} />
                </div>
            </div>
            <div className="flex flex-col mt-2">
                <p className="text-xs font-medium text-gray-700">{title}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                <p className="text-[#1E1E1E80] text-xs font-semibold mt-1 min-h-4">
                    {subtitle ?? ""}
                </p>
            </div>
        </div>
    );
}