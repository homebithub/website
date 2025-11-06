import { API_BASE_URL, getAuthHeaders } from "~/config/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean; // when true, must have token, else 401 flow
  handle401?: "redirect" | "silent"; // default redirect
}

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(url: string, method: HttpMethod, options: RequestOptions = {}) {
  const { requireAuth = false, handle401 = "redirect", headers, ...rest } = options;
  const token = getToken();

  // Build headers: include auth if token exists, never if missing
  const finalHeaders: HeadersInit = {
    ...(headers || {}),
    ...(token ? getAuthHeaders(token) : { "Content-Type": "application/json" }),
  };

  // If auth explicitly required and no token, surface a 401-like error
  if (requireAuth && !token) {
    if (handle401 === "redirect" && typeof window !== "undefined") {
      // Redirect to login with return URL
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnTo=${returnTo}`;
    }
    const error = new Error("Unauthorized: Missing token");
    (error as any).status = 401;
    throw error;
  }

  const res = await fetch(url, { method, headers: finalHeaders, ...rest });

  if (res.status === 401) {
    // Clear invalid token
    try { localStorage.removeItem("token"); localStorage.removeItem("user_object"); } catch {}
    if (handle401 === "redirect" && typeof window !== "undefined") {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnTo=${returnTo}`;
    }
  }

  return res;
}

export const apiClient = {
  // Public request: never enforces token
  async public(url: string, options?: RequestOptions) {
    return request(url, (options?.method as HttpMethod) || "GET", { ...options, requireAuth: false });
  },

  // Authenticated request: requires token, redirects on 401 by default
  async auth(url: string, options?: RequestOptions) {
    return request(url, (options?.method as HttpMethod) || "GET", { ...options, requireAuth: true });
  },

  // Conditional: attach token if present, but do not require it
  async conditional(url: string, options?: RequestOptions) {
    return request(url, (options?.method as HttpMethod) || "GET", { ...options, requireAuth: false });
  },

  // Convenience helpers for JSON
  async json<T = any>(res: Response): Promise<T> {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed with ${res.status}`);
    }
    return res.json();
  }
};

export default apiClient;


