# Frontend-Backend Integration Plan

## Overview

Comprehensive plan for seamless integration between the **Website (Frontend)** and **Auth (Backend)** microservices, covering API communication, authentication flow, error handling, and deployment architecture.

**Frontend:** React Router v7 (Remix) - Port 3000  
**Backend:** Go/Echo API - Port 8080  
**Estimated Time:** 6-8 hours  
**Priority:** Critical

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Users/Clients                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Load Balancer      │
                │   (nginx/Traefik)    │
                └──────────┬───────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│  Website Frontend    │       │   Auth Backend       │
│  React Router v7     │◄─────►│   Go/Echo API        │
│  Port: 3000          │  API  │   Port: 8080         │
│  SSR + Client        │       │   REST API           │
└──────────────────────┘       └──────────┬───────────┘
           │                               │
           │                               ▼
           │                    ┌──────────────────────┐
           │                    │   PostgreSQL DB      │
           │                    │   Port: 5432         │
           │                    └──────────────────────┘
           │                               │
           │                               ▼
           │                    ┌──────────────────────┐
           │                    │   Redis Cache        │
           │                    │   Port: 6379         │
           └────────────────────┴──────────────────────┘
```

---

## Phase 1: API Client Setup

### 1.1 Centralized API Client
**Time:** 2 hours  
**Priority:** Critical

**API Client Utility:**
```typescript
// app/utils/api/client.ts
import { TokenManager } from "~/utils/auth/tokenManager";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 seconds
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      timeout = this.defaultTimeout,
      headers = {},
      ...fetchOptions
    } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    
    // Add auth token if required
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };
    
    if (requiresAuth) {
      const token = TokenManager.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      const isJSON = contentType?.includes("application/json");
      
      if (!response.ok) {
        const error = isJSON ? await response.json() : { message: response.statusText };
        
        // Handle 401 - Token expired, try refresh
        if (response.status === 401 && requiresAuth) {
          const refreshed = await TokenManager.refreshIfNeeded();
          if (refreshed) {
            // Retry request with new token
            return this.request<T>(endpoint, options);
          }
        }
        
        throw new APIError(
          error.message || "Request failed",
          response.status,
          error.code,
          error.details
        );
      }
      
      return isJSON ? await response.json() : ({} as T);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new APIError("Request timeout", 408);
        }
        throw new APIError(error.message, 0);
      }
      
      throw new APIError("Unknown error occurred", 0);
    }
  }
  
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }
  
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
  
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create singleton instance
const API_BASE_URL = typeof window !== "undefined" 
  ? window.ENV?.API_BASE_URL || "http://localhost:8080"
  : process.env.API_BASE_URL || "http://localhost:8080";

export const apiClient = new APIClient(API_BASE_URL);
```

---

### 1.2 Type-Safe API Endpoints
**Time:** 2 hours  
**Priority:** High

**API Types:**
```typescript
// app/types/api.ts

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "househelp" | "household" | "bureau";
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Profile
export interface HousehelpProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string;
  experience: number;
  rating: number;
  location: Location;
  images: Image[];
  reviews: Review[];
}

export interface HouseholdProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  location: Location;
  householdSize: number;
  kids: HouseholdKid[];
  pets: Pet[];
}

// Common
export interface Location {
  id: string;
  county: string;
  subCounty: string;
  ward: string;
  estate: string;
}

export interface Image {
  id: string;
  url: string;
  entityType: string;
  entityId: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  househelpId: string;
  createdAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error
export interface APIErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
}
```

**API Service Layer:**
```typescript
// app/services/auth.service.ts
import { apiClient } from "~/utils/api/client";
import type { LoginRequest, LoginResponse, SignupRequest, User } from "~/types/api";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/v1/auth/login", credentials, {
      requiresAuth: false,
    });
  },
  
  async signup(data: SignupRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/v1/auth/register", data, {
      requiresAuth: false,
    });
  },
  
  async logout(): Promise<void> {
    return apiClient.post<void>("/api/v1/auth/logout");
  },
  
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/api/v1/auth/me");
  },
  
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/v1/auth/refresh", { refreshToken }, {
      requiresAuth: false,
    });
  },
  
  async forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>("/api/v1/auth/forgot-password", { email }, {
      requiresAuth: false,
    });
  },
  
  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post<void>("/api/v1/auth/reset-password", { token, password }, {
      requiresAuth: false,
    });
  },
};
```

```typescript
// app/services/profile.service.ts
import { apiClient } from "~/utils/api/client";
import type { HousehelpProfile, HouseholdProfile, PaginatedResponse } from "~/types/api";

