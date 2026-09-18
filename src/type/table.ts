
export type ColumnType = "text" | "number" | "currency" | "date" | "custom";

export interface Column<T> {
  id: string;
  name: string;
  type?: ColumnType;
  isRowHeader?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface CustomTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  rowKey: keyof T;                    // e.g. "id"

  // Pagination
  total: number;
  page: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;

  // Styling & Customization
  headerClassName?: string;
  thClassName?: string;
  customPagination?: React.ReactNode;

  // States
  isLoading?: boolean;
  emptyText?: string;
  onClick?: (item?: T) => void;
}