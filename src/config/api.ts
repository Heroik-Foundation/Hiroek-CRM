// api.ts
import httpService, { unsecureHttpService } from "./httpService";

export const fetchUnsecureData = async <T>(
    endpoint: string,
    params?: Record<string, unknown> | undefined,
): Promise<T> => {
    const response = await unsecureHttpService.get<T>(endpoint, { params });
    return response.data;
};

export const fetchSecureData = async <T>(
    endpoint: string,
    params?: Record<string, unknown>, 
): Promise<T> => {
    const response = await httpService.get<T>(endpoint, { params });
    return response.data;
};
