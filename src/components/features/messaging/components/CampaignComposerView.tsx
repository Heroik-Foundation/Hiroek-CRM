import { IoPlay, IoClose } from "react-icons/io5";
import { LuCheck, LuMail, LuCircleCheck, LuMonitor, LuSmartphone, LuPencil, LuTrash2 } from "react-icons/lu";
import { Spinner } from "@heroui/react";
import RichTextEditor from "../../../ui/richTextEditor";
import { buildFullEmailHtml } from "../../../../utils/emailTemplate";
import { convertHtmlToStyledText } from "../../../../utils/styledText";
import type { VerifiedSender } from "../types";

interface CampaignComposerViewProps {
    verifiedSender: VerifiedSender | null;
    onConfigureSender: () => void;
    onEditSender?: () => void;
    onDeleteSender?: () => void;
    messageType: "notifications" | "in_app" | "email";
    onMessageTypeChange: (type: "notifications" | "in_app" | "email") => void;
    fromSender: string;
    title: string;
    onTitleChange: (val: string) => void;
    body: string;
    onBodyChange: (val: string) => void;
    bodyMode: "edit" | "preview";
    onBodyModeChange: (mode: "edit" | "preview") => void;
    previewDevice: "desktop" | "mobile";
    onPreviewDeviceChange: (device: "desktop" | "mobile") => void;
    uploadedImage: string | null;
    isUploadingImage?: boolean;
    onRemoveImage: () => void;
    isBodyImageDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileInputClick: () => void;
    selectedCount: number;
    onOpenRecipients: () => void;
    onSendMessage: () => void;
    isSending: boolean;
    campaignSupportsHtml: boolean;
}