export const profileService = {
  async getHousehelpProfile(id: string): Promise<HousehelpProfile> {
    return apiClient.get<HousehelpProfile>(`/api/v1/profile/househelp/${id}`);
  },
  
  async getHouseholdProfile(id: string): Promise<HouseholdProfile> {
    return apiClient.get<HouseholdProfile>(`/api/v1/profile/household/${id}`);
  },
  
  async updateHousehelpProfile(id: string, data: Partial<HousehelpProfile>): Promise<HousehelpProfile> {
    return apiClient.put<HousehelpProfile>(`/api/v1/profile/househelp/${id}`, data);
  },
  
  async searchHousehelps(params: {
    location?: string;
    experience?: number;
    rating?: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<HousehelpProfile>> {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get<PaginatedResponse<HousehelpProfile>>(`/api/v1/profile/househelp?${queryString}`);
  },
};
```

---

## Phase 2: Authentication Flow Integration

### 2.1 Complete Auth Flow
**Time:** 2 hours  
**Priority:** Critical

**Login Action:**
```typescript
// app/routes/_auth/login.tsx
import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { authService } from "~/services/auth.service";
import { TokenManager } from "~/utils/auth/tokenManager";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  try {
    const response = await authService.login({ email, password });
    
    // Store tokens
    TokenManager.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });
    
    // Redirect based on user role
    const redirectPath = getRedirectPath(response.user.role);
    return redirect(redirectPath);
  } catch (error) {
    if (error instanceof APIError) {
      return {
        error: error.message,
        status: error.status,
      };
    }
    
    return {
      error: "An unexpected error occurred",
      status: 500,
    };
  }
}

function getRedirectPath(role: string): string {
  switch (role) {
    case "househelp":
      return "/househelp/profile";
    case "household":
      return "/household/profile";
    case "bureau":
      return "/bureau/home";
    default:
      return "/";
  }
}
```

**Protected Loader Pattern:**
```typescript
// app/routes/household/profile.tsx
import type { Route } from "./+types/profile";
import { requireAuth } from "~/utils/auth/requireAuth";
import { profileService } from "~/services/profile.service";

export async function loader({ request }: Route.LoaderArgs) {
  // Ensure user is authenticated
  const token = await requireAuth(request);
  
  try {
    // Get current user
    const user = await authService.getCurrentUser();
    
    // Get profile
    const profile = await profileService.getHouseholdProfile(user.id);
    
    return { user, profile };
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      // Profile not found - redirect to profile setup
      throw redirect("/profile-setup/household");
    }
    
    throw error;
  }
}
```

---

### 2.2 Google OAuth Integration
**Time:** 1 hour  
**Priority:** High

**Google Sign-In Flow:**
```typescript
// app/routes/_auth/google-callback.tsx
import type { Route } from "./+types/google-callback";
import { redirect } from "react-router";
import { authService } from "~/services/auth.service";
import { TokenManager } from "~/utils/auth/tokenManager";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  
  if (!code) {
    return redirect("/login?error=oauth_failed");
  }
  
  try {
    // Complete Google OAuth flow
    const response = await authService.completeGoogleSignup(code, state);
    
    // Store tokens
    TokenManager.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });
    
    // Redirect to appropriate dashboard
    const redirectPath = getRedirectPath(response.user.role);
    return redirect(redirectPath);
  } catch (error) {
    return redirect("/login?error=oauth_failed");
  }
}
```

---

## Phase 3: Error Handling & Retry Logic

### 3.1 Global Error Handler
**Time:** 1 hour  
**Priority:** High

**Error Handler Middleware:**
```typescript
// app/utils/api/errorHandler.ts
import { APIError } from "~/utils/api/client";
import { TokenManager } from "~/utils/auth/tokenManager";

