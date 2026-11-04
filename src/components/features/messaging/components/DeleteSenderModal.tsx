import { IoClose } from "react-icons/io5";
import { LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { Spinner } from "@heroui/react";

interface DeleteSenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    domainNameOrAddress: string;
    onConfirmDelete: () => Promise<void>;
    isDeleting?: boolean;
}

export default function DeleteSenderModal({
    isOpen,
    onClose,
    domainNameOrAddress,
    onConfirmDelete,
    isDeleting = false,
}: DeleteSenderModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 flex flex-col gap-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 text-left">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <LuTriangleAlert size={22} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                Delete Sending Domain
                            </h3>
                            <p className="text-xs text-gray-500">
                                Permanent action warning
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Domain Pill */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                            Target Sending Domain
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {domainNameOrAddress || "Current Domain"}
                        </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Will be deleted
                    </span>
                </div>

                {/* Warning Message */}
                <div className="bg-red-50/70 border border-red-200/70 rounded-2xl p-3.5 text-xs text-red-800 flex flex-col gap-1.5 leading-relaxed">
                    <p className="font-bold text-red-900 flex items-center gap-1.5">
                        <span>⚠️</span> Are you sure you want to delete this email domain?
                    </p>
                    <p className="text-red-700">
                        This will remove the domain from your account and clean up its mail delivery infrastructure. Campaign emails will not be sent until you configure a new verified domain or address.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 mt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-xs"
                    >
                        {isDeleting ? (
                            <>
                                <Spinner size="sm" color="current" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <LuTrash2 size={14} />
                                <span>Yes, Delete Domain</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
