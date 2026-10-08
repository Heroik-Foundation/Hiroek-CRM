import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";
import httpService from "../config/httpService";

export interface TicketScanParams {
    searchQuery?: string;
    eventId?: string;
    page?: number;
    pageSize?: number;
}

export interface TicketScanLogItem {
    _id?: string;
    id?: string | number;
    ticketId?: string;
    ticketCode?: string;
    event?: string | { _id?: string; title?: string; name?: string };
    eventName?: string;
    attendee?: string;
    email?: string;
    user?: string | { _id?: string; fullname?: string; name?: string; email?: string; photo?: string };
    ticketType?: string | { _id?: string; ticketType?: string; name?: string };
    callerType?: string;
    caller?: string | { _id?: string; fullname?: string; name?: string };
    scannedBy?: string;
    scanTime?: string;
    createdAt?: string;
    status?: string;
}

export interface TicketScanLogResponse {
    result?: TicketScanLogItem[];
    data?: TicketScanLogItem[];
    total?: number;
    totalCount?: number;
    totalPages?: number;
    page?: number;
    pageSize?: number;
}

const useTicketScans = () => {
    const queryClient = useQueryClient();

    const useGetTicketScanLogs = (params?: TicketScanParams) => {
        return useFetchData<TicketScanLogResponse | TicketScanLogItem[]>({
            endpoint: URLS.GET_TICKET_SCAN_LOGS,
            name: [URLS.GET_TICKET_SCAN_LOGS, JSON.stringify(params ?? {})],
            params: params as Record<string, unknown>,
        });
    };

    const useGetAllEvents = () => {
        return useFetchData<any>({
            endpoint: URLS.GET_ALL_EVENTS,
            name: [URLS.GET_ALL_EVENTS],
        });
    };

    /** 🎟️ Scan Ticket Mutation: Calls GET /api/event-partners/ticket-scanner/{eventTicketCode} */
    const useScanTicket = () => {
        return useMutation({
            mutationFn: async (eventTicketCode: string) => {
                const cleanCode = eventTicketCode.trim();
                const url = URLS.SCAN_TICKET(cleanCode);
                const res = await httpService.get(url);
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [URLS.GET_TICKET_SCAN_LOGS],
                });
            },
        });
    };

    return {
        useGetTicketScanLogs,
        useGetAllEvents,
        useScanTicket,
    };
};

export default useTicketScans;
