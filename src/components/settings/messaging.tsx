import { useState, useMemo } from "react";
import { IoSearch, IoChevronForward, IoChevronBack } from "react-icons/io5";
import { LuSquareCheck } from "react-icons/lu";
import CustomTable from "../ui/customTable";
import type { Column } from "../../type/table";
import useRoles, { getMemberUserId } from "../../hooks/settings/useRoles";
import useCampaign, { type CampaignChannel } from "../../hooks/useCampaign";
import { toast, Spinner } from "@heroui/react";
import type { ITeamMember } from "../../type/user";

export default function Messaging() {
    const [currentView, setCurrentView] = useState<"compose" | "recipients">("compose");
    const [messageType, setMessageType] = useState<"notifications" | "in_app" | "email">("email");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isSendToAll, setIsSendToAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [sendSuccess, setSendSuccess] = useState(false);

    const rowsPerPage = 10;

    // Campaign mutation
    const { useCreateCampaign } = useCampaign();
    const createCampaignMutation = useCreateCampaign();

    // 🌐 Load team members from GET /api/event-partners/account-management/get-members/{eventPartnerId}
    const { useGetUsersRoles } = useRoles();
    const { data: teamData, isLoading } = useGetUsersRoles();

    const rawMembers: ITeamMember[] = useMemo(() => {
        return (
            teamData?.data ||
            (teamData as any)?.results ||
            (Array.isArray(teamData) ? teamData : [])
        );
    }, [teamData]);

    const allMembersList = useMemo(() => {
        if (!Array.isArray(rawMembers) || rawMembers.length === 0) return [];
        return rawMembers.map((m: any, idx: number) => {
            const uObj = typeof m.user === "object" ? m.user : null;
            const id = getMemberUserId(m) || m._id || m.id || `member-${idx + 1}`;
            const name =
                m.fullname ||
                uObj?.fullname ||
                (uObj as any)?.name ||
                (uObj as any)?.username ||
                "Team Member";
            const email = m.email || uObj?.email || "";
            const phone = (m as any)?.phone || (uObj as any)?.phone || "-";
            const role = m.role || "member";
            const status = m.status || "active";

            return {
                id,
                sNo: idx + 1,
                name,
                email,
                phone,
                role,
                status,
                rawMember: m,
            };
        });
    }, [rawMembers]);

    // Search filter across team members
    const filteredRecipients = useMemo(() => {
        if (!searchQuery.trim()) return allMembersList;
        const q = searchQuery.toLowerCase().trim();
        return allMembersList.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.role.toLowerCase().includes(q) ||
                r.phone.includes(q)
        );
    }, [allMembersList, searchQuery]);

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

        // Map UI message type to CampaignChannel enum
        const channel: CampaignChannel =
            messageType === "notifications"
                ? "notification"
                : messageType === "in_app"
                ? "in_app"
                : "email";

        // Build recipients from selected team members
        const selectedRecipients = isSendToAll
            ? filteredRecipients
            : filteredRecipients.filter((r) => selectedIds.has(r.id));

        // When sending via email, check that selected recipients have an email address
        const recipientsWithEmail = selectedRecipients.filter(
            (r) => r.email && r.email.trim() && r.email.includes("@")
        );

        if (channel === "email" && recipientsWithEmail.length === 0) {
            toast.danger("The selected team member(s) do not have a valid email address");
            return;
        }

        const customerIds: string[] = [];
        const importedEmails: { email: string; name?: string }[] = [];

        selectedRecipients.forEach((r) => {
            const strId = String(r.id);
            if (/^[0-9a-fA-F]{24}$/.test(strId)) {
                customerIds.push(strId);
            }
            if (r.email && r.email.includes("@")) {
                importedEmails.push({
                    email: r.email.trim(),
                    name: r.name || undefined,
                });
            }
        });

        const idempotencyKey = `campaign_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        try {
            await createCampaignMutation.mutateAsync({
                idempotencyKey,
                channels: [channel],
                recipients: {
                    customerIds: customerIds.length > 0 ? customerIds : undefined,
                    importedEmails:
                        importedEmails.length > 0 ? importedEmails : undefined,
                },
                title: title.trim(),
                body: body.trim(),
            });

            toast.success(
                `Email dispatched to ${selectedRecipients.length} team member(s)!`
            );
            setSendSuccess(true);
            setTimeout(() => setSendSuccess(false), 4000);
            setTitle("");
            setBody("");
            setSelectedIds(new Set());
            setIsSendToAll(false);
            if (currentView === "recipients") {
                setCurrentView("compose");
            }
        } catch (err) {
            console.error("Failed to send message to team members:", err);
        }
    };

    const columns: Column<any>[] = [
        {
            id: "sNo",
            name: "S/No",
            render: (_value, item) => (
                <span className="w-8 h-8 rounded-full bg-[#F3F0FA] text-[#37137F] flex items-center justify-center text-xs font-bold shrink-0">
                    {item.sNo}
                </span>
            ),
        },
        {
            id: "name",
            name: "Member",
            render: (_value, item) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#37137F15] text-[#37137F] font-bold text-xs flex items-center justify-center shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {item.name}
                    </span>
                </div>
            ),
        },
        {
            id: "email",
            name: "Email Address",
            render: (_value, item) => (
                <span className="text-sm text-gray-700 whitespace-nowrap">
                    {item.email || (
                        <span className="text-gray-400 italic text-xs">No email</span>
                    )}
                </span>
            ),
        },
        {
            id: "role",
            name: "Role",
            render: (_value, item) => (
                <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#37137F] border border-purple-100">
                    {item.role}
                </span>
            ),
        },
        {
            id: "phone",
            name: "Contact Number",
            render: (_value, item) => (
                <span className="text-sm text-gray-700 whitespace-nowrap">
                    {item.phone || "-"}
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
                            className="w-4 h-4 rounded text-[#37137F] accent-[#37137F] border-gray-300 cursor-pointer"
                        />
                    </div>
                );
            },
        },
    ];

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
                    className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                            ? "bg-[#37137F] text-white shadow-xs"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                    }`}
                >
                    {p}
                </button>
            );
        });
    };

    // ─── VIEW 2: SELECT RECIPIENTS ──────────────────────────────────────────
    if (currentView === "recipients") {
        return (
            <div className="w-full bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 flex flex-col gap-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                {/* Header & Actions */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentView("compose")}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <IoChevronBack size={16} />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                            Select Recipients
                        </h2>
                    </div>

                    <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5 sm:gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-60">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-base">
                                <IoSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search Team Members..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all"
                            />
                        </div>

                        {/* Send To All Button */}
                        <button
                            onClick={handleSendToAllToggle}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                                isSendToAll
                                    ? "bg-[#250d56] text-white ring-2 ring-[#37137F]"
                                    : "bg-[#37137F] hover:bg-[#2e0f6c] text-white"
                            }`}
                        >
                            <LuSquareCheck size={15} />
                            <span>Send To All</span>
                        </button>

                        {/* Done Button */}
                        <button
                            onClick={() => setCurrentView("compose")}
                            className="bg-[#16A34A] hover:bg-[#15803D] transition-colors rounded-xl px-4 py-2.5 font-semibold text-white text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <span>Done ({selectedCount} Recipients Selected)</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-hidden">
                    <CustomTable<any>
                        columns={columns}
                        rows={displayedRecipients}
                        rowKey="id"
                        total={totalCount}
                        page={page}
                        onPageChange={setPage}
                        rowsPerPage={rowsPerPage}
                        isLoading={isLoading}
                        emptyText="No team members found"
                        headerClassName="border-b border-gray-100 bg-transparent"
                        thClassName="py-3 px-4 text-xs sm:text-sm font-bold text-gray-900 text-left whitespace-nowrap"
                        customPagination={
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <span className="text-xs sm:text-sm text-gray-500 font-medium order-2 sm:order-1">
                                    Showing {displayedRecipients.length} Of {totalCount} Team Members
                                </span>

                                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {renderPaginationItems()}

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="border border-gray-200 rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

    // ─── VIEW 1: COMPOSE NEW MESSAGE ─────────────────────────────────────────
    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl p-5 sm:p-7 flex flex-col gap-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* Header with Mobile Back Button */}
            <div className="flex items-start gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="sm:hidden w-9 h-9 rounded-xl bg-[#37137F] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs mt-0.5"
                >
                    <IoChevronBack size={18} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                        Send New Message
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                        Send Mass Notifications, In-App Messages Or Email.
                    </p>
                </div>
            </div>

            {/* Select Message Type Radio Group */}
            <div className="flex flex-col gap-2.5">
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                    Select Message Type
                </p>
                <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                    {[
                        { id: "email", label: "Email" },
                        { id: "notifications", label: "Notifications" },
                        { id: "in_app", label: "In-App Message" },
                    ].map((type) => {
                        const isChecked = messageType === type.id;
                        return (
                            <label
                                key={type.id}
                                onClick={() => setMessageType(type.id as any)}
                                className="flex items-center gap-2.5 cursor-pointer select-none"
                            >
                                <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isChecked ? "border-[#37137F]" : "border-purple-300"
                                    }`}
                                >
                                    {isChecked && (
                                        <div className="w-2 h-2 rounded-full bg-[#37137F]" />
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-800">
                                    {type.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Message Title Input */}
            <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-bold text-gray-900">
                    Message Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter email subject or message title..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all"
                />
            </div>

            {/* Message Body Textarea */}
            <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-bold text-gray-900">
                    Message Body
                </label>
                <textarea
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#37137F] focus:ring-1 focus:ring-[#37137F] transition-all resize-y min-h-36 sm:min-h-44"
                />
            </div>

            {/* Select Recipients Field */}
            <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-bold text-gray-900">
                    Select Recipients
                </label>
                <div
                    onClick={() => setCurrentView("recipients")}
                    className="w-full h-14 sm:h-16 px-4 sm:px-5 bg-white border border-gray-200 hover:border-[#37137F] transition-colors rounded-xl flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        {selectedCount} Recipients Selected
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#37137F] group-hover:bg-[#2c0e66] transition-colors text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <IoChevronForward size={16} />
                    </div>
                </div>
            </div>

            {/* Success feedback */}
            {sendSuccess && (
                <div className="w-full p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold text-center">
                    Message sent successfully!
                </div>
            )}

            {/* Send Message Button */}
            <button
                onClick={handleSendMessage}
                disabled={createCampaignMutation.isPending}
                className="w-full py-3.5 sm:py-4 bg-[#37137F] hover:bg-[#2c0e66] transition-colors rounded-xl text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    );
}
