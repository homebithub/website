import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import {
  cacheAuthSession,
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredUser,
  normalizeProfileType,
} from "~/utils/authStorage";
import { resolveProfileSetupDestination } from '~/utils/profileSetupRouting';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function genericResponseBodyToJs(response: any) {
  const body = response?.getBody?.();
  if (body?.toJavaScript) return body.toJavaScript();
  if (body?.toObject) return body.toObject();
  return body || response || {};
}

function normalizeLoginUser(raw: any, fallbackPhone = '') {
  const userId = raw?.getId?.() || raw?.id || raw?.user_id || raw?.userId || raw?.auth_id || raw?.authId || '';
  return {
    id: userId,
    user_id: userId,
    email: raw?.getEmail?.() || raw?.email || '',
    phone: raw?.getPhone?.() || raw?.phone || raw?.phone_number || raw?.phoneNumber || fallbackPhone,
    first_name: raw?.getFirstName?.() || raw?.first_name || raw?.firstName || '',
    last_name: raw?.getLastName?.() || raw?.last_name || raw?.lastName || '',
    profile_type: raw?.getProfileType?.() || raw?.profile_type || raw?.profileType || '',
    profile_id: raw?.getProfileId?.() || raw?.profile_id || raw?.profileId || '',
    user_profile_id: raw?.getUserProfileId?.() || raw?.user_profile_id || raw?.userProfileId || '',
    is_verified: Boolean(raw?.getIsVerified?.() || raw?.is_verified || raw?.isVerified || false),
    profile_image: raw?.getProfileImage?.() || raw?.profile_image || raw?.profileImage || '',
  };
}

function normalizeVerificationState(raw: any, userId: string, target: string) {
  return {
    id: raw?.id || raw?.verification_id || raw?.verificationId || '',
    user_id: raw?.user_id || raw?.userId || userId,
    type: raw?.type || raw?.verification_type || raw?.verificationType || 'phone',
    status: raw?.status || 'pending',
    target: raw?.target || target,
    expires_at: raw?.expires_at || raw?.expiresAt || '',
    next_resend_at: raw?.next_resend_at || raw?.nextResendAt || '',
    attempts: Number(raw?.attempts ?? 0),
    max_attempts: Number(raw?.max_attempts ?? raw?.maxAttempts ?? 3),
    resends: Number(raw?.resends ?? 0),
    max_resends: Number(raw?.max_resends ?? raw?.maxResends ?? 3),
    created_at: raw?.created_at || raw?.createdAt || '',
    updated_at: raw?.updated_at || raw?.updatedAt || '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Public routes that don't need auth check
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email', '/household-choice', '/join-household', '/pending-approval', '/profile-setup', '/about', '/services', '/contact', '/pricing', '/terms', '/privacy', '/cookies', '/debug'];
    return publicPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const performLogout = useCallback(async ({
    redirectTo = "/",
  }: {
    redirectTo?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      try {
        const { default: authService } = await import('~/services/grpc/auth.service');
        await authService.logout();
      } catch {
      }

      clearStoredAuthSession();

      setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      } else {
        navigate(redirectTo);
      }
    } catch (logoutError: any) {
      setError(logoutError.message || "An error occurred during logout");
      throw logoutError;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const token = getStoredAccessToken() || null;
      const cachedUser = getStoredUser();
      const shouldUseCachedUserOnly = location.pathname === '/profile';

      if (cachedUser && token) {
        setUser({ token, user: cachedUser } as unknown as LoginResponse);
        setLoading(false);
        return;
      }

      if (isPublicRoute() || shouldUseCachedUserOnly) {
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { default: authService } = await import('~/services/grpc/auth.service');
      const userProto = await authService.getCurrentUser();

      const user = {
        id: userProto?.getId?.() || '',
        user_id: userProto?.getId?.() || '',
        email: userProto?.getEmail?.() || '',
        phone: userProto?.getPhone?.() || '',
        first_name: userProto?.getFirstName?.() || '',
        last_name: userProto?.getLastName?.() || '',
        profile_type: userProto?.getProfileType?.() || '',
        is_verified: userProto?.getIsVerified?.() || false,
        profile_image: userProto?.getProfileImage?.() || '',
      };
      
      setUser({ token: token || "", user } as unknown as LoginResponse);
      cacheAuthSession({ token: token || "", user });

      // Check for pending household join requests on page load/refresh
      const profileType = normalizeProfileType(user.profile_type);
      if (profileType === 'household' && !isPublicRoute()) {
        try {
          const destination = await resolveProfileSetupDestination({
            userId: user.id,
            profileType,
            completedPath: '/',
          });

          if (destination === '/pending-approval' && location.pathname !== '/pending-approval') {
            navigate('/pending-approval');
            return;
          }

          if (destination === '/household/profile' && location.pathname !== '/household/profile') {
            navigate('/household/profile');
            return;
          }
        } catch (err: any) {
          // Error checking profile setup, continue normally
        }
      }
    } catch (error: any) {
      console.error("Error checking auth:", error);
      // Only clear auth state on explicit UNAUTHENTICATED errors (gRPC code 16).
      // Transient errors (network, unavailable, internal) should NOT log the user out.
      const isUnauthenticated = error?.code === 16 ||
        error?.message?.includes('UNAUTHENTICATED') ||
        error?.message?.includes('Authentication required');
      if (isUnauthenticated) {
        setUser(null);
        clearStoredAuthSession();
      }
      // For transient errors, keep the cached user state from cookies/localStorage
      // that was set earlier in this function (lines 41-53).
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedPhone = normalizeKenyanPhoneNumber(phone);
      const { default: authService } = await import('~/services/grpc/auth.service');
      const loginResponse = await authService.login(normalizedPhone.replace(/^\+/, ''), password);

      const responseBody = genericResponseBodyToJs(loginResponse);
      const userData = normalizeLoginUser(
        loginResponse.getUser?.() || responseBody.user || responseBody,
        normalizedPhone.replace(/^\+/, ''),
      );
      const authId = responseBody.auth_id || responseBody.authId || responseBody.user_id || responseBody.userId || userData.user_id;

      if (!authId) {
        throw new Error('Login response is missing verification details.');
      }

      const profileType = normalizeProfileType(userData.profile_type || "");

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user_id', authId);
      }

      navigate('/verify-otp', {
        state: {
          verification: normalizeVerificationState(
            responseBody.verification || responseBody.data?.verification,
            authId,
            normalizedPhone.replace(/^\+/, ''),
          ),
          profileType,
          profileId: responseBody.profile_id || responseBody.profileId || userData.profile_id || '',
          userProfileId: responseBody.user_profile_id || responseBody.userProfileId || userData.user_profile_id || '',
          redirectTo: '/',
        },
      });
      return;
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred during login";
      setError(transformErrorMessage(errorMsg));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);

      const { default: authSvc } = await import('~/services/grpc/auth.service');
      const signupResponse = await authSvc.signup(email, password, firstName, lastName, 'household');
      
      const token = signupResponse?.getToken?.() || "";
      const refreshToken = signupResponse?.getRefreshToken?.() || "";
      const userProto = signupResponse?.getUser?.();
      const user = userProto?.toObject?.() || {};

      cacheAuthSession({ token, refreshToken, user });
      setUser({ token, user } as unknown as LoginResponse);
      
      migratePreferences().catch(err => console.error("Failed to migrate preferences:", err));
      navigate("/");
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred during signup";
      setError(transformErrorMessage(errorMsg));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await performLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
