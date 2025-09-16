import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get backend URL from environment variable, fallback to relative URL for local development
const getBackendUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return backendUrl || ''; // Empty string for relative URLs in development
};

// Helper function to properly join URLs, preventing double slashes
const joinUrls = (base: string, path: string): string => {
  if (!base) return path; // If no base URL, return path as-is (for local development)
  
  // Remove trailing slash from base and leading slash from path
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  
  // Join with single slash
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  additionalHeaders?: Record<string, string>,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(additionalHeaders || {}),
  };
  
  // Construct full URL with backend URL if provided
  const backendUrl = getBackendUrl();
  const fullUrl = joinUrls(backendUrl, url);
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Helper function for simple fetch requests (GET, HEAD, etc.)
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const backendUrl = getBackendUrl();
  const fullUrl = joinUrls(backendUrl, url);
  
  const res = await fetch(fullUrl, {
    credentials: "include",
    cache: 'no-store', // Prevent caching issues for session validation
    ...options,
  });

  return res; // Don't throw for HEAD requests that return 404
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construct full URL with backend URL if provided
    const backendUrl = getBackendUrl();
    const url = queryKey.join("/") as string;
    const fullUrl = joinUrls(backendUrl, url);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
