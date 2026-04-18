// Authentication utilities for route protection
import {
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredProfileType,
  getStoredUser,
} from '~/utils/authStorage';

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

function toAuthUserShape(raw: Record<string, any>): AuthUser["user"] {
  return {
    user_id: raw.user_id || raw.id || "",
    first_name: raw.first_name || raw.firstName || "",
    last_name: raw.last_name || raw.lastName || "",
    phone: raw.phone || "",
    profile_type: raw.profile_type || raw.role || "",
    email: raw.email || undefined,
    role: raw.role || undefined,
  };
}

// Check if user is authenticated by verifying token (server-side)
export async function checkAuthentication(request?: Request): Promise<AuthUser | null> {
  try {
    const token = request ? getTokenFromRequest(request) : getStoredAccessToken() || null;
    const cachedUser = getStoredUser();
    
    if (!token) {
      return null;
    }

    if (cachedUser) {
      return { token, user: toAuthUserShape(cachedUser) };
    }

    if (typeof window === "undefined") {
      return null;
    }

    const { default: authService } = await import("~/services/grpc/auth.service");
    const userProto = await authService.getCurrentUser();
    const userData = {
      user_id: userProto?.getId?.() || "",
      first_name: userProto?.getFirstName?.() || "",
      last_name: userProto?.getLastName?.() || "",
      phone: userProto?.getPhone?.() || "",
      profile_type: userProto?.getProfileType?.() || "",
      email: userProto?.getEmail?.() || "",
    };

    return { token, user: toAuthUserShape(userData) };
  } catch (error) {
    console.error("Error checking authentication:", error);
    if (typeof window !== 'undefined') {
      clearStoredAuthSession();
    }
    return null;
  }
}

// Get user from localStorage (for client-side checks)
export function getCurrentUser(): AuthUser | null {
  try {
    const token = getStoredAccessToken();
    const user = getStoredUser();
    
    if (!token || !user) {
      return null;
    }

    return { token, user: toAuthUserShape(user) };
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
  const profileType = getStoredProfileType();
  if (profileType === "household") return "/household";
  if (profileType === "househelp") return "/househelp";
  if (profileType === "bureau") return "/bureau";
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
