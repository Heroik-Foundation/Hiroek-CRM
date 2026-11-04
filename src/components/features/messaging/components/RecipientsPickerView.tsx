import { IoChevronBack, IoSearch } from "react-icons/io5";
import { LuSquareCheck } from "react-icons/lu";
import CustomTable from "../../../ui/customTable";
import type { Column } from "../../../../type/table";
import type { RecipientItem } from "../types";

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
}: RecipientsPickerViewProps) {
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
        <div className="w-full bg-white rounded-2xl md:rounded-3xl p-5 sm:p-7 flex flex-col gap-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            {/* Header */}
            <div className="w-full flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={onDone}
                        className="w-8 h-8 rounded-xl bg-[#2E0F74] text-white flex items-center justify-center cursor-pointer hover:bg-[#37137F] shadow-xs"
                    >
                        <IoChevronBack size={16} />
                    </button>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                        Select Recipients
                    </h2>
                </div>

                <div className="w-full sm:w-auto flex lg:flex-row flex-col ml-auto items-center gap-2 sm:gap-2.5">
                    {/* Search Users input */}
                    <div className="relative w-full sm:w-60 md:w-64">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                            <IoSearch />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search Users..."
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2E0F74]"
                        />
                    </div>

                    {/* Send To All Button */}
                    <button
                        onClick={onToggleSendToAll}
                        className="bg-[#2E0F74] hover:bg-[#37137F] lg:w-auto w-full text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <LuSquareCheck size={14} />
                        <span>{isSendToAll ? "Deselect All" : "Send To All"}</span>
                    </button>

                    {/* Done Button */}
                    <button
                        onClick={onDone}
                        className="bg-[#16A34A] hover:bg-[#15803D] lg:w-auto w-full text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <span>Done ({selectedCount} Selected)</span>
                    </button>
                </div>
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
                    emptyText={searchQuery ? "No attendees found matching your search." : "No attendees found."}
                    customPagination={
                        <div className="w-full flex items-center justify-between py-3 px-2 border-t border-gray-100 flex-wrap gap-3">
                            <span className="text-xs text-gray-500 font-medium">
                                Showing {rows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
                                {Math.min(page * rowsPerPage, totalCount)} of {totalCount} entries
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => onPageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
                                >
                                    Prev
                                </button>
                                {renderPaginationButtons()}
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                                    disabled={page >= totalPages}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
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
