import React from "react";

export interface TicketCardProps {
    title?: string;
    value?: string | number;
    icon?: React.ReactNode;
    iconBg?: string;
    isLoading?: boolean;
}

export default function TicketCard({
    title = "Total Tickets",
    value = "3,600",
    icon,
    iconBg = "#3B82F6",
    isLoading = false,
}: TicketCardProps) {
    return (
        <div className="min-h-36 md:h-40.5 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between w-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="w-full flex justify-between items-start">
                <div
                    style={{ backgroundColor: iconBg }}
                    className="w-11 h-11 rounded-xl flex justify-center items-center text-white shrink-0 shadow-xs"
                >
                    {icon}
                </div>
            </div>
            <div className="flex flex-col mt-4">
                <p className="text-xs font-medium text-gray-500">{title}</p>
                {isLoading ? (
                    <div className="h-6 w-24 bg-gray-100 animate-pulse rounded mt-1" />
                ) : (
                    <p className="text-lg md:text-xl font-bold text-gray-900 tracking-tight mt-1">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                )}
            </div>
        </div>
    );
}
