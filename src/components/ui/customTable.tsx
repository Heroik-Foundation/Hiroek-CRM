// components/CustomTable/index.tsx
"use client";

import { Pagination, Table } from "@heroui/react";
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
    // isLoading = false,
    // emptyText = "No data available",
    onClick,
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
        <Table
            aria-label="Data table"
            variant="primary"
        // selectionMode="none"
        >
            <Table.ScrollContainer>
                <Table.Content className="min-w-150">
                    {/* Header */}
                    <Table.Header columns={columns}>
                        {(column) => {
                            const columnIndex = columns.indexOf(column);

                            return (
                                <Table.Column
                                    key={String(column.id)}
                                    isRowHeader={
                                        column.isRowHeader ??
                                        (column.id === "name" ||
                                            columnIndex === 0)
                                    }
                                >
                                    <span className="uppercase text-xs font-semibold tracking-wide">
                                        {column.name}
                                    </span>
                                </Table.Column>
                            );
                        }}
                    </Table.Header>

                    {/* Body */}
                    <Table.Body
                        items={paginatedItems}
                    // isLoading={isLoading}
                    // emptyContent={emptyText}
                    >
                        {(item) => (
                            <Table.Row
                                key={String(item[rowKey])}
                                className={
                                    onClick
                                        ? "cursor-pointer"
                                        : ""
                                }
                                onAction={
                                    onClick
                                }
                            >
                                <Table.Collection
                                    items={columns}
                                >
                                    {(column) => (
                                        <Table.Cell
                                            key={String(
                                                column.id,
                                            )}
                                        >
                                            <div className="min-h-12 flex items-center">
                                                {renderCell(
                                                    item,
                                                    column,
                                                )}
                                            </div>
                                        </Table.Cell>
                                    )}
                                </Table.Collection>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Content>
            </Table.ScrollContainer>

            {/* Pagination */}
            {totalPages > 1 && (
                <Table.Footer>
                    <div className="w-full flex items-center justify-between py-3">
                        <Pagination size="sm">
                            <Pagination.Summary>
                                {rangeStart} to{" "}
                                {rangeEnd} of {total} results
                            </Pagination.Summary>

                            <Pagination.Content>
                                {/* Previous */}
                                <Pagination.Item>
                                    <Pagination.Previous
                                        isDisabled={
                                            page === 1
                                        }
                                        onPress={() =>
                                            onPageChange?.(
                                                Math.max(
                                                    1,
                                                    page - 1,
                                                ),
                                            )
                                        }
                                    >
                                        <Pagination.PreviousIcon />
                                        Prev
                                    </Pagination.Previous>
                                </Pagination.Item>

                                {/* Pages */}
                                {pages.map((p) => (
                                    <Pagination.Item
                                        key={p}
                                    >
                                        <Pagination.Link
                                            isActive={
                                                p === page
                                            }
                                            onPress={() =>
                                                onPageChange?.(
                                                    p,
                                                )
                                            }
                                        >
                                            {p}
                                        </Pagination.Link>
                                    </Pagination.Item>
                                ))}

                                {/* Next */}
                                <Pagination.Item>
                                    <Pagination.Next
                                        isDisabled={
                                            page ===
                                            totalPages
                                        }
                                        onPress={() =>
                                            onPageChange?.(
                                                Math.min(
                                                    totalPages,
                                                    page + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Next
                                        <Pagination.NextIcon />
                                    </Pagination.Next>
                                </Pagination.Item>
                            </Pagination.Content>
                        </Pagination>
                    </div>
                </Table.Footer>
            )}
        </Table>
    );
}