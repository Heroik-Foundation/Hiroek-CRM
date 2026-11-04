import { IoChevronBack } from "react-icons/io5";
import { LuIdCard, LuMail, LuCornerDownLeft, LuSend } from "react-icons/lu";
import { Spinner } from "@heroui/react";

interface VerifyEmailViewProps {
    fromName: string;
    onFromNameChange: (val: string) => void;
    emailPrefix: string;
    onEmailPrefixChange: (val: string) => void;
    confirmEmailPrefix: string;
    onConfirmEmailPrefixChange: (val: string) => void;
    replyTo: string;
    onReplyToChange: (val: string) => void;
    onApprove: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export default function VerifyEmailView({
    fromName,
    onFromNameChange,
    emailPrefix,
    onEmailPrefixChange,
    confirmEmailPrefix,
    onConfirmEmailPrefixChange,
    replyTo,
    onReplyToChange,
    onApprove,
    onBack,
    isLoading = false,
}: VerifyEmailViewProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col text-left">
                {/* Back button */}
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2E0F74] transition-colors cursor-pointer mb-5 w-fit"
                >
                    <IoChevronBack size={13} />
                    <span>Back to options</span>
                </button>

                {/* Title & Subtitle */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Verify Your Email Address
                </h1>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-lg">
                    Configure your sender details to ensure high deliverability for all event notifications and attendee communications.
                </p>

                {/* Form fields */}
                <div className="flex flex-col gap-4 mt-6">
                    {/* From name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-800">
                            From name
                        </label>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-3 flex items-center gap-2.5">
                            <LuIdCard size={16} className="text-gray-500 shrink-0" />
                            <input
                                type="text"
                                value={fromName}
                                onChange={(e) => onFromNameChange(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Email address */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-800">
                            Email address
                        </label>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                            <LuMail size={16} className="text-gray-500 shrink-0" />
                            <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-2xs focus-within:border-[#2E0F74] flex items-center">
                                <input
                                    type="text"
                                    value={emailPrefix}
                                    onChange={(e) =>
                                        onEmailPrefixChange(
                                            e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "")
                                        )
                                    }
                                    placeholder=""
                                    className="w-32 sm:w-44 bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 select-none">
                                .mail.hiroek.io
                            </span>
                        </div>
                    </div>

                    {/* Confirm email address */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-800">
                            Confirm email address
                        </label>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                            <LuCornerDownLeft size={16} className="text-gray-500 shrink-0" />
                            <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-2xs focus-within:border-[#2E0F74] flex items-center">
                                <input
                                    type="text"
                                    value={confirmEmailPrefix}
                                    onChange={(e) =>
                                        onConfirmEmailPrefixChange(
                                            e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "")
                                        )
                                    }
                                    placeholder=""
                                    className="w-32 sm:w-44 bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 select-none">
                                .mail.hiroek.io
                            </span>
                        </div>
                    </div>

                    {/* Reply-to email */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-800">
                                Reply-to email
                            </label>
                            <span className="text-[10.5px] text-gray-400 font-normal">
                                Where replies are sent
                            </span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-3 flex items-center gap-2.5">
                            <LuMail size={16} className="text-gray-500 shrink-0" />
                            <input
                                type="email"
                                value={replyTo}
                                onChange={(e) => onReplyToChange(e.target.value)}
                                placeholder="e.g. yourname@domain.com"
                                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400">
                            Defaults to your account email. Recipient replies will be routed here.
                        </p>
                    </div>

                    {/* Approve Button */}
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={onApprove}
                            disabled={isLoading}
                            className="bg-[#2E0F74] hover:bg-[#37137F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" color="current" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Approve</span>
                                    <LuSend size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

