import { LuCheck, LuSend, LuMail, LuCircleCheck, LuZap, LuArrowRight, LuPencil, LuTrash2, LuCornerDownLeft } from "react-icons/lu";

interface ReadyToSendViewProps {
    senderName: string;
    senderEmail: string;
    replyTo?: string;
    emailBalanceFormatted: string;
    onCreateCampaign: () => void;
    onEditSender?: () => void;
    onDeleteSender?: () => void;
}

export default function ReadyToSendView({
    senderName,
    senderEmail,
    replyTo,
    emailBalanceFormatted,
    onCreateCampaign,
    onEditSender,
    onDeleteSender,
}: ReadyToSendViewProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8">
            {/* Page Title */}
            <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B]">
                    Email Configuration
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                    Configure your email to enable you send emails
                </p>
            </div>

            {/* Center Card */}
            <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                {/* Green badge with checkmark */}
                <div className="w-12 h-12 rounded-2xl bg-[#16A34A] flex items-center justify-center text-white shadow-xs mb-4">
                    <LuCheck size={24} strokeWidth={3} />
                </div>

                <h2 className="text-xl font-bold text-[#2E0F74]">
                    You're ready to send
                </h2>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-sm">
                    Your email domain configuration, and sending infrastructure are fully verified and optimized for maximum deliverability.
                </p>

                {/* Details Box */}
                <div className="w-full bg-[#F0EFF8] rounded-2xl p-4 mt-5 flex flex-col gap-3 text-left">
                    {/* Row 1: Sending from */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7047EB] shrink-0 shadow-2xs">
                                <LuSend size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-500">Sending from</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                    {senderName || "Hiroek Events"}
                                </span>
                            </div>
                        </div>
                        <span className="bg-white text-[#7047EB] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-100 shadow-2xs">
                            Verified
                        </span>
                    </div>

                    {/* Row 2: Sender Address */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7047EB] shrink-0 shadow-2xs">
                                <LuMail size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-500">Sender Address</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                    {senderEmail || "hello@hiroek.io"}
                                </span>
                            </div>
                        </div>
                        <LuCircleCheck size={16} className="text-emerald-500" />
                    </div>

                    {/* Row 3: Reply-to Address */}
                    {replyTo && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7047EB] shrink-0 shadow-2xs">
                                    <LuCornerDownLeft size={14} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-medium text-gray-500">Replies routed to</span>
                                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                                        {replyTo}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400">
                                Reply-to
                            </span>
                        </div>
                    )}

                    {/* Row 4: Email Credits */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7047EB] shrink-0 shadow-2xs">
                                <LuZap size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-gray-500">Email Credits</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                    {emailBalanceFormatted} free emails available
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                            Active
                        </span>
                    </div>
                </div>

                {/* Create Campaign button */}
                <button
                    type="button"
                    onClick={onCreateCampaign}
                    className="w-full bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer shadow-xs text-xs sm:text-sm"
                >
                    <span>Create Campaign</span>
                    <LuArrowRight size={15} />
                </button>

                {/* Auxiliary Edit & Delete domain triggers */}
                <div className="w-full flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                    {onEditSender && (
                        <button
                            type="button"
                            onClick={onEditSender}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#2E0F74] transition cursor-pointer"
                        >
                            <LuPencil size={13} />
                            <span>Edit Sender Details</span>
                        </button>
                    )}

                    {onDeleteSender && (
                        <button
                            type="button"
                            onClick={onDeleteSender}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition cursor-pointer ml-auto"
                        >
                            <LuTrash2 size={13} />
                            <span>Delete Domain</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
