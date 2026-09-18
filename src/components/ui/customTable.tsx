// components/CustomTable/index.tsx
"use client";

import { Pagination } from "@heroui/react";
import { useMemo } from "react";
import { formatNumber } from "../../config/numberFormat";
import { dateFormat } from "../../config/dateFormat";
import type { CustomTableProps, Column } from "../../type/table";

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-fit rounded-full py-1 px-3 border border-[#DDE6EB] text-sm">
            {children}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => {
        if (acc == null || typeof acc !== "object") return undefined;
        return (acc as Record<string, unknown>)[key];
    }, obj);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTable<T extends Record<string, any>>({
    columns,
    rows,
    rowKey,
    total,
    page,
    onPageChange,
    rowsPerPage = 10,
    isLoading = false,
    emptyText = "No data available",
    onClick,
    headerClassName,
    thClassName,
    customPagination,
}: CustomTableProps<T>) {
    // ── Pagination ────────────────────────────────────────────────────────────

    const totalPages = Math.ceil(total / rowsPerPage);

    const pages = Array.from(
        { length: totalPages },
        (_, i) => i + 1,
    );

    const paginatedItems = useMemo(() => {
        const tableRows = Array.isArray(rows) ? rows : [];
        if (tableRows.length <= rowsPerPage && total > tableRows.length) {
            return tableRows;
        }
        const start = (page - 1) * rowsPerPage;

        return tableRows.slice(start, start + rowsPerPage);
    }, [page, rows, rowsPerPage, total]);

    const rangeStart =
        total === 0 ? 0 : (page - 1) * rowsPerPage + 1;

    const rangeEnd = Math.min(
        page * rowsPerPage,
        total,
    );

    // ── Cell Renderer ────────────────────────────────────────────────────────

    function renderCell(
        item: T,
        column: Column<T>,
    ): React.ReactNode {
        const value = column.id.includes(".")
            ? getNestedValue(item, column.id)
            : item[column.id as keyof T];

        // Custom renderer
        if (column.render) {
            return column.render(value, item);
        }

        if (value == null) return "-";

        switch (column.type) {
            case "date":
                return (
                    <Pill>
                        {dateFormat(String(value))}
                    </Pill>
                );

            case "number":
                return (
                    <Pill>
                        {formatNumber(Number(value), "")}
                    </Pill>
                );

            case "currency":
                return (
                    <Pill>
                        {formatNumber(Number(value))}
                    </Pill>
                );

            default:
                return String(value);
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="w-full overflow-x-auto rounded-xl">
                <table aria-label="Data table" className="w-full min-w-150 border-collapse text-left text-sm">
                    {/* Header */}
                    <thead>
                        <tr className={headerClassName ?? "border-b border-gray-100 bg-gray-50/50"}>
                            {columns.map((column) => (
                                <th
                                    key={String(column.id)}
                                    scope="col"
                                    className={thClassName ?? "py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"}
                                >
                                    {column.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 text-center text-sm text-gray-500"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedItems.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 text-center text-sm text-gray-500"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => {
                                const id = String(item[rowKey] ?? item.id ?? item._id);
                                return (
                                    <tr
                                        key={id}
                                        onClick={() => onClick?.(item)}
                                        className={`transition-colors hover:bg-gray-50/60 ${
                                            onClick ? "cursor-pointer" : ""
                                        }`}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={String(column.id)}
                                                className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap"
                                            >
                                                <div className="min-h-12 flex items-center">
                                                    {renderCell(item, column)}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {customPagination ? (
                customPagination
            ) : totalPages > 1 ? (
                <div className="w-full border-t border-gray-100 pt-3">
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
                        <Pagination size="sm">
                            <Pagination.Summary>
                                {rangeStart} to {rangeEnd} of {total} results
                            </Pagination.Summary>

                            <Pagination.Content>
                                {/* Previous */}
                                <Pagination.Item>
                                    <Pagination.Previous
                                        isDisabled={page === 1}
                                        onPress={() => onPageChange?.(Math.max(1, page - 1))}
                                    >
                                        <Pagination.PreviousIcon />
                                        Prev
                                    </Pagination.Previous>
                                </Pagination.Item>

                                {/* Pages */}
                                {pages.map((p) => (
                                    <Pagination.Item key={p}>
                                        <Pagination.Link
                                            isActive={p === page}
                                            onPress={() => onPageChange?.(p)}
                                        >
                                            {p}
                                        </Pagination.Link>
                                    </Pagination.Item>
                                ))}

                                {/* Next */}
                                <Pagination.Item>
                                    <Pagination.Next
                                        isDisabled={page === totalPages}
                                        onPress={() => onPageChange?.(Math.min(totalPages, page + 1))}
                                    >
                                        Next
                                        <Pagination.NextIcon />
                                    </Pagination.Next>
                                </Pagination.Item>
                            </Pagination.Content>
                        </Pagination>
                    </div>
                </div>
            ) : null}
        </div>
    );
}