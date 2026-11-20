import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import httpService from "../config/httpService";
import { URLS } from "../utils/urls";
import { toast } from "@heroui/react";

export interface RecipientApiItem {
    id: string;
    _id?: string;
    name?: string;
    fullname?: string;
    email: string;
    phone?: string;
    location?: string;
    type: "customer" | "imported";
    channels?: string[];
    emailBlockedReason?: string | null;
    createdAt?: string;
    importedAt?: string;
    user?: Record<string, unknown>;
}

export interface RecipientsListResponse {
    data?: RecipientApiItem[];
    recipients?: RecipientApiItem[];
    items?: RecipientApiItem[];
    total?: number;
    totalCount?: number;
    count?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
}

export interface ImportStatusResponse {
    id: string;
    _id?: string;
    status: "parsing" | "ready" | "importing" | "completed" | "failed" | "cancelled";
    percent?: number | null;
    fileName?: string;
    filename?: string;
    activity?: string[] | { message: string; timestamp?: string }[];
    logs?: string[];
    failureReason?: string;
    totals?: {
        rows: number;
        imported: number;
        merged: number;
        skipped: number;
        failed: number;
    };
    totalRows?: number;
    importedRows?: number;
    failedRows?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ImportReportResponse {
    totals: {
        rows: number;
        imported: number;
        merged: number;
        skipped: number;
        failed: number;
    };
    failedRows?: {
        row: number | string;
        rowNumber?: number | string;
        contact?: string;
        email?: string;
        phone?: string;
        reason?: string;
        error?: string;
    }[];
}

export interface GetRecipientsParams {
    type?: "all" | "customers" | "imported";
    search?: string;
    page?: number;
    pageSize?: number;
}

export default function useRecipients() {
    const queryClient = useQueryClient();

    /** 🔹 GET /api/recipients: List the people a campaign can be sent to */
    const useGetRecipients = (params?: GetRecipientsParams) => {
        const queryParams = {
            type: params?.type || "all",
            search: params?.search?.trim() || undefined,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
        };

        return useQuery<RecipientsListResponse>({
            queryKey: [URLS.GET_RECIPIENTS, queryParams],
            queryFn: async () => {
                const response = await httpService.get<RecipientsListResponse>(URLS.GET_RECIPIENTS, {
                    params: queryParams,
                });
                return response.data;
            },
            placeholderData: (prev) => prev,
        });
    };

    /** 🔹 POST /api/recipients/imports: Upload contact file (.csv, .xlsx, .json up to 50MB) */
    const useUploadRecipientFile = () => {
        return useMutation<{ id?: string; importId?: string; status?: string; message?: string }, Error, FormData>({
            mutationFn: async (formData: FormData) => {
                const response = await httpService.post(URLS.CREATE_RECIPIENTS_IMPORT, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENTS_IMPORTS] });
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENTS] });
            },
            onError: (err: any) => {
                const message =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.details?.message ||
                    err?.message ||
                    "Failed to upload contact file";
                toast.danger(message);
            },
        });
    };

    /** 🔹 GET /api/recipients/imports: Most recent imports, newest first */
    const useGetRecentImports = () => {
        return useQuery<ImportStatusResponse[]>({
            queryKey: [URLS.GET_RECIPIENTS_IMPORTS],
            queryFn: async () => {
                const response = await httpService.get<ImportStatusResponse[]>(URLS.GET_RECIPIENTS_IMPORTS);
                const data = response.data;
                if (Array.isArray(data)) return data;
                if (Array.isArray((data as any)?.data)) return (data as any).data;
                if (Array.isArray((data as any)?.imports)) return (data as any).imports;
                return [];
            },
        });
    };

    /** 🔹 GET /api/recipients/imports/{importId}: Follow an import progress and status */
    const useGetImportStatus = (importId: string | null, enabled = true) => {
        return useQuery<ImportStatusResponse>({
            queryKey: [URLS.GET_RECIPIENT_IMPORT(importId || "")],
            queryFn: async () => {
                if (!importId) throw new Error("No import ID provided");
                const response = await httpService.get<ImportStatusResponse>(
                    URLS.GET_RECIPIENT_IMPORT(importId)
                );
                return response.data;
            },
            enabled: Boolean(importId) && enabled,
            refetchInterval: (query) => {
                const status = query.state.data?.status;
                if (status === "completed" || status === "failed" || status === "cancelled") {
                    return false;
                }
                return 1500; // Poll every 1.5s while parsing, ready, or importing
            },
        });
    };

    /** 🔹 POST /api/recipients/imports/{importId}/confirm: Confirm and import contacts */
    const useConfirmImport = () => {
        return useMutation<{ status?: string; message?: string }, Error, string>({
            mutationFn: async (importId: string) => {
                const response = await httpService.post(URLS.CONFIRM_RECIPIENT_IMPORT(importId), {
                    consent: true,
                });
                return response.data;
            },
            onSuccess: (_data, importId) => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENT_IMPORT(importId)] });
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENTS] });
                toast.success("Import confirmed and saving contacts...");
            },
            onError: (err: any) => {
                const msg = err?.response?.data?.message || err?.message || "Failed to confirm import";
                toast.danger(msg);
            },
        });
    };

    /** 🔹 POST /api/recipients/imports/{importId}/cancel: Cancel an import */
    const useCancelImport = () => {
        return useMutation<{ status?: string; message?: string }, Error, string>({
            mutationFn: async (importId: string) => {
                const response = await httpService.post(URLS.CANCEL_RECIPIENT_IMPORT(importId));
                return response.data;
            },
            onSuccess: (_data, importId) => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENT_IMPORT(importId)] });
                toast.info("Import cancelled");
            },
        });
    };

    /** 🔹 GET /api/recipients/imports/{importId}/report: What an import did */
    const useGetImportReport = (importId: string | null, enabled = true) => {
        return useQuery<ImportReportResponse>({
            queryKey: [URLS.GET_RECIPIENT_IMPORT_REPORT(importId || "")],
            queryFn: async () => {
                if (!importId) throw new Error("No import ID provided");
                const response = await httpService.get<ImportReportResponse>(
                    URLS.GET_RECIPIENT_IMPORT_REPORT(importId)
                );
                return response.data;
            },
            enabled: Boolean(importId) && enabled,
        });
    };

    /** 🔹 Download failed rows CSV */
    const downloadFailedRowsCsv = async (importId: string) => {
        try {
            const response = await httpService.get(URLS.GET_RECIPIENT_IMPORT_FAILED_ROWS_CSV(importId), {
                responseType: "blob",
            });
            const blob = new Blob([response.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `import-${importId}-failed-rows.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("Failed rows CSV downloaded");
        } catch (err: any) {
            toast.danger(err?.message || "Failed to download failed rows CSV");
        }
    };

    /** 🔹 DELETE /api/recipients/imported/{recipientId}: Remove an imported contact */
    const useDeleteImportedRecipient = () => {
        return useMutation<void, Error, string>({
            mutationFn: async (recipientId: string) => {
                await httpService.delete(URLS.DELETE_IMPORTED_RECIPIENT(recipientId));
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_RECIPIENTS] });
                toast.success("Imported contact removed");
            },
            onError: (err: any) => {
                toast.danger(err?.message || "Failed to remove contact");
            },
        });
    };

    return {
        useGetRecipients,
        useUploadRecipientFile,
        useGetRecentImports,
        useGetImportStatus,
        useConfirmImport,
        useCancelImport,
        useGetImportReport,
        downloadFailedRowsCsv,
        useDeleteImportedRecipient,
    };
}
