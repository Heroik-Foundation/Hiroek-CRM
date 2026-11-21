import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoSearch } from "react-icons/io5";
import { LuSquareCheck, LuFileSpreadsheet, LuCloudUpload, LuUsers } from "react-icons/lu";
import CustomTable from "../../../ui/customTable";
import type { Column } from "../../../../type/table";
import type { RecipientItem, RecipientFilterType } from "../types";

interface RecipientsPickerViewProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    isSendToAll: boolean;
    onToggleSendToAll: () => void;
    selectedCount: number;
    columns: Column<RecipientItem>[];
    rows: RecipientItem[];
    totalCount: number;
    page: number;
    onPageChange: (p: number) => void;
    rowsPerPage: number;
    totalPages: number;
    isLoading: boolean;
    onDone: () => void;

    // Filter type: "all" | "customers" | "imported"
    activeTab?: RecipientFilterType;
    onTabChange?: (tab: RecipientFilterType) => void;
    counts?: {
        all?: number;
        customers?: number;
        imported?: number;
    };
    onSelectAllImported?: () => void;
    selectedImportedCount?: number;
}

export default function RecipientsPickerView({
    searchQuery,
    onSearchChange,
    isSendToAll,
    onToggleSendToAll,
    selectedCount,
    columns,
    rows,
    totalCount,
    page,
    onPageChange,
    rowsPerPage,
    totalPages,
    isLoading,
    onDone,
    activeTab = "all",
    onTabChange,
    counts,
}: RecipientsPickerViewProps) {
    const navigate = useNavigate();

    const renderPaginationButtons = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
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
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isActive
                        ? "bg-[#2E0F74] text-white shadow-xs"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                        }`}
                >
                    {p}
                </button>
            );
        });
    };

    return (
        <div className="w-full bg-white rounded-2xl md:rounded-3xl p-3.5 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] animate-in fade-in duration-150">
            {/* Header */}
            <div className="w-full flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onDone}
                            className="w-8 h-8 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center cursor-pointer hover:bg-[#37137F] shadow-xs shrink-0 transition"
                        >
                            <IoChevronBack size={16} />
                        </button>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                Select Recipients
                            </h2>
                            <p className="text-xs text-gray-400 font-medium">
                                Choose customers and imported contacts to receive this message
                            </p>
                        </div>
                    </div>

                    {/* Quick navigation to Import Page */}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/audience/import")}
                        className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-[#2E0F74] hover:bg-purple-100 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <LuCloudUpload size={14} />
                        <span>Import New Contacts</span>
                    </button>
                </div>

                {/* Filter Tabs & Search / Actions Bar */}
                <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    {/* Tabs (horizontally scrollable on mobile) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => onTabChange?.("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${activeTab === "all"
                                ? "bg-[#2E0F74] text-white shadow-xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <LuUsers size={13} />
                            <span>All</span>
                            {counts?.all !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                                    }`}>
                                    {counts.all}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => onTabChange?.("customers")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${activeTab === "customers"
                                ? "bg-[#2E0F74] text-white shadow-xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <span>Past Attendees</span>
                            {counts?.customers !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "customers" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                                    }`}>
                                    {counts.customers}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => onTabChange?.("imported")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${activeTab === "imported"
                                ? "bg-[#2E0F74] text-white shadow-xs"
                                : "bg-purple-50 text-[#2E0F74] hover:bg-purple-100 border border-purple-200"
                                }`}
                        >
                            <LuFileSpreadsheet size={13} />
                            <span>Imported Contacts</span>
                            {counts?.imported !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "imported" ? "bg-white/20 text-white" : "bg-purple-200 text-[#2E0F74]"
                                    }`}>
                                    {counts.imported}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search & Actions Bar */}
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Search input */}
                        <div className="relative w-full sm:w-52 md:w-64 shrink-0">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                                <IoSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search by name, email, location..."
                                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2E0F74]"
                            />
                        </div>

                        {/* Action buttons (grid on small screens, flex on sm+) */}
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {/* Select All Imported button */}
                            {/* {onSelectAllImported && (
                                <button
                                    type="button"
                                    onClick={onSelectAllImported}
                                    className={`flex-1 sm:flex-initial font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shadow-2xs ${
                                        selectedImportedCount > 0 &&
                                        selectedImportedCount >= (counts?.imported ?? 0) &&
                                        (counts?.imported ?? 0) > 0
                                            ? "bg-purple-200 text-[#2E0F74] border border-purple-300"
                                            : "bg-purple-100 hover:bg-purple-200 text-[#2E0F74]"
                                    }`}
                                >
                                    <LuFileSpreadsheet size={13} />
                                    <span>
                                        {selectedImportedCount > 0 &&
                                        selectedImportedCount >= (counts?.imported ?? 0) &&
                                        (counts?.imported ?? 0) > 0
                                            ? `All Imported Selected (${selectedImportedCount})`
                                            : selectedImportedCount > 0
                                            ? `Imported Selected (${selectedImportedCount}/${counts?.imported ?? selectedImportedCount})`
                                            : `Select All Imported (${counts?.imported ?? 0})`}
                                    </span>
                                </button>
                            )} */}

                            {/* Send To All Button */}
                            <button
                                type="button"
                                onClick={onToggleSendToAll}
                                className={`flex-1 sm:flex-initial font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${isSendToAll
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-[#2E0F74] hover:bg-[#37137F] text-white"
                                    }`}
                            >
                                <LuSquareCheck size={14} />
                                <span>{isSendToAll ? "Deselect All" : `Send To All (${totalCount})`}</span>
                            </button>

                            {/* Done Button */}
                            <button
                                type="button"
                                onClick={onDone}
                                className="w-full sm:w-auto bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs px-4 py-1.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                            >
                                <span>Done ({selectedCount} Selected)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Indicator Banner */}
                {(selectedCount > 0 || isSendToAll) && (
                    <div className="w-full bg-purple-50/80 border border-purple-200/80 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#2E0F74] animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                            <LuSquareCheck size={16} className="shrink-0 text-[#2E0F74]" />
                            <span className="font-semibold">
                                {isSendToAll ? (
                                    <>
                                        All <strong className="font-extrabold">{selectedCount}</strong> {activeTab === "imported" ? "imported contacts" : activeTab === "customers" ? "platform customers" : "recipients (imported + past attendees)"} are selected across all pages.
                                    </>
                                ) : (
                                    <>
                                        <strong className="font-extrabold">{selectedCount}</strong> recipient{selectedCount === 1 ? "" : "s"} selected.
                                    </>
                                )}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onToggleSendToAll}
                            className="self-start sm:self-auto font-bold underline hover:text-[#37137F] cursor-pointer"
                        >
                            {isSendToAll ? "Deselect All" : `Select All (${totalCount})`}
                        </button>
                    </div>
                )}

                {/* Contextual notice if imported tab is active */}
                {/* {activeTab === "imported" && (
                    <div className="w-full bg-purple-50/70 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-[#2E0F74] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <LuFileSpreadsheet size={15} className="shrink-0" />
                            <span>
                                <strong>Imported Contacts:</strong> Sourced from your uploaded files. They will receive email campaigns only.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/audience/import")}
                            className="underline font-bold hover:text-purple-900 shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                            Upload More Contacts →
                        </button>
                    </div>
                )} */}
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden">
                <CustomTable<RecipientItem>
                    columns={columns}
                    rows={rows}
                    rowKey="id"
                    total={totalCount}
                    page={page}
                    onPageChange={onPageChange}
                    rowsPerPage={rowsPerPage}
                    isLoading={isLoading}
                    emptyText={
                        activeTab === "imported"
                            ? "No imported contacts found. Click 'Import New Contacts' to upload a file."
                            : searchQuery
                                ? "No attendees found matching your search."
                                : "No attendees found."
                    }
                    customPagination={
                        <div className="w-full flex flex-col sm:flex-row items-center justify-between py-3 px-2 border-t border-gray-100 gap-3 text-center sm:text-left">
                            <span className="text-xs text-gray-500 font-medium">
                                Showing {rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                                {Math.min(page * rowsPerPage, totalCount)} of {totalCount} entries
                            </span>
                            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                                <button
                                    onClick={() => onPageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 bg-white shrink-0"
                                >
                                    Prev
                                </button>
                                {renderPaginationButtons()}
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                                    disabled={page >= totalPages}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 bg-white shrink-0"
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
