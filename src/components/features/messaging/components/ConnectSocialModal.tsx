import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuLink } from "react-icons/lu";
import type { SocialLinkItem, SocialPlatformId } from "../types";
import {
    SOCIAL_PLATFORMS,
    SOCIAL_PLATFORM_MAP,
    deriveFallbackUsername,
    normalizeSocialUrl,
} from "../../../../utils/socialPlatforms";
import SocialPlatformIcon from "./SocialPlatformIcon";

interface ConnectSocialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: SocialLinkItem) => void;
    initialData?: SocialLinkItem | null;
}

export default function ConnectSocialModal({
    isOpen,
    onClose,
    onSave,
    initialData = null,
}: ConnectSocialModalProps) {
    const [platform, setPlatform] = useState<SocialPlatformId>("instagram");
    const [url, setUrl] = useState("");
    const [username, setUsername] = useState("");
    const [urlError, setUrlError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setPlatform(initialData.platform);
            setUrl(initialData.url);
            setUsername(initialData.username);
        } else {
            setPlatform("instagram");
            setUrl("");
            setUsername("");
        }
        setUrlError("");
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const selectedConfig = SOCIAL_PLATFORM_MAP[platform];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            setUrlError("Please enter an account URL");
            return;
        }

        const normalizedUrl = normalizeSocialUrl(trimmedUrl);
        try {
            const parsed = new URL(normalizedUrl);
            if (!parsed.hostname.includes(".")) {
                setUrlError("Please enter a valid URL (e.g. https://instagram.com/yourbrand)");
                return;
            }
        } catch {
            setUrlError("Please enter a valid URL (e.g. https://instagram.com/yourbrand)");
            return;
        }

        const resolvedUsername =
            username.trim() || deriveFallbackUsername(platform, normalizedUrl);

        onSave({
            id: initialData?.id || `social_${platform}_${Date.now()}`,
            platform,
            url: normalizedUrl,
            username: resolvedUsername,
        });
        onClose();
    };

    const previewLabel = username.trim() || selectedConfig.usernamePlaceholder;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-2xs p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="connect-social-title"
            >
                {/* Modal Header */}
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#F3F0FA] text-[#37137F] flex items-center justify-center shrink-0">
                            <LuLink size={18} />
                        </div>
                        <div className="min-w-0">
                            <h3
                                id="connect-social-title"
                                className="text-base font-bold text-gray-900 leading-tight"
                            >
                                Connect social platform
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                Link an account to display at the bottom of your email
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
                        aria-label="Close modal"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto"
                >
                    {/* Platform Grid */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Platform
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {SOCIAL_PLATFORMS.map((item) => {
                                const isSelected = platform === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            setPlatform(item.id);
                                            if (urlError) setUrlError("");
                                        }}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl transition-all cursor-pointer ${
                                            isSelected
                                                ? "border-2 border-[#37137F] bg-[#F5F2FC] shadow-2xs"
                                                : "border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                                        }`}
                                    >
                                        <SocialPlatformIcon platform={item.id} size={32} />
                                        <span
                                            className={`text-xs font-semibold ${
                                                isSelected ? "text-[#2E0F74]" : "text-gray-800"
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Account URL */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="social-account-url"
                            className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                        >
                            Account URL
                        </label>
                        <input
                            id="social-account-url"
                            type="text"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                if (urlError) setUrlError("");
                            }}
                            placeholder={selectedConfig.urlPlaceholder}
                            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                                urlError
                                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-gray-200 focus:border-[#37137F] focus:ring-2 focus:ring-[#37137F]/15"
                            }`}
                        />
                        {urlError && (
                            <span className="text-[11px] font-medium text-red-500">
                                {urlError}
                            </span>
                        )}
                    </div>

                    {/* Account Username */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="social-account-username"
                            className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                        >
                            Account Username
                        </label>
                        <input
                            id="social-account-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={selectedConfig.usernamePlaceholder}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-2 focus:ring-[#37137F]/15 transition-all"
                        />
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Preview
                        </span>
                        <div className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                            <SocialPlatformIcon platform={platform} size={28} />
                            <span
                                className={`text-xs truncate ${
                                    username.trim()
                                        ? "font-semibold text-gray-900"
                                        : "font-medium text-gray-400"
                                }`}
                            >
                                {previewLabel}
                            </span>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#37137F] hover:bg-[#2E0F74] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                        >
                            {initialData ? "Save changes" : "Connect account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

