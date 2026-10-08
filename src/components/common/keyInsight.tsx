import { Heart } from "iconsax-reactjs";
import { FaArrowTrendUp } from "react-icons/fa6";
import { GrAnnounce } from "react-icons/gr";
import { IoIosPeople } from "react-icons/io";

export default function KeyInsight({
    bg,
    header,
    color,
    icon,
    other,
    body,
    border,
    list,
    donation,
    topDonorName,
    topDonorAmount,
}: {
    bg: string;
    header: string;
    color: string;
    icon: string;
    body?: string;
    other?: boolean;
    border: string;
    list?: Array<{
        title: string;
        body: string;
    }>;
    donation?: boolean;
    topDonorName?: string;
    topDonorAmount?: string | number;
}) {
    return (
        <section
            style={{ backgroundColor: bg, borderColor: border }}
            className=" h-full p-5 rounded-2xl w-full hidden border bg-[#08AF0F0D] gap-4 flex-col "
        >
            <div className=" w-full flex gap-2 ">
                <div
                    style={{ backgroundColor: icon }}
                    className={` w-11 h-11 rounded-xl flex justify-center items-center  `}
                >
                    {(list?.length ?? 0) > 0 ? (
                        <GrAnnounce size={20} color="#fff" />
                    ) : donation ? (
                        <Heart size={20} color="#fff" />
                    ) : (
                        <IoIosPeople size={20} color="#fff" />
                    )}
                </div>
                <div className=" flex flex-col gap-2 flex-1 ">
                    <p
                        style={{ color: header }}
                        className={` font-semibold capitalize  text-[${header}] `}
                    >
                        Insights
                    </p>
                    {body && (
                        <p
                            style={{ color: color }}
                            className={` text-sm text-[${color}] capitalize `}
                        >
                            {body}
                        </p>
                    )}
                    {other && (
                        <div className=" px-3 py-5 rounded-2xl bg-white flex gap-4 ">
                            <FaArrowTrendUp
                                size={16}
                                color={icon}
                                className=" mt-1 "
                            />
                            <p className=" text-sm font-medium capitalize text-[#1E1E1E] ">
                                Consider offering VIP memberships
                            </p>
                        </div>
                    )}
                    {(list?.length ?? 0) > 0 && (
                        <div className=" w-full grid-cols-2 grid gap-4 ">
                            {list?.map((item) => {
                                return (
                                    <div
                                        key={item?.title}
                                        className=" px-3 py-5 flex-col rounded-2xl gap-3 bg-white flex "
                                    >
                                        <div className=" w-full flex gap-2 ">
                                            <div className=" w-fit ">
                                                <FaArrowTrendUp
                                                    size={16}
                                                    color={icon}
                                                    className=" mt-1 "
                                                />
                                            </div>
                                            <div className=" flex flex-col ">
                                                <p className=" text-sm font-bold capitalize text-[#1E1E1E] ">
                                                    {item?.title}
                                                </p>
                                                <p className=" text-sm capitalize text-[#1E1E1E] ">
                                                    {item?.body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {donation && (
                <div className=" w-full flex flex-col gap-3 ">
                    <div className=" px-3 py-5 rounded-2xl bg-white flex flex-col gap-3 ">
                        <p className=" text-sm font-medium capitalize text-[#1E1E1E] ">
                            Most Frequent Donor
                        </p>
                        <p className=" text-sm font-semibold capitalize text-[#1E1E1E] ">
                            {topDonorName ?? "Joba Labs"}
                        </p>
                    </div>
                    <div className=" px-3 py-5 rounded-2xl bg-white flex flex-col gap-3 ">
                        <p className=" text-sm font-medium capitalize text-[#1E1E1E] ">
                            Donated Amount
                        </p>
                        <p className=" text-sm font-semibold capitalize text-[#08AF0F] ">
                            {typeof topDonorAmount === "number"
                                ? `£${topDonorAmount.toLocaleString()}`
                                : topDonorAmount ?? "£36,200"}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
