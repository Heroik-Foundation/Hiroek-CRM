import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoChevronBack,
    IoSearch,
    IoPlay,
    IoClose,
} from "react-icons/io5";
import {
    LuSquareCheck,
    LuLink,
    LuChevronDown,
    LuChevronUp,
    LuImage,
    LuMonitor,
    LuSmartphone,
} from "react-icons/lu";
import CustomTable from "../../components/ui/customTable";
import type { Column } from "../../type/table";
import useAudienceSegment from "../../hooks/useAudienceSegment";
import useCampaign, { type CampaignChannel } from "../../hooks/useCampaign";
import { toast, Spinner } from "@heroui/react";
import RichTextEditor from "../../components/ui/richTextEditor";
import { convertHtmlToStyledText } from "../../utils/styledText";
import { buildFullEmailHtml } from "../../utils/emailTemplate";

// Turn on (VITE_CAMPAIGN_SUPPORTS_HTML=true) once the backend renders `body` as HTML instead of escaping it.
const CAMPAIGN_SUPPORTS_HTML = import.meta.env.VITE_CAMPAIGN_SUPPORTS_HTML === "true";

interface RecipientItem {
    id: string;
    sNo: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    location: string;
    rawCustomer: Record<string, unknown>;
}

export default function SendMessage() {
    const navigate = useNavigate();
    // const currentUser = useAtomValue(userAtom);

    // View state: compose form or recipient picker
    const [currentView, setCurrentView] = useState<"compose" | "recipients">("compose");

    // Form fields
    const [messageType, setMessageType] = useState<"notifications" | "in_app" | "email">("email");
    const [fromSender, setFromSender] = useState(
        "Editor"
    );
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedRecipientsMap, setSelectedRecipientsMap] = useState<Map<string, RecipientItem>>(new Map());
    const [isSendToAll, setIsSendToAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Optional Call-to-Action Button state
    const [showActionButton, setShowActionButton] = useState(false);
    const [buttonLabel, setButtonLabel] = useState("RSVP Now");
    const [buttonLink, setButtonLink] = useState("https://hiroek.com/events/rsvp");
    const [buttonAlign, setButtonAlign] = useState<"left" | "center" | "right">("left");

    // Image & Preview state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isBodyImageDragging, setIsBodyImageDragging] = useState(false);
    const [bodyMode, setBodyMode] = useState<"edit" | "preview">("edit");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Campaign creation hook
    const { useCreateCampaign } = useCampaign();
    const createCampaignMutation = useCreateCampaign();

    // Process image file
    const processImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.danger("Please select an image file (PNG, JPG, SVG, WebP)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.danger("File size exceeds 5MB limit");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target?.result as string);
            toast.success("Image attached to message!");
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
        e.target.value = "";
    };

    const handleBodyDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsBodyImageDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    // Debounce search query to avoid refetching on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 whenever debounced search query changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Load recipients from audience endpoint using API pagination and search
    const { useGetAudienceSegmentCustomer } = useAudienceSegment();
    const { data: audienceData, isLoading: isAudienceLoading } = useGetAudienceSegmentCustomer({
        segment: "all",
        page,
        limit: rowsPerPage,
        search: debouncedSearch.trim() || undefined,
    });

    // Also fetch full audience customers list to reliably target all recipients when "Send To All" is active
    const { data: allAudienceData } = useGetAudienceSegmentCustomer({
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
        if (Array.isArray(dObj.items)) return dObj.items;
        return [];
    }, [audienceData]);

    const allCustomers = useMemo(() => {
        if (!allAudienceData) return [];
        if (Array.isArray(allAudienceData)) return allAudienceData;
        const dObj = allAudienceData as Record<string, unknown>;
        if (Array.isArray(dObj.data)) return dObj.data;
        if (Array.isArray(dObj.results)) return dObj.results;
        if (Array.isArray(dObj.customers)) return dObj.customers;
        if (Array.isArray(dObj.items)) return dObj.items;
        return [];
    }, [allAudienceData]);

    const totalCount = useMemo(() => {
        if (!audienceData) return 0;
        const dObj = audienceData as Record<string, any>;
        return (
            dObj.total ??
            dObj.pagination?.total ??
            dObj.pagination?.totalItems ??
            dObj.totalCount ??
            dObj.count ??
            (Array.isArray(rawCustomers) ? rawCustomers.length : 0)
        );
    }, [audienceData, rawCustomers]);

    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

    const displayedRecipients: RecipientItem[] = useMemo(() => {
        if (!Array.isArray(rawCustomers) || rawCustomers.length === 0) return [];
        return rawCustomers.map((item: Record<string, unknown>, idx: number) => {
            const customerId =
                item.customerId ||
                item._id ||
                item.id ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>)._id
                    : null) ||
                `recipient-${(page - 1) * rowsPerPage + idx + 1}`;

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
                sNo: (page - 1) * rowsPerPage + idx + 1,
                name: String(name),
                username: String(item.username || ""),
                email: String(email),
                phone: String(phone),
                location: String(location),
                rawCustomer: item,
            };
        });
    }, [rawCustomers, page, rowsPerPage]);

    const selectedCount = isSendToAll ? totalCount : selectedRecipientsMap.size;

    const toggleSelect = (item: RecipientItem) => {
        if (isSendToAll) {
            setIsSendToAll(false);
            const next = new Map<string, RecipientItem>();
            displayedRecipients.forEach((r) => {
                if (r.id !== item.id) {
                    next.set(r.id, r);
                }
            });
            setSelectedRecipientsMap(next);
            return;
        }

        setSelectedRecipientsMap((prev) => {
            const next = new Map(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.set(item.id, item);
            }
            return next;
        });
    };

    const handleSendToAllToggle = () => {
        if (isSendToAll) {
            setIsSendToAll(false);
            setSelectedRecipientsMap(new Map());
        } else {
            setIsSendToAll(true);
            setSelectedRecipientsMap(new Map());
        }
    };

    const handleSendMessage = async () => {
        if (!title.trim()) {
            toast.danger("Please enter a message title");
            return;
        }
        const isBodyEmpty = !body.trim() || body === "<p></p>" || body === "<p><br></p>";
        if (isBodyEmpty) {
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

        // Collect targeted recipients list
        const targetList = isSendToAll
            ? (allCustomers.length > 0 ? allCustomers : rawCustomers)
            : Array.from(selectedRecipientsMap.values()).map((r) => r.rawCustomer || r);

        const customerIds: string[] = [];
        const importedEmails: { email: string; name?: string }[] = [];

        targetList.forEach((item: Record<string, unknown>) => {
            const rawId =
                item.customerId ||
                item._id ||
                item.id ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>)._id
                    : null);

            const strId = String(rawId || "").trim();

            const email = String(
                item.email ||
                (typeof item.user === "object" && item.user !== null
                    ? (item.user as Record<string, unknown>).email
                    : "") ||
                ""
            ).trim();

            const name = String(
                item.fullname ||
                item.name ||
                item.username ||
                ""
            ).trim();

            // Check if ID is a valid 24-character hexadecimal Mongo ObjectId
            if (/^[0-9a-fA-F]{24}$/.test(strId)) {
                if (!customerIds.includes(strId)) {
                    customerIds.push(strId);
                }
            } else if (email && email.includes("@")) {
                if (!importedEmails.some((ie) => ie.email.toLowerCase() === email.toLowerCase())) {
                    importedEmails.push({
                        email,
                        name: name && name !== "Attendee" ? name : undefined,
                    });
                }
            }
        });

        // Recipients payload strictly adheres to CampaignRecipientPayload schema
        const recipientsPayload: { customerIds?: string[]; importedEmails?: { email: string; name?: string }[] } = {};
        if (customerIds.length > 0) {
            recipientsPayload.customerIds = customerIds;
        }
        if (importedEmails.length > 0) {
            recipientsPayload.importedEmails = importedEmails;
        }

        if (customerIds.length === 0 && importedEmails.length === 0) {
            toast.danger("The selected recipient(s) do not have a valid customer ID or email address");
            return;
        }

        const ctaButton =
            showActionButton && buttonLabel.trim()
                ? { label: buttonLabel.trim(), link: buttonLink.trim(), align: buttonAlign }
                : null;

        // HTML mode: exact editor styling. Otherwise plain text with Unicode styling (backend escapes HTML).
        const useHtml = CAMPAIGN_SUPPORTS_HTML && channel === "email";
        const finalBody = useHtml
            ? buildFullEmailHtml(body.trim(), { bannerImage: uploadedImage, actionButton: ctaButton })
            : convertHtmlToStyledText(body.trim(), {
                  actionButton: ctaButton,
              });

        const idempotencyKey = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        try {
            await createCampaignMutation.mutateAsync({
                idempotencyKey,
                channels: [channel],
                recipients: recipientsPayload,
                title: title.trim(),
                body: finalBody,
                ...(useHtml ? { isHtml: true } : {}),
            });

            toast.success(
                `Message successfully dispatched to ${isSendToAll ? totalCount : targetList.length} recipient(s)!`
            );
            setTimeout(() => {
                navigate("/dashboard/audience");
            }, 1200);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // Columns for Recipient Table matching design
    const recipientColumns: Column<RecipientItem>[] = [
        {
            id: "select",
            name: "Select",
            render: (_value, item) => {
                const checked = isSendToAll || selectedRecipientsMap.has(item.id);
                return (
                    <div className="flex items-center justify-center w-full">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item)}
                            className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                        />
                    </div>
                );
            },
        },
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
    ];

    // Pagination numbers builder
    const renderPaginationItems = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (page < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return pages.map((p, idx) => {
            if (typeof p === "string") {
                return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-xs">
                        ...
                    </span>
                );
            }
            const isActive = p === page;
            return (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isActive
                        ? "bg-[#2E0F74] text-white shadow-xs"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                        }`}
                >
                    {p}
                </button>
            );
        });
    };

    // ─── RECIPIENTS VIEW ────────────────────────────────────────────────────
    if (currentView === "recipients") {
        return (
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                {/* Header */}
                <div className="w-full flex flex-col gap-4">
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

                    <div className="w-full sm:w-auto flex ml-auto items-center gap-2.5 sm:gap-3">
                        {/* Search Users input */}
                        <div className="relative w-full sm:w-64 md:w-72">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
                                <IoSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Users..."
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2E0F74]"
                            />
                        </div>

                        {/* Send To All Button */}
                        <button
                            onClick={handleSendToAllToggle}
                            className="bg-[#2E0F74] hover:bg-[#37137F] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                            <LuSquareCheck size={16} />
                            <span>{isSendToAll ? "Deselect All" : "Send To All"}</span>
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

                {/* Table */}
                <div className="w-full overflow-hidden">
                    <CustomTable<RecipientItem>
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
                                    Showing {displayedRecipients.length} Of {totalCount} Users
                                </span>

                                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Previous
                                    </button>

                                    {renderPaginationItems()}

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

    // ─── COMPOSE VIEW (WYSIWYG Editor Layout) ──────────────────────────────
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 items-start pb-8">
            {/* Hidden File Input for Banner Image */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                className="hidden"
            />

            {/* Main Form Card */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                {/* Header Row */}
                <div className="w-full flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        {/* Back Arrow button */}
                        {/* <button
                            type="button"
                            onClick={() => navigate("/dashboard/audience")}
                            className="w-9 h-9 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#37137F] transition-colors shadow-xs mt-0.5"
                        >
                            <IoChevronBack size={18} />
                        </button> */}
                        <div className="flex flex-col">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                Send New Message
                            </h2>
                            <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 leading-relaxed">
                                Send Mass In-App Message & Email To Attendees About Future And
                                Upcoming Events.
                            </p>
                        </div>
                    </div>

                    {/* Automate Email / SMS Button */}
                    {/* <button
                        type="button"
                        onClick={() => toast.info("Automated campaigns scheduler enabled!")}
                        className="bg-[#2E0F74] hover:bg-[#37137F] transition-colors text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs whitespace-nowrap shrink-0 hidden sm:block"
                    >
                        Automate Email / SMS
                    </button> */}
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
                        disabled
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

                {/* Message Body Field with WYSIWYG Editor & Live Preview */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-900">
                                Message Body
                            </label>
                            {uploadedImage ? (
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#2E0F74] text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                                    <LuImage size={11} />
                                    <span>Banner Attached</span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-[#7047EB] hover:text-[#2E0F74] transition-colors cursor-pointer"
                                >
                                    <LuImage size={12} />
                                    <span>+ Add Banner Image</span>
                                </button>
                            )}
                            {showActionButton && buttonLabel.trim() && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                                    CTA: {buttonLabel}
                                </span>
                            )}
                        </div>

                        {/* Edit / Preview Segmented Control */}
                        <div className="flex items-center p-0.5 bg-gray-100 rounded-lg text-[11px] font-semibold">
                            <button
                                type="button"
                                onClick={() => setBodyMode("edit")}
                                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                                    bodyMode === "edit"
                                        ? "bg-white text-gray-900 shadow-2xs font-bold"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => setBodyMode("preview")}
                                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                                    bodyMode === "preview"
                                        ? "bg-white text-gray-900 shadow-2xs font-bold"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Live Preview
                            </button>
                        </div>
                    </div>

                    {/* Editor / Preview Area */}
                    {bodyMode === "edit" ? (
                        <div className="flex flex-col gap-3">
                            {/* Banner Image Card if attached */}
                            {uploadedImage && (
                                <div className="relative w-full rounded-xl overflow-hidden border border-purple-200 bg-purple-50/30 group">
                                    <div className="w-full h-40 sm:h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={uploadedImage}
                                            alt="Message banner"
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                                        Email Banner (Displayed at top)
                                    </div>
                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-2.5 py-1 bg-black/65 hover:bg-black/85 text-white rounded-lg text-[11px] font-medium backdrop-blur-xs transition-colors cursor-pointer"
                                        >
                                            Change
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadedImage(null);
                                                toast.info("Banner removed");
                                            }}
                                            className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                                            title="Remove image"
                                        >
                                            <IoClose size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TipTap Rich Text Editor */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsBodyImageDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setIsBodyImageDragging(false);
                                }}
                                onDrop={handleBodyDrop}
                                className={`w-full transition-all ${
                                    isBodyImageDragging ? "ring-2 ring-[#2E0F74] rounded-xl" : ""
                                }`}
                            >
                                <RichTextEditor
                                    value={body}
                                    onChange={setBody}
                                    placeholder="Write your email content here... Use the toolbar above to style headings, text colors, highlights, lists, quotes, and links."
                                    minHeight="220px"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Authentic Email Client Live Preview */
                        <div className="w-full flex flex-col gap-3">
                            {/* Device & Mode Toolbar */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        Exact Outgoing Email Preview
                                    </span>
                                </div>
                                <div className="flex items-center p-0.5 bg-gray-100 rounded-lg text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice("desktop")}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                            previewDevice === "desktop"
                                                ? "bg-white text-gray-900 shadow-2xs font-bold"
                                                : "text-gray-500 hover:text-gray-900"
                                        }`}
                                        title="Desktop View (600px)"
                                    >
                                        <LuMonitor size={13} />
                                        <span>Desktop</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice("mobile")}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                            previewDevice === "mobile"
                                                ? "bg-white text-gray-900 shadow-2xs font-bold"
                                                : "text-gray-500 hover:text-gray-900"
                                        }`}
                                        title="Mobile View (375px)"
                                    >
                                        <LuSmartphone size={13} />
                                        <span>Mobile</span>
                                    </button>
                                </div>
                            </div>

                            {/* Email Client Wrapper */}
                            <div className="w-full bg-[#F3F4F6] border border-gray-200 rounded-2xl p-3 sm:p-6 flex justify-center items-start overflow-x-auto min-h-[360px]">
                                <div
                                    className={`w-full bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden transition-all duration-200 flex flex-col ${
                                        previewDevice === "mobile" ? "max-w-[375px]" : "max-w-[620px]"
                                    }`}
                                >
                                    {/* Email Header Simulation */}
                                    <div className="bg-[#FAF9FD] border-b border-gray-100 p-4 sm:p-5 flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#2E0F74] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                                    {fromSender.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xs font-bold text-gray-900">
                                                            {fromSender}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-normal">
                                                            &lt;noreply@hiroek.com&gt;
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">
                                                        To: {selectedCount > 0 ? `${selectedCount} Recipient(s)` : "Selected Attendees"}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Just now
                                            </span>
                                        </div>

                                        {/* Subject Line */}
                                        <div className="pt-2 border-t border-gray-100 flex items-baseline gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                                                Subject:
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 break-words">
                                                {title.trim() ? (
                                                    title
                                                ) : (
                                                    <span className="text-gray-300 italic font-normal">
                                                        (No subject specified)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email Body Area */}
                                    <div className="p-5 sm:p-8 flex flex-col">
                                        {/* Banner Image Preview */}
                                        {uploadedImage && (
                                            <div className="w-full mb-6 rounded-xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={uploadedImage}
                                                    alt="Message banner"
                                                    className="w-full max-h-72 object-cover object-center"
                                                />
                                            </div>
                                        )}

                                        {/* Exact text that will be sent (no HTML) */}
                                        {body.trim() && body !== "<p></p>" && body !== "<p><br></p>" ? (
                                            CAMPAIGN_SUPPORTS_HTML && messageType === "email" ? (
                                                <div
                                                    className="w-full select-text break-words"
                                                    dangerouslySetInnerHTML={{
                                                        __html: buildFullEmailHtml(body, {
                                                            actionButton: showActionButton && buttonLabel.trim()
                                                                ? { label: buttonLabel.trim(), link: buttonLink.trim(), align: buttonAlign }
                                                                : null,
                                                        }),
                                                    }}
                                                />
                                            ) : (
                                            <div className="w-full text-xs sm:text-sm text-gray-800 leading-relaxed select-text break-words whitespace-pre-wrap font-sans">
                                                {convertHtmlToStyledText(body, {
                                                    actionButton:
                                                        showActionButton && buttonLabel.trim()
                                                            ? { label: buttonLabel.trim(), link: buttonLink.trim() }
                                                            : null,
                                                })}
                                            </div>
                                            )
                                        ) : (
                                            <div className="text-gray-400 italic text-xs py-8 text-center">
                                                Empty message body — switch to Edit mode to compose your message.
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Footer */}
                                    <div className="bg-[#FAF9FD] border-t border-gray-100 px-5 py-3 text-center">
                                        <span className="text-[10px] text-gray-400">
                                            Sent via Hiroek CRM Campaign Manager
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional Call to Action Button Toggle / Configuration */}
                <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                    <button
                        type="button"
                        onClick={() => setShowActionButton(!showActionButton)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-gray-100/60 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={showActionButton}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setShowActionButton(e.target.checked);
                                }}
                                className="w-4 h-4 rounded text-[#2E0F74] accent-[#2E0F74] border-gray-300 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900">
                                    Include Call-to-Action Button
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    Add an RSVP or external event link button at the bottom of the message
                                </span>
                            </div>
                        </div>
                        <div className="text-gray-400">
                            {showActionButton ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                        </div>
                    </button>

                    {showActionButton && (
                        <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-700">
                                        Button Label
                                    </label>
                                    <input
                                        type="text"
                                        value={buttonLabel}
                                        onChange={(e) => setButtonLabel(e.target.value)}
                                        placeholder="e.g. RSVP Now"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2E0F74]"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-700">
                                        Button Link URL
                                    </label>
                                    <div className="relative">
                                        <LuLink size={13} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={buttonLink}
                                            onChange={(e) => setButtonLink(e.target.value)}
                                            placeholder="https://hiroek.com/events/rsvp"
                                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2E0F74]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="text-[11px] font-semibold text-gray-700">
                                    Alignment:
                                </label>
                                <div className="flex items-center gap-1.5">
                                    {(["left", "center", "right"] as const).map((align) => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => setButtonAlign(align)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer transition-colors ${buttonAlign === align
                                                ? "bg-[#2E0F74] text-white shadow-2xs"
                                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
        </div>
    );
}