export default function CampaignComposerView({
    verifiedSender,
    onConfigureSender,
    messageType,
    onMessageTypeChange,
    fromSender,
    title,
    onTitleChange,
    body,
    onBodyChange,
    bodyMode,
    onBodyModeChange,
    previewDevice,
    onPreviewDeviceChange,
    uploadedImage,
    isUploadingImage = false,
    onRemoveImage,
    isBodyImageDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileInputClick,
    selectedCount,
    onOpenRecipients,
    onSendMessage,
    isSending,
    campaignSupportsHtml,
    onEditSender,
    onDeleteSender,
}: CampaignComposerViewProps) {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 items-start pb-8">
            {/* Main Form Card */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                {/* Header Row */}
                <div className="w-full flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            Send New Message
                        </h2>
                        <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 leading-relaxed">
                            Send Mass In-App Message & Email To Attendees About Future And Upcoming Events.
                        </p>
                    </div>

                    {/* Email Verification Status / Config button */}
                    {verifiedSender?.verified ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={onEditSender || onConfigureSender}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F0FA] hover:bg-[#EBE5F7] text-[#2E0F74] transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
                                title="Click to edit sender display name & reply-to address"
                            >
                                <LuCircleCheck size={13} className="text-emerald-600" />
                                <span className="max-w-32 sm:max-w-xs truncate text-[11px] sm:text-xs">
                                    {verifiedSender.email}
                                </span>
                                <LuPencil size={11} className="text-gray-500 ml-0.5" />
                            </button>

                            {onDeleteSender && (
                                <button
                                    type="button"
                                    onClick={onDeleteSender}
                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer text-xs shadow-2xs"
                                    title="Delete sending domain"
                                >
                                    <LuTrash2 size={13} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={onConfigureSender}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F0FA] hover:bg-[#EBE5F7] text-[#2E0F74] transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
                        >
                            <LuMail size={13} />
                            <span className="text-xs">Configure Sender</span>
                        </button>
                    )}
                </div>

                {/* Select Message Type Radio Group */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-900">
                        Select Message Type
                    </label>
                    <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                        {[
                            { id: "notifications", label: "Notifications" },
                            { id: "in_app", label: "In-App Message" },
                            { id: "email", label: "Email" },
                        ].map((item) => {
                            const isChecked = messageType === item.id;
                            return (
                                <label
                                    key={item.id}
                                    onClick={() => onMessageTypeChange(item.id as typeof messageType)}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                >
                                    <div
                                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked
                                                ? "border-[#7047EB]"
                                                : "border-purple-300 hover:border-purple-400"
                                            }`}
                                    >
                                        {isChecked && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#37137F]" />
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800">
                                        {item.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* From Field */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between max-w-sm">
                        <label className="text-xs font-bold text-gray-900">From</label>
                        <button
                            type="button"
                            onClick={onConfigureSender}
                            className="text-[10px] sm:text-[11px] font-semibold text-[#7047EB] hover:underline cursor-pointer"
                        >
                            {verifiedSender?.verified ? "Change Sender Details" : "Verify Email"}
                        </button>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={fromSender}
                            readOnly
                            placeholder="Sender name or email..."
                            className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                        {verifiedSender?.verified && (
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold border border-emerald-100 flex items-center gap-1 shadow-2xs select-none">
                                <LuCheck size={9} strokeWidth={3} />
                                <span>Verified</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Message Title Field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-900">
                        Message Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Enter message title..."
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74] transition-all"
                    />
                </div>

                {/* Message Body Field with WYSIWYG Editor & Live Preview */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <label className="text-xs font-bold text-gray-900">
                                Message Body
                            </label>
                            {!uploadedImage && !isUploadingImage && (
                                <button
                                    type="button"
                                    onClick={onFileInputClick}
                                    className="text-[11px] font-semibold text-[#7047EB] hover:text-[#2E0F74] transition-colors cursor-pointer"
                                >
                                    + Add Banner Image
                                </button>
                            )}
                            {isUploadingImage && (
                                <span className="text-[11px] font-medium text-[#7047EB] flex items-center gap-1.5">
                                    <Spinner size="sm" color="current" />
                                    <span>Uploading image...</span>
                                </span>
                            )}
                        </div>

                        {/* Mode Switcher Tabs */}
                        <div className="flex items-center bg-[#F3F0FA] p-1 rounded-xl gap-1">
                            <button
                                type="button"
                                onClick={() => onBodyModeChange("edit")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bodyMode === "edit"
                                        ? "bg-[#2E0F74] text-white shadow-2xs"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => onBodyModeChange("preview")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bodyMode === "preview"
                                        ? "bg-[#2E0F74] text-white shadow-2xs"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Live Preview
                            </button>
                        </div>
                    </div>

                    {/* Mode 1: EDIT MODE */}
                    {bodyMode === "edit" ? (
                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`w-full rounded-2xl transition-all relative ${isBodyImageDragging
                                    ? "ring-2 ring-[#7047EB] bg-purple-50/30"
                                    : ""
                                }`}
                        >
                            {/* Attached Banner Chip or Uploading State */}
                            {isUploadingImage ? (
                                <div className="mb-2.5 p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between gap-3 animate-pulse">
                                    <div className="flex items-center gap-2.5 min-w-0 text-[#7047EB]">
                                        <Spinner size="sm" color="current" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-800">
                                                Uploading banner image...
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                Uploading image to server CDN (PNG, JPG, GIF, WebP up to 5MB)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : uploadedImage ? (
                                <div className="mb-2.5 p-2 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={uploadedImage}
                                            alt="Banner preview"
                                            className="w-10 h-8 object-cover rounded-lg shrink-0 border border-purple-200"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-gray-800 truncate">
                                                Banner Attached
                                            </span>
                                            <span className="text-[10px] text-gray-500 truncate">
                                                Single banner image will appear at the top of your email
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onRemoveImage}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-white cursor-pointer"
                                        title="Remove banner"
                                    >
                                        <IoClose size={15} />
                                    </button>
                                </div>
                            ) : null}

                            {/* Tiptap WYSIWYG Editor */}
                            <RichTextEditor
                                value={body}
                                onChange={onBodyChange}
                                placeholder="Write your message here... Use bold, colors, headings, bullet lists, or alignment to format."
                                minHeight="200px"
                            />

                            {/* Drop overlay */}
                            {isBodyImageDragging && (
                                <div className="absolute inset-0 bg-[#2E0F74]/10 border-2 border-dashed border-[#7047EB] rounded-2xl flex flex-col items-center justify-center pointer-events-none z-30 backdrop-blur-2xs">
                                    <span className="text-xs font-bold text-[#2E0F74]">
                                        Drop image here to attach as email banner
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Mode 2: PREVIEW MODE */
                        <div className="w-full flex flex-col gap-3">
                            <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2">
                                <span className="text-[11px] font-semibold text-gray-600">
                                    Device Preview
                                </span>
                                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onPreviewDeviceChange("desktop")}
                                        className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${previewDevice === "desktop"
                                                ? "bg-[#2E0F74] text-white"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <LuMonitor size={12} />
                                        <span>Desktop</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onPreviewDeviceChange("mobile")}
                                        className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${previewDevice === "mobile"
                                                ? "bg-[#2E0F74] text-white"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <LuSmartphone size={12} />
                                        <span>Mobile</span>
                                    </button>
                                </div>
                            </div>

                            {/* Client Window Mockup */}
                            <div
                                className={`mx-auto w-full transition-all duration-300 ${previewDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
                                    }`}
                            >
                                <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                    {/* Email Header */}
                                    <div className="bg-[#FAF8FE] border-b border-gray-100 p-3 sm:p-4 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[#7047EB] uppercase tracking-wider">
                                                {messageType === "email" ? "Email Client" : "In-App Notification"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">Just now</span>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                            {title.trim() || "(No subject)"}
                                        </h3>
                                        <div className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-1 truncate">
                                            <span className="font-semibold text-gray-700">From:</span>
                                            <span>{fromSender}</span>
                                        </div>
                                    </div>

                                    {/* Email Body Area */}
                                    <div className="p-4 sm:p-6 flex flex-col">
                                        {uploadedImage && (
                                            <div className="w-full mb-4 rounded-xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={uploadedImage}
                                                    alt="Message banner"
                                                    className="w-full max-h-56 object-cover object-center"
                                                />
                                            </div>
                                        )}

                                        {body.trim() && body !== "<p></p>" && body !== "<p><br></p>" ? (
                                            campaignSupportsHtml && (messageType === "email" || messageType === "in_app") ? (
                                                <div
                                                    className="w-full select-text break-words text-xs sm:text-sm"
                                                    dangerouslySetInnerHTML={{
                                                        __html: buildFullEmailHtml(body),
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full text-xs sm:text-sm text-gray-800 leading-relaxed select-text break-words whitespace-pre-wrap font-sans">
                                                    {convertHtmlToStyledText(body)}
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-gray-400 italic text-xs py-6 text-center">
                                                Empty message body — switch to Edit mode to compose your message.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Select Recipients Field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-900">
                        Select Recipients
                    </label>
                    <div
                        onClick={onOpenRecipients}
                        className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-[#2E0F74] transition-colors rounded-xl flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                        <span className="text-xs font-bold text-gray-800">
                            {selectedCount} Recipients Selected
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[#2E0F74] group-hover:bg-[#37137F] text-white flex items-center justify-center transition-colors shadow-2xs">
                            <IoPlay size={10} className="ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Send Message Button */}
                <button
                    type="button"
                    onClick={onSendMessage}
                    disabled={isSending || isUploadingImage}
                    className="w-full py-3 bg-[#2E0F74] hover:bg-[#37137F] transition-colors rounded-xl text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                    {isSending ? (
                        <>
                            <Spinner size="sm" color="current" />
                            <span>Sending Message...</span>
                        </>
                    ) : isUploadingImage ? (
                        <>
                            <Spinner size="sm" color="current" />
                            <span>Uploading Image...</span>
                        </>
                    ) : (
                        "Send Message"
                    )}
                </button>
            </div>
        </div>
    );
}
