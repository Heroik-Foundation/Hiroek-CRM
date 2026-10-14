import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "https://dev.hiroek.io/api";

const DEFAULT_DEV_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGY2YWJjNTZhNTkyMTZjYTBkMzUwZjIiLCJ1c2VySWQiOiI2OGY2YWJjNDZhNTkyMTZjYTBkMzUwZjAiLCJyb2xlIjoiZXZlbnRfcGFydG5lciIsIm5hbWUiOiJWaWJleiBOYXRpb25zIGdvb2QiLCJleHAiOjE3ODg0NTgyMDIuNTI1LCJpYXQiOjE3ODg0NDc0MDJ9.8yv_eb5elzi6YkNo4vpv3mrCTkLOaGgf0ZaTlFz6YtQ";

// ─── Token Storage ────────────────────────────────────────────────────────────

let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccess: (): string | null => {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("hiroek_access_token") ??
        localStorage.getItem("token");
      if (stored) return stored;
    }
    return DEFAULT_DEV_TOKEN;
  },
  setAccess: (token: string) => {
    inMemoryAccessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("hiroek_access_token", token);
    }
  },
  clearAccess: () => {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("hiroek_access_token");
      localStorage.removeItem("token");
    }
  },

  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("hiroek_refresh_token");
  },
  setRefresh: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hiroek_refresh_token", token);
    }
  },
  clearRefresh: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hiroek_refresh_token");
    }
  },

  clearAll: () => {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("hiroek_access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("hiroek_refresh_token");
    }
  },
};

export const LOGIN_URL = "http://localhost:3000/auth/login";

/** Redirects user to login portal */
export function redirectToLogin() {
  if (typeof window !== "undefined") {
    if (window.location.href !== LOGIN_URL) {
      window.location.href = LOGIN_URL;
    }
  }
}

/** Clears tokens and client session keys. Safe to call from UI or interceptors. */
export function clearSession() {
  tokenStorage.clearAll();
  if (typeof window === "undefined") return;
  localStorage.removeItem("hiroekuserid");
  localStorage.removeItem("hiroekuserrole");
}

// ─── Axios Instances ──────────────────────────────────────────────────────────

export const httpService = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

export const unsecureHttpService = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

// ─── Refresh Token Queue ──────────────────────────────────────────────────────

let isRefreshing = false;

type PromiseExecutor = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: PromiseExecutor[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Use unsecure instance so this call never triggers another refresh cycle
  const { data } = await unsecureHttpService.post<{
    access?: string;
    accessToken?: string;
    refreshToken?: string;
  }>("/token/refresh", { refresh: refreshToken });

  const newToken = data.access ?? data.accessToken;
  if (!newToken) {
    throw new Error("Invalid refresh token response");
  }

  tokenStorage.setAccess(newToken);
  if (data.refreshToken) {
    tokenStorage.setRefresh(data.refreshToken);
  }

  return newToken;
}

// ─── Unsecured Instance Interceptors ─────────────────────────────────────────

unsecureHttpService.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<unknown>): Promise<never> => {
    if (error.response?.status === 401) {
      clearSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

// ─── Secured Instance — Request Interceptor ───────────────────────────────────

httpService.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError<unknown>): Promise<never> => Promise.reject(error)
);

// ─── Secured Instance — Response Interceptor (handles 401 + refresh) ─────────

httpService.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Check if error is unauthorized (401)
    if (error.response?.status === 401) {
      // If already retried once or no original request, redirect immediately
      if (!originalRequest || originalRequest._retry) {
        clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
              resolve(httpService(originalRequest));
            },
            reject: (err) => {
              clearSession();
              redirectToLogin();
              reject(err);
            },
          });
        });
      }

      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return httpService(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default httpService;