import { API_BASE_URL } from "@/constants/api";

type FetchOptions = RequestInit & {
    timeout?: number;
    token?: string;
};

/**
 * A wrapper around fetch that handles:
 * 1. Base URL concatenation
 * 2. Authorization header injection
 * 3. Tunnel Bypass header injection
 * 4. Timeout handling
 */
export async function apiClient(endpoint: string, options: FetchOptions = {}) {
    const { timeout = 120000, token, headers, ...customConfig } = options;

    // Ensure endpoint starts with / if not present
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;

    const defaultHeaders: HeadersInit = {
        "Bypass-Tunnel-Reminder": "true", // Crucial for LocalTunnel in Expo Go
    };

    if (token) {
        // @ts-ignore
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    };

    // Fix for FormData: If body is FormData, let the browser set Content-Type with boundary
    if (config.body instanceof FormData) {
        // @ts-ignore
        if (config.headers && config.headers["Content-Type"]) {
            // @ts-ignore
            delete config.headers["Content-Type"];
        }
    }

    // Timeout Logic
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    console.log(`[API] Requesting: ${url}`);

    try {
        const response = await fetch(url, config);
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        console.error(`[API] Error request ${url}:`, error);
        if (error.name === "AbortError") {
            throw new Error("La solicitud excedió el tiempo de espera (Timeout).");
        }
        throw error;
    }
}
