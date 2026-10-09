import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoChevronBack,
    IoSearch,
    IoPlay,
} from "react-icons/io5";
import {
    LuSquareCheck,
    LuAlignLeft,
    LuAlignCenter,
    LuAlignRight,
    LuImage,
    // LuSparkles,
} from "react-icons/lu";
import { FiBold, FiItalic, FiUnderline } from "react-icons/fi";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import useAudienceSegment from "../../hooks/useAudienceSegment";
import useCampaign, { type CampaignChannel } from "../../hooks/useCampaign";
import { toast, Spinner } from "@heroui/react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";

export default function SendMessage() {
    const navigate = useNavigate();
    const currentUser = useAtomValue(userAtom);

    // View state: compose form or recipient picker
    const [currentView, setCurrentView] = useState<"compose" | "recipients">("compose");

    // Form fields
    const [messageType, setMessageType] = useState<"notifications" | "in_app" | "email" | "sms">("notifications");
    const [fromSender, setFromSender] = useState(
        currentUser?.name ? `${currentUser.name} <noreply@hiroek.com>` : "Joba Labs <noreply@hiroek.com>"
    );
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isSendToAll, setIsSendToAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    // const [isAiLoading, setIsAiLoading] = useState(false);

    // Properties panel state
    const [fontFamily, setFontFamily] = useState("Arial");
    const [fontSize, setFontSize] = useState("24px");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");

    const [buttonLabel, setButtonLabel] = useState("RSVP Now");
    const [buttonLink, setButtonLink] = useState("https://hiroek.com/events/rsvp");
    const [buttonAlign, setButtonAlign] = useState<"left" | "center" | "right">("left");

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const rowsPerPage = 10;

    // Campaign creation hook
    const { useCreateCampaign } = useCampaign();
    const createCampaignMutation = useCreateCampaign();

    // Load recipients from audience endpoint
    const { useGetAudienceSegmentCustomer } = useAudienceSegment();
    const { data: audienceData, isLoading: isAudienceLoading } = useGetAudienceSegmentCustomer({
        segment: "all",
        limit: 1000,
    });

    const rawCustomers = useMemo(() => {
        if (!audienceData) return [];
        if (Array.isArray(audienceData)) return audienceData;
        const dObj = audienceData as Record<string, unknown>;
        if (Array.isArray(dObj.data)) return dObj.data;
        if (Array.isArray(dObj.results)) return dObj.results;
        if (Array.isArray(dObj.customers)) return dObj.customers;
        return [];
    }, [audienceData]);

    const allRecipientsList = useMemo(() => {
        if (!Array.isArray(rawCustomers) || rawCustomers.length === 0) return [];
        return rawCustomers.map((item: Record<string, unknown>, idx: number) => {
            const customerId =
                item.customerId ||
                item._id ||
                item.id ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>)._id
                    : null) ||
                `recipient-${idx + 1}`;

            const name =
                item.fullname ||
                item.name ||
                (item.firstName
                    ? `${item.firstName} ${item.lastName || ""}`.trim()
                    : null) ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).fullname
                    : null) ||
                item.username ||
                item.email ||
                "Attendee";

            const email =
                item.email ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).email
                    : "") ||
                "";

            const phone =
                item.phone ||
                item.phoneNumber ||
                item.mobile ||
                item.telephone ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).phone
                    : "") ||
                "-";

            const location =
                item.location ||
                item.city ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).location ||
                    (item.user as Record<string, unknown>).city
                    : null) ||
                "London";

            return {
                id: String(customerId),
                sNo: idx + 1,
                name: String(name),
                username: String(item.username || ""),
                email: String(email),
                phone: String(phone),
                location: String(location),
                rawCustomer: item,
            };
        });
    }, [rawCustomers]);

    const filteredRecipients = useMemo(() => {
        if (!searchQuery.trim()) return allRecipientsList;
        const q = searchQuery.toLowerCase().trim();
        return allRecipientsList.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.username.toLowerCase().includes(q) ||
                r.phone.includes(q) ||
                r.location.toLowerCase().includes(q)
        );
    }, [allRecipientsList, searchQuery]);

    const totalCount = filteredRecipients.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

    const displayedRecipients = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredRecipients.slice(start, start + rowsPerPage);
    }, [filteredRecipients, page]);

    const selectedCount = isSendToAll ? totalCount : selectedIds.size;

    const toggleSelect = (id: string | number) => {
        setIsSendToAll(false);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSendToAllToggle = () => {
        if (isSendToAll) {
            setIsSendToAll(false);
            setSelectedIds(new Set());
        } else {
            setIsSendToAll(true);
            const allIds = new Set<string | number>();
            filteredRecipients.forEach((r) => allIds.add(r.id));
            setSelectedIds(allIds);
        }
    };

    // AI Message Generator
    // const handleWriteWithAI = () => {
    //     setIsAiLoading(true);
    //     setTimeout(() => {
    //         const drafts = [
    //             `Exciting news! We're hosting an exclusive gathering for our top community members next Friday. RSVP below to secure your complimentary VIP ticket before slots fill up!`,
    //             `Hey there! Thank you for being an active part of our community. We have upcoming event announcements that you won't want to miss. Check out the details and reserve your spot today!`,
    //             `Special Invitation: Get early-bird access to our next headline showcase. Limited passes are available for verified attendees—claim yours now with the link below!`,
    //         ];
    //         const randomDraft = drafts[Math.floor(Math.random() * drafts.length)];
    //         setBody(randomDraft);
    //         if (!title) {
    //             setTitle("Exclusive Invitation & Upcoming Event Announcement");
    //         }
    //         setIsAiLoading(false);
    //         toast.success("Draft created with AI!");
    //     }, 600);
    // };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.danger("File size exceeds 5MB limit");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                toast.success("Image attached successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async () => {
        if (!title.trim()) {
            toast.danger("Please enter a message title");
            return;
        }
        if (!body.trim()) {
            toast.danger("Please enter a message body");
            return;
        }
        if (selectedCount === 0) {
            toast.danger("Please select at least one recipient");
            return;
        }

        const channel: CampaignChannel =
            messageType === "notifications"
                ? "notification"
                : messageType === "in_app"
                    ? "in_app"
                    : "email";

        const selectedRecipients = isSendToAll
            ? filteredRecipients
            : filteredRecipients.filter((r) => selectedIds.has(r.id));

        const customerIds: string[] = [];
        // const importedEmails: { email: string; name?: string }[] = [];

        selectedRecipients.forEach((r) => {
            const rawId = (r.rawCustomer?.customerId || r.rawCustomer?._id || r.id) as string;
            if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
                customerIds.push(rawId);
            }
            if (r.email && r.email.includes("@")) {
                // importedEmails.push({
                //     email: r.email.trim(),
                //     name: r.name || undefined,
                // });
            }
        });

        const idempotencyKey = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        try {
            await createCampaignMutation.mutateAsync({
                idempotencyKey,
                channels: [channel],
                recipients: {
                    customerIds: customerIds.length > 0 ? customerIds : undefined,
                    // importedEmails: importedEmails.length > 0 ? importedEmails : undefined,
                },
                title: title.trim(),
                body: body.trim(),
            });

            toast.success(`Message successfully dispatched to ${selectedRecipients.length} recipient(s)!`);
            setTimeout(() => {
                navigate("/dashboard/audience");
            }, 1200);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // Columns for Recipient Table matching Image 1
    const recipientColumns: Column<{
        id: string;
        sNo: number;
        name: string;
        username: string;
        email: string;
        phone: string;
        location: string;
    }>[] = [
            {
                id: "sNo",
                name: "S/No",
                render: (_value, item) => (
                    <span className="w-8 h-8 rounded-full bg-[#F3F0FA] text-[#2E0F74] flex items-center justify-center text-xs font-bold shrink-0">
                        {item.sNo}
                    </span>
                ),
            },
            {
                id: "name",
                name: "User",
                render: (_value, item) => (
                    <span className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                        {item.name}
                    </span>
                ),
            },
            {
                id: "email",
                name: "Email",
                render: (_value, item) => (
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {item.email || "Jimmy.C@Email.Com"}
                    </span>
                ),
            },
            {
                id: "phone",
                name: "Contact Number",
                render: (_value, item) => (
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {item.phone || "+44 701 2539 399 1122"}
                    </span>
                ),
            },
            {
                id: "location",
                name: "Location",
                render: (_value, item) => (
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {item.location}
                    </span>
                ),
            },
            {
                id: "select",
                name: "Select",
                render: (_value, item) => {
                    const checked = isSendToAll || selectedIds.has(item.id);
                    return (
                        <div className="flex items-center justify-center w-full">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelect(item.id)}
                                className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                            />
                        </div>
                    );
                },
            },
        ];

    // ─── RECIPIENTS VIEW (Matches Image 1) ──────────────────────────────────
    if (currentView === "recipients") {
        return (
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                {/* Header matching Image 1 */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentView("compose")}
                            className="w-9 h-9 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center cursor-pointer hover:bg-[#37137F] shadow-xs"
                        >
                            <IoChevronBack size={18} />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Select Recipients
                        </h2>
                    </div>

                    <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
                        {/* Search Users input */}
                        <div className="relative w-full sm:w-64 md:w-72">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
                                <IoSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search Users..."
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74]"
                            />
                        </div>

                        {/* Send To All Button */}
                        <button
                            onClick={handleSendToAllToggle}
                            className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                            <LuSquareCheck size={16} />
                            <span>Send To All</span>
                        </button>

                        {/* Done Button */}
                        <button
                            onClick={() => setCurrentView("compose")}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                            <span>Done ({selectedCount} Recipients Selected)</span>
                        </button>
                    </div>
                </div>

                {/* Table matching Image 1 */}
                <div className="w-full overflow-hidden">
                    <CustomTable
                        columns={recipientColumns}
                        rows={displayedRecipients}
                        rowKey="id"
                        total={totalCount}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={rowsPerPage}
                        isLoading={isAudienceLoading}
                        emptyText="No recipients found"
                        headerClassName="border-b border-gray-100 bg-transparent"
                        thClassName="py-3 px-4 text-xs sm:text-sm font-bold text-gray-900 text-left whitespace-nowrap"
                        customPagination={
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <span className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
                                    Showing {displayedRecipients.length} Of {totalCount || 120} Users
                                </span>

                                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {[1, 2, 3, totalPages > 3 ? totalPages : null]
                                        .filter(Boolean)
                                        .map((p, idx) => {
                                            const pageNum = Number(p);
                                            const isActive = page === pageNum;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${isActive
                                                        ? "bg-[#2E0F74] text-white shadow-xs"
                                                        : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    // ─── COMPOSE VIEW (Matches Image Layout) ────────────────────────────────
    return (
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start pb-8">
            {/* LEFT / CENTER PANEL: Main Form Card */}
            <div className="flex-1 w-full bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                {/* Header Row */}
                <div className="w-full flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        {/* Back Arrow button */}
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/audience")}
                            className="w-9 h-9 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#37137F] transition-colors shadow-xs mt-0.5"
                        >
                            <IoChevronBack size={18} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                Send New Message
                            </h2>
                            <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 leading-relaxed">
                                Send Mass In-App Message,& Email To Attendees About Future And
                                Upcoming Events / Track Responses, Etc.
                            </p>
                        </div>
                    </div>

                    {/* Automate Email / SMS Button */}
                    <button
                        type="button"
                        onClick={() => toast.info("Automated campaigns scheduler enabled!")}
                        className="bg-[#2E0F74] hover:bg-[#37137F] transition-colors text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs whitespace-nowrap shrink-0 hidden sm:block"
                    >
                        Automate Email / SMS
                    </button>
                </div>

                {/* Select Message Type Radio Group */}
                <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-gray-900">
                        Select Message Type
                    </label>
                    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                        {[
                            { id: "notifications", label: "Notifications" },
                            { id: "in_app", label: "In-App Message" },
                            { id: "email", label: "Email" },
                            { id: "sms", label: "SMS" },
                        ].map((item) => {
                            const isChecked = messageType === item.id;
                            return (
                                <label
                                    key={item.id}
                                    onClick={() => setMessageType(item.id as typeof messageType)}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked
                                            ? "border-[#7047EB]"
                                            : "border-purple-300 hover:border-purple-400"
                                            }`}
                                    >
                                        {isChecked && (
                                            <div className="w-2 h-2 rounded-full bg-[#37137F]" />
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
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-900">From</label>
                    <input
                        type="text"
                        value={fromSender}
                        onChange={(e) => setFromSender(e.target.value)}
                        placeholder="Sender name or email..."
                        className="w-full max-w-sm px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74] transition-all"
                    />
                </div>

                {/* Message Title Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-900">
                        Message Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter message title..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74] transition-all"
                    />
                </div>

                {/* Message Body Field with Write with AI */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-900">
                        Message Body
                    </label>
                    <div className="relative w-full">
                        {/* Write with AI action */}
                        {/* <button
                            type="button"
                            onClick={handleWriteWithAI}
                            disabled={isAiLoading}
                            className="absolute top-3.5 right-4 z-10 flex items-center gap-1.5 text-xs font-bold text-[#2E0F74] hover:text-[#7047EB] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <LuSparkles size={14} className="text-[#2E0F74]" />
                            <span>{isAiLoading ? "Writing..." : "Write with AI"}</span>
                        </button> */}

                        <textarea
                            rows={7}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type your message body here..."
                            style={{
                                fontFamily: fontFamily,
                                fontSize: fontSize === "24px" ? "13px" : fontSize,
                                fontWeight: isBold ? "bold" : "normal",
                                fontStyle: isItalic ? "italic" : "normal",
                                textDecoration: isUnderline ? "underline" : "none",
                                textAlign: textAlign,
                            }}
                            className="w-full px-4 pt-4 pb-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2E0F74] focus:ring-1 focus:ring-[#2E0F74] transition-all resize-y min-h-40"
                        />
                    </div>
                </div>

                {/* Select Recipients Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-900">
                        Select Recipients
                    </label>
                    <div
                        onClick={() => setCurrentView("recipients")}
                        className="w-full px-5 py-3.5 bg-white border border-gray-200 hover:border-[#2E0F74] transition-colors rounded-xl flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                        <span className="text-xs font-bold text-gray-800">
                            {selectedCount} Recipients Selected
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#2E0F74] group-hover:bg-[#37137F] text-white flex items-center justify-center transition-colors shadow-2xs">
                            <IoPlay size={12} className="ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Send Message Button */}
                <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={createCampaignMutation.isPending}
                    className="w-full py-3.5 bg-[#2E0F74] hover:bg-[#37137F] transition-colors rounded-xl text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {createCampaignMutation.isPending ? (
                        <>
                            <Spinner size="sm" color="current" />
                            <span>Sending Message...</span>
                        </>
                    ) : (
                        "Send Message"
                    )}
                </button>
            </div>

            {/* RIGHT PANEL: Properties Inspector Card */}
            <div className="w-full lg:w-80 xl:w-88 shrink-0 bg-white rounded-2xl md:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                    Properties
                </h3>

                {/* Section 1: TEXT */}
                <div className="flex flex-col gap-3 pb-5 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-[#7047EB] tracking-wider uppercase">
                        TEXT
                    </span>

                    {/* Fonts type */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-gray-500">
                            Fonts type
                        </label>
                        <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2E0F74] transition-all cursor-pointer"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                    </div>

                    {/* Font styles row: B I U, Size, Alignment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between pt-1">
                        {/* B I U buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setIsBold(!isBold)}
                                className={`w-7 h-7 rounded-lg border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${isBold
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <FiBold size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsItalic(!isItalic)}
                                className={`w-7 h-7 rounded-lg border text-xs italic flex items-center justify-center transition-colors cursor-pointer ${isItalic
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <FiItalic size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsUnderline(!isUnderline)}
                                className={`w-7 h-7 rounded-lg border text-xs underline flex items-center justify-center transition-colors cursor-pointer ${isUnderline
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <FiUnderline size={13} />
                            </button>
                        </div>

                        {/* Size dropdown */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-gray-400">
                                Size
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
                            >
                                <option value="12px">12px</option>
                                <option value="14px">14px</option>
                                <option value="16px">16px</option>
                                <option value="18px">18px</option>
                                <option value="20px">20px</option>
                                <option value="24px">24px</option>
                                <option value="32px">32px</option>
                            </select>
                        </div>

                        {/* Alignment buttons */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-medium text-gray-400">
                                Alignment
                            </label>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setTextAlign("left")}
                                    className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${textAlign === "left"
                                        ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <LuAlignLeft size={13} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTextAlign("center")}
                                    className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${textAlign === "center"
                                        ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <LuAlignCenter size={13} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTextAlign("right")}
                                    className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${textAlign === "right"
                                        ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <LuAlignRight size={13} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: BUTTON */}
                <div className="flex flex-col gap-3 pb-5 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-[#7047EB] tracking-wider uppercase">
                        BUTTON
                    </span>

                    {/* Button Label */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-gray-500">
                            Button Label
                        </label>
                        <input
                            type="text"
                            value={buttonLabel}
                            onChange={(e) => setButtonLabel(e.target.value)}
                            placeholder="RSVP Now"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2E0F74] transition-all"
                        />
                    </div>

                    {/* Button Link */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-gray-500">
                            Button Link
                        </label>
                        <input
                            type="text"
                            value={buttonLink}
                            onChange={(e) => setButtonLink(e.target.value)}
                            placeholder="https://hiroek.com/events/rsvp"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2E0F74] transition-all"
                        />
                    </div>

                    {/* Button Alignment */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-gray-500">
                            Button Alignment
                        </label>
                        <div className="flex items-center gap-1.5 w-full">
                            <button
                                type="button"
                                onClick={() => setButtonAlign("left")}
                                className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${buttonAlign === "left"
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <LuAlignLeft size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setButtonAlign("center")}
                                className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${buttonAlign === "center"
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <LuAlignCenter size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setButtonAlign("right")}
                                className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${buttonAlign === "right"
                                    ? "bg-[#2E0F74] text-white border-[#2E0F74]"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <LuAlignRight size={13} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 3: IMAGE */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-[#7047EB] tracking-wider uppercase">
                        IMAGE
                    </span>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/png, image/jpeg, image/svg+xml"
                        className="hidden"
                    />

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#D1D5DB] hover:border-[#2E0F74] rounded-2xl p-6 bg-[#F8FAFC] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                    >
                        {uploadedImage ? (
                            <div className="relative w-full flex flex-col items-center">
                                <img
                                    src={uploadedImage}
                                    alt="Attached"
                                    className="max-h-28 object-contain rounded-lg"
                                />
                                <span className="text-[10px] text-green-600 font-bold mt-2">
                                    Image attached (Click to change)
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-gray-400 group-hover:text-[#2E0F74] transition-colors">
                                    <LuImage size={20} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                                    Drag & drop or click to upload image
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium text-center">
                                    SVG, PNG, or JPG (5MB Max)
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
