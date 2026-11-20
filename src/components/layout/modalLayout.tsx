import { type ReactNode, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface ModalLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export default function ModalLayout({
    isOpen,
    onClose,
    title,
    children,
    className = "",
}: ModalLayoutProps) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className={`w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-6 sm:p-7 flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto ${className}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
                        aria-label="Close modal"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
