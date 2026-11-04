import { IoChevronDown } from "react-icons/io5";
import { LuArrowRight, LuPencil, LuTrash2 } from "react-icons/lu";
import type { VerifiedSender } from "../types";

interface ChooseOptionViewProps {
    onSelectVerifyEmail: () => void;
    onSelectAuthenticateDomain: () => void;
    hasVerifiedSender?: boolean;
    verifiedSender?: VerifiedSender | null;
    onSkipToComposer?: () => void;
    onEditSender?: () => void;
    onDeleteSender?: () => void;
}

export default function ChooseOptionView({
    onSelectVerifyEmail,
    onSelectAuthenticateDomain,
    hasVerifiedSender,
    verifiedSender,
    onSkipToComposer,
    onEditSender,
    onDeleteSender,
}: ChooseOptionViewProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col items-center">
                {/* Purple Badge with Down Chevron & 3 Dots */}
                <div className="w-12 h-12 rounded-full bg-[#2E0F74] flex flex-col items-center justify-center text-white shadow-md mb-5">
                    <IoChevronDown size={13} className="mb-0.5" />
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-[#2E0F74] text-center mb-6 tracking-tight">
                    Choose the option suitable for you
                </h1>

                {/* Active sender banner if verified */}
                {hasVerifiedSender && verifiedSender && (
                    <div className="w-full bg-[#F3F0FA] rounded-2xl p-3.5 mb-6 border border-purple-100 flex items-center justify-between text-left">
                        <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                Currently Active Sender
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#2E0F74] truncate">
                                {verifiedSender.senderName ? `${verifiedSender.senderName} (${verifiedSender.email})` : verifiedSender.email}
                            </span>
                            {verifiedSender.replyTo && (
                                <span className="text-[10.5px] text-gray-500 truncate">
                                    Reply-to: {verifiedSender.replyTo}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {onEditSender && (
                                <button
                                    type="button"
                                    onClick={onEditSender}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[#2E0F74] text-xs font-semibold cursor-pointer shadow-2xs"
                                >
                                    <LuPencil size={11} />
                                    <span>Edit</span>
                                </button>
                            )}
                            {onDeleteSender && (
                                <button
                                    type="button"
                                    onClick={onDeleteSender}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer shadow-2xs"
                                    title="Delete sending domain"
                                >
                                    <LuTrash2 size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Option 1: Verify an email address */}
                <div
                    onClick={onSelectVerifyEmail}
                    className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-[#F3F0FA]/60 border border-transparent hover:border-purple-100 transition-all cursor-pointer text-left group"
                >
                    <div className="w-9 h-9 rounded-full bg-[#2E0F74] text-white font-bold flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        1
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#2E0F74] transition-colors">
                                Verify an email address.
                            </h3>
                            <LuArrowRight
                                size={16}
                                className="text-gray-700 group-hover:translate-x-1 group-hover:text-[#2E0F74] transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Quick setup using an individual email address
                        </p>
                    </div>
                </div>

                {/* Option 2: Authenticate your business domain */}
                <div
                    onClick={onSelectAuthenticateDomain}
                    className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-[#F3F0FA]/60 border border-transparent hover:border-purple-100 transition-all cursor-pointer text-left group mt-2"
                >
                    <div className="w-9 h-9 rounded-full bg-[#2E0F74] text-white font-bold flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        2
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#2E0F74] transition-colors">
                                Authenticate your business domain
                            </h3>
                            <LuArrowRight
                                size={16}
                                className="text-gray-700 group-hover:translate-x-1 group-hover:text-[#2E0F74] transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Use your own domain for better deliverability and professional branding
                        </p>
                    </div>
                </div>

                {/* Skip to composer if already verified */}
                {hasVerifiedSender && onSkipToComposer && (
                    <button
                        type="button"
                        onClick={onSkipToComposer}
                        className="mt-6 text-xs font-semibold text-gray-500 hover:text-[#2E0F74] transition-colors cursor-pointer"
                    >
                        Skip to Campaign Composer →
                    </button>
                )}
            </div>
        </div>
    );
}
