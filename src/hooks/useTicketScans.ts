import { URLS } from "../utils/urls";
import { useFetchData } from "./useFetchData";

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
    event?: string | { _id?: string; title?: string; name?: string };
    eventName?: string;
    attendee?: string;
    email?: string;
    user?: string | { _id?: string; fullname?: string; name?: string; email?: string };
    ticketType?: string | { _id?: string; ticketType?: string; name?: string };
    callerType?: string;
    caller?: string | { _id?: string; fullname?: string; name?: string };
    scannedBy?: string;
    scanTime?: string;
    createdAt?: string;
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

    return {
        useGetTicketScanLogs,
        useGetAllEvents,
    };
};

export default useTicketScans;
