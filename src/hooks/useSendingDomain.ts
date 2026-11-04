import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../utils/urls";
import httpService from "../config/httpService";
import { toast } from "@heroui/react";
import { useFetchData } from "./useFetchData";
import type {
    SendingDomainStatusResponse,
    DomainAvailabilityResponse,
    SetupSendingDomainPayload,
    ConnectCustomDomainPayload,
    UpdateSenderProfilePayload,
} from "../components/features/messaging/types";

const useSendingDomain = () => {
    const queryClient = useQueryClient();

    // 1. GET /api/event-partners/sending-domain - Fetch domain status
    const useGetSendingDomain = () => {
        return useFetchData<SendingDomainStatusResponse>({
            endpoint: URLS.GET_SENDING_DOMAIN,
            name: [URLS.GET_SENDING_DOMAIN],
        });
    };

    // 2. GET /api/event-partners/sending-domain/availability?name=xxx
    const checkDomainAvailability = async (name: string): Promise<DomainAvailabilityResponse> => {
        const response = await httpService.get<DomainAvailabilityResponse>(
            URLS.CHECK_SENDING_DOMAIN_AVAILABILITY,
            { params: { name } }
        );
        return response.data;
    };

    // 3. POST /api/event-partners/sending-domain - Option 1: Setup platform sending domain
    const useSetupPlatformDomain = () => {
        return useMutation({
            mutationFn: async (payload: SetupSendingDomainPayload) => {
                const response = await httpService.post<{
                    message?: string;
                    sendingDomain?: any;
                }>(URLS.SETUP_SENDING_DOMAIN, payload);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to set up sending domain";
                toast.danger(msg);
            },
        });
    };

    // 4. POST /api/event-partners/sending-domain/custom - Option 2 Step 1: Connect organizer domain
    const useConnectCustomDomain = () => {
        return useMutation({
            mutationFn: async (payload: ConnectCustomDomainPayload) => {
                const response = await httpService.post<{
                    message?: string;
                    sendingDomain?: any;
                    dnsRecords?: any[];
                }>(URLS.CONNECT_CUSTOM_SENDING_DOMAIN, payload);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to register custom domain";
                toast.danger(msg);
            },
        });
    };

    // 5. POST /api/event-partners/sending-domain/custom/verify - Option 2 Step 2 & 3: Check DNS records
    const useVerifyCustomDomain = () => {
        return useMutation({
            mutationFn: async () => {
                const response = await httpService.post<{
                    message?: string;
                }>(URLS.VERIFY_CUSTOM_SENDING_DOMAIN, {});
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "DNS verification check failed";
                toast.danger(msg);
            },
        });
    };

    // 6. PATCH /api/event-partners/sending-domain - Option 2 Step 4: Update sender profile & reply-to
    const useUpdateSenderProfile = () => {
        return useMutation({
            mutationFn: async (payload: UpdateSenderProfilePayload) => {
                const response = await httpService.patch<{
                    message?: string;
                    sendingDomain?: any;
                }>(URLS.UPDATE_SENDING_DOMAIN, payload);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update sender profile";
                toast.danger(msg);
            },
        });
    };

    // 7. POST /api/event-partners/sending-domain/retry - Retry sending domain setup
    const useRetrySendingDomain = () => {
        return useMutation({
            mutationFn: async () => {
                const response = await httpService.post<{
                    message?: string;
                }>(URLS.RETRY_SENDING_DOMAIN, {});
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to retry sending domain setup";
                toast.danger(msg);
            },
        });
    };

    // 8. DELETE /api/event-partners/sending-domain/{id} - Delete sending domain
    const useDeleteSendingDomain = () => {
        return useMutation({
            mutationFn: async (sendingDomainId: string) => {
                const response = await httpService.delete<{
                    message?: string;
                }>(URLS.DELETE_SENDING_DOMAIN(sendingDomainId));
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_SENDING_DOMAIN] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete sending domain";
                toast.danger(msg);
            },
        });
    };

    return {
        useGetSendingDomain,
        checkDomainAvailability,
        useSetupPlatformDomain,
        useConnectCustomDomain,
        useVerifyCustomDomain,
        useUpdateSenderProfile,
        useRetrySendingDomain,
        useDeleteSendingDomain,
    };
};

export default useSendingDomain;