export async function handleAPIError(error: unknown, retry?: () => Promise<any>) {
  if (error instanceof APIError) {
    // Handle specific error codes
    switch (error.status) {
      case 401:
        // Unauthorized - clear tokens and redirect to login
        TokenManager.clearTokens();
        throw redirect("/login?error=session_expired");
      
      case 403:
        // Forbidden - user doesn't have permission
        throw new Response("Forbidden", { status: 403 });
      
      case 404:
        // Not found
        throw new Response("Not Found", { status: 404 });
      
      case 422:
        // Validation error - return to form
        return {
          error: error.message,
          details: error.details,
        };
      
      case 429:
        // Rate limited - retry after delay
        if (retry) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return retry();
        }
        throw new Response("Too Many Requests", { status: 429 });
      
      case 500:
      case 502:
      case 503:
        // Server error - show error page
        throw new Response("Server Error", { status: error.status });
      
      default:
        throw error;
    }
  }
  
  // Unknown error
  throw error;
}
```

---

## Phase 4: Real-time Communication (Optional)

### 4.1 WebSocket Integration
**Time:** 2-3 hours  
**Priority:** Low (Future Enhancement)

**WebSocket Client:**
```typescript
// app/utils/websocket/client.ts
import { TokenManager } from "~/utils/auth/tokenManager";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  constructor(private url: string) {}
  
  connect() {
    const token = TokenManager.getAccessToken();
    const wsUrl = `${this.url}?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.reconnect();
    };
  }
  
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }
  
  private handleMessage(message: any) {
    // Emit custom events based on message type
    window.dispatchEvent(new CustomEvent("ws-message", { detail: message }));
  }
  
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  disconnect() {
    this.ws?.close();
  }
}
```

---

## Phase 5: Deployment Architecture

### 5.1 Docker Compose Setup
**Time:** 1-2 hours  
**Priority:** High

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Frontend
  website:
    build:
      context: ./website
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=http://auth:8080
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    depends_on:
      - auth
    networks:
      - homexpert-network
    restart: unless-stopped

  # Backend
  auth:
    build:
      context: ./auth
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - homexpert-network
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - homexpert-network
    restart: unless-stopped

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - homexpert-network
    restart: unless-stopped

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - website
      - auth
    networks:
      - homexpert-network
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:

networks:
  homexpert-network:
    driver: bridge
```

---

### 5.2 Nginx Configuration
**Time:** 1 hour  
**Priority:** High

**nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server website:3000;
    }

    upstream backend {
        server auth:8080;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    server {
        listen 80;
        server_name homexpert.co.ke www.homexpert.co.ke;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name homexpert.co.ke www.homexpert.co.ke;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security Headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API Routes
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Login endpoint - stricter rate limit
        location /api/v1/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Frontend Routes
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Static Assets - Cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## Testing Integration

### Integration Test Example
```typescript
// e2e/integration/auth-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Auth Integration", () => {
  test("complete login flow", async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    
    // Fill form
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for API call
    const response = await page.waitForResponse(
      (res) => res.url().includes("/api/v1/auth/login") && res.status() === 200
    );
    
    // Verify response
    const data = await response.json();
    expect(data).toHaveProperty("accessToken");
    expect(data).toHaveProperty("user");
    
    // Verify redirect
    await expect(page).toHaveURL(/\/household\/profile/);
  });
});
```

---

## Environment Variables Summary

### Frontend (.env)
```bash
NODE_ENV=production
API_BASE_URL=https://api.homexpert.co.ke
GOOGLE_CLIENT_ID=your-google-client-id
SENTRY_DSN=your-sentry-dsn
ENABLE_ANALYTICS=true
```

### Backend (.env)
```bash
# Server
PORT=8080
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=homexpert
DB_PASSWORD=secure-password
DB_NAME=homexpert_db

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_ACCESS_SECRET=your-strong-secret
JWT_REFRESH_SECRET=your-strong-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
ALLOWED_ORIGINS=https://homexpert.co.ke,https://www.homexpert.co.ke

# Encryption
ENCRYPTION_KEY=your-32-byte-key
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Load balancer configured
- [ ] CDN configured (optional)
- [ ] DNS records updated
- [ ] Firewall rules configured
- [ ] Logging centralized
- [ ] Alerts configured

---

## Next Steps

1. **Immediate:** Set up API client and type definitions
2. **Week 1:** Implement authentication flow
3. **Week 2:** Add error handling and retry logic
4. **Week 3:** Deploy with Docker Compose
5. **Week 4:** Production testing and monitoring

**The integration is ready to go live!** 🔗
