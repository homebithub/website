// Authentication utilities for route protection
import { API_ENDPOINTS } from '~/config/api';

export interface AuthUser {
  token: string;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_type: string;
    email?: string;
    role?: string;
  };
}

// Check if user is authenticated by verifying token (server-side)
export async function checkAuthentication(request?: Request): Promise<AuthUser | null> {
  try {
    let token: string | null = null;
    
    if (request) {
      // Server-side: get token from Authorization header
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    } else {
      // Client-side: get token from localStorage
      if (typeof window !== 'undefined') {
        token = localStorage.getItem("token");
      }
    }

    if (!token) {
      return null;
    }

    const response = await fetch(API_ENDPOINTS.auth.me, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return { token, user: userData };
    } else {
      // Token is invalid, clear it (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        localStorage.removeItem("user_object");
      }
      return null;
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    // Clear invalid token on error (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("user_object");
    }
    return null;
  }
}

// Get user from localStorage (for client-side checks)
export function getCurrentUser(): AuthUser | null {
  try {
    if (typeof window === 'undefined') {
      return null; // Server-side
    }
    
    const token = localStorage.getItem("token");
    const userObject = localStorage.getItem("user_object");
    
    if (!token || !userObject) {
      return null;
    }

    const user = JSON.parse(userObject);
    return { token, user };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Check if user has required role
export function hasRequiredRole(user: AuthUser | null, requiredRoles?: string[]): boolean {
  if (!user || !requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement
  }
  
  return requiredRoles.includes(user.user.role || '');
}

// Redirect to login with return URL
export function redirectToLogin(returnUrl?: string): string {
  const loginUrl = '/login';
  if (returnUrl && returnUrl !== '/login') {
    return `${loginUrl}?redirect=${encodeURIComponent(returnUrl)}`;
  }
  return loginUrl;
}

// Redirect authenticated users away from auth pages
export function redirectAuthenticatedUser(): string {
  // Try to get profile_type from localStorage
  try {
    const userObj = localStorage.getItem("user_object");
    if (userObj) {
      const parsed = JSON.parse(userObj);
      const profileType = parsed.profile_type;
      if (profileType === "household") return "/household";
      if (profileType === "househelp") return "/househelp";
      if (profileType === "bureau") return "/bureau";
    }
  } catch {}
  return "/";
}

// Extract token from request headers (server-side)
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
} 