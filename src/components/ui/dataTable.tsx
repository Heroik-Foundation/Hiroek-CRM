import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import Text from "./customText";

export interface DataTableColumn<T> {
    id: string;
    header: string;
    cell: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
}

export interface DataTableEmptyState {
    title: string;
    description: string;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    getRowKey: (row: T) => string;
    emptyState?: DataTableEmptyState;
    className?: string;
    tableClassName?: string;
    rowClassName?: string;
}

export default function DataTable<T>({
    columns,
    data,
    getRowKey,
    emptyState = {
        title: "No results found",
        description: "Try adjusting your search or filters.",
    },
    className,
    tableClassName,
    rowClassName,
}: DataTableProps<T>) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-grey-02 bg-white",
                className,
            )}
        >
            <div className="overflow-x-auto">
                <table className={cn("min-w-full border-collapse", tableClassName)}>
                    <thead>
                        <tr className="border-b border-grey-02 bg-white">
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    scope="col"
                                    className={cn(
                                        "px-4 py-4 text-left text-sm font-medium text-grey-03",
                                        column.headerClassName,
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row) => (
                                <tr
                                    key={getRowKey(row)}
                                    className={cn(
                                        "border-b border-grey-02 last:border-b-0",
                                        rowClassName,
                                    )}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.id}
                                            className={cn(
                                                "px-4 py-4 text-sm text-grey-04",
                                                column.cellClassName,
                                            )}
                                        >
                                            {column.cell(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <Text className="text-base font-semibold text-grey-05">
                                            {emptyState.title}
                                        </Text>
                                        <Text className="text-sm text-grey-03">
                                            {emptyState.description}
                                        </Text>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
