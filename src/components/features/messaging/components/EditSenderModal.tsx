import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { LuIdCard, LuMail, LuTrash2, LuCheck } from "react-icons/lu";
import { Spinner } from "@heroui/react";
import type { VerifiedSender } from "../types";

interface EditSenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    verifiedSender: VerifiedSender | null;
    currentAccountEmail?: string;
    onUpdateProfile: (payload: { fromName?: string; replyTo?: string; localPart?: string }) => Promise<void>;
    onOpenDeleteModal: () => void;
    isUpdating?: boolean;
}

export default function EditSenderModal({
    isOpen,
    onClose,
    verifiedSender,
    currentAccountEmail = "",
    onUpdateProfile,
    onOpenDeleteModal,
    isUpdating = false,
}: EditSenderModalProps) {
    const [fromName, setFromName] = useState("");
    const [replyTo, setReplyTo] = useState("");
    const [localPart, setLocalPart] = useState("");

    useEffect(() => {
        if (isOpen && verifiedSender) {
            setFromName(verifiedSender.senderName || "");
            setReplyTo(verifiedSender.replyTo || currentAccountEmail || "");
            if (verifiedSender.isBusinessDomain && verifiedSender.email) {
                const lp = verifiedSender.email.split("@")[0] || "";
                setLocalPart(lp);
            }
        }
    }, [isOpen, verifiedSender, currentAccountEmail]);

    if (!isOpen || !verifiedSender) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateProfile({
            fromName: fromName.trim() || undefined,
            replyTo: replyTo.trim().toLowerCase() || currentAccountEmail || undefined,
            localPart: verifiedSender.isBusinessDomain ? localPart.trim().toLowerCase() || undefined : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 text-left">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            Update Sender Details
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Configure your sender name and reply-to address
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUpdating}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-xl hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Current Address Pill */}
                    <div className="p-3 rounded-2xl bg-[#F3F0FA] border border-purple-100 flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                Sending Address
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-[#2E0F74] truncate">
                                {verifiedSender.email}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Verified
                        </span>
                    </div>

                    {/* From Name */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-800">
                                Sender Display Name
                            </label>
                            <span className="text-[10px] text-gray-400">Shown in inbox header</span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                            <LuIdCard size={16} className="text-gray-500 shrink-0" />
                            <input
                                type="text"
                                value={fromName}
                                onChange={(e) => setFromName(e.target.value)}
                                placeholder="e.g. Acme Events"
                                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Reply-to Email */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-800">
                                Reply-to Email
                            </label>
                            <span className="text-[10px] text-gray-400">Where replies are sent</span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                            <LuMail size={16} className="text-gray-500 shrink-0" />
                            <input
                                type="email"
                                value={replyTo}
                                onChange={(e) => setReplyTo(e.target.value)}
                                placeholder={currentAccountEmail || "yourname@domain.com"}
                                className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400">
                            Default: {currentAccountEmail || "your current account email"}
                        </p>
                    </div>

                    {/* Local Part (only if business domain) */}
                    {verifiedSender.isBusinessDomain && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-800">
                                    Mailbox Username (Local Part)
                                </label>
                                <span className="text-[10px] text-gray-400">Before the @</span>
                            </div>
                            <div className="w-full bg-[#EEF2F6] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-gray-500">@</span>
                                <input
                                    type="text"
                                    value={localPart}
                                    onChange={(e) => setLocalPart(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                                    placeholder="tickets"
                                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 select-none">
                                    @{verifiedSender.domain || "domain.com"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenDeleteModal();
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition cursor-pointer py-2 px-1"
                        >
                            <LuTrash2 size={14} />
                            <span>Delete Domain</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUpdating}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="bg-[#2E0F74] hover:bg-[#37137F] disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                            >
                                {isUpdating ? (
                                    <>
                                        <Spinner size="sm" color="current" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <LuCheck size={14} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

