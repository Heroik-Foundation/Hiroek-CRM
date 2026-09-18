import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../utils/urls";
import httpService from "../config/httpService";
import { toast } from "@heroui/react";

export type CampaignChannel = "notification" | "in_app" | "email";

export interface ImportedEmail {
    email: string;
    name?: string;
}

export interface CampaignRecipientPayload {
    customerIds?: string[];
    importedEmails?: ImportedEmail[];
}

export interface CreateCampaignRequest {
    idempotencyKey: string;
    channels: CampaignChannel[];
    recipients: CampaignRecipientPayload;
    title: string;
    body: string;
}

export interface CreateCampaignResponse {
    organizer?: string;
    channels?: CampaignChannel[];
    title?: string;
    body?: string;
    totalRecipients?: number;
    reservedAmount?: number;
    status?: string;
    idempotencyKey?: string;
    createdAt?: string;
    updatedAt?: string;
    data?: any;
    message?: string;
}

const useCampaign = () => {
    const queryClient = useQueryClient();

    const useCreateCampaign = () => {
        return useMutation({
            mutationFn: async (payload: CreateCampaignRequest) => {
                const response = await httpService.post<CreateCampaignResponse>(
                    URLS.CREATE_CAMPAIGN,
                    payload,
                );
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [URLS.GET_EMAIL_BALANCE] });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to create campaign";
                toast.danger(msg);
            },
        });
    };

    return {
        useCreateCampaign,
    };
};

export default useCampaign;
