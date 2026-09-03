"use client";
 
import { useQuery, type UseQueryResult } from "@tanstack/react-query"; 
import { fetchSecureData, fetchUnsecureData } from "../config/api";

interface UseFetchDataOptions {
  endpoint: string;
  name?: string[];
  params?: Record<string, unknown>;
  id?: string | number;
  queryKey?: (string | number | undefined)[];
  enable?: boolean;
  pagination?: boolean
}

const buildQueryKey = (
  name?: string[],
  endpoint?: string,
  id?: string | number,
  queryKey: (string | number | undefined)[] = [],
  params?: Record<string, unknown>
) => {
  return [
    ...(name ?? []),     // Safe spread
    endpoint,
    id,
    ...queryKey,
    params ? JSON.stringify(params) : "{}",
  ];
};

export const useFetchData = <T>({
  endpoint,
  name,
  params,
  id,
  queryKey = [],
  enable = true,
}: UseFetchDataOptions): UseQueryResult<T> => {
  return useQuery<T>({
    queryKey: buildQueryKey(name, endpoint, id, queryKey, params),
    queryFn: () => fetchSecureData<T>(endpoint, params),
    enabled: enable,
  });
};

export const useUnsecureFetchData = <T>({
  endpoint,
  name,
  params,
  id,
  queryKey = [],
  enable = true,
}: UseFetchDataOptions): UseQueryResult<T> => {
  return useQuery<T>({
    queryKey: buildQueryKey(name, endpoint, id, queryKey, params),
    queryFn: () => fetchUnsecureData<T>(endpoint, params), // FIXED
    enabled: enable,
  });
};
