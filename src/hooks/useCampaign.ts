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
    /** Set when the backend supports rendering `body` as HTML instead of escaping it. */
    isHtml?: boolean;
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

export interface ImageUploadResponse {
    url?: string;
    contentType?: string;
    size?: number;
    message?: string;
    data?: {
        url?: string;
        contentType?: string;
        size?: number;
    };
    result?: {
        url?: string;
        contentType?: string;
        size?: number;
    };
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
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create campaign";
                toast.danger(msg);
            },
        });
    };

    const useUploadCampaignImage = () => {
        return useMutation({
            mutationFn: async (file: File) => {
                const formData = new FormData();
                formData.append("image", file);
                const response = await httpService.post<ImageUploadResponse>(
                    URLS.IMAGE_UPLOAD,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                return response.data;
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.error?.details?.message ||
                    err?.response?.data?.details?.message ||
                    err?.response?.data?.error?.message ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to upload image";
                toast.danger(msg);
            },
        });
    };

    return {
        useCreateCampaign,
        useUploadCampaignImage,
    };
};

export default useCampaign;
