import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import { BaseModal } from "~/components/ui/BaseModal";
import {
  cacheAuthSession,
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredUser,
} from "~/utils/authStorage";
import { resolveProfileSetupDestination } from '~/utils/profileSetupRouting';
import { shouldSilenceGatewayError } from "~/services/grpc/client";

const DEVICE_AUTH_CHECK_INTERVAL_MS = 2 * 60 * 1000;
const DEVICE_AUTH_ROUTE_CHECK_COOLDOWN_MS = 60 * 1000;
const DEVICE_REVOKED_REDIRECT_DELAY_MS = 1800;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeviceRevokedModal, setShowDeviceRevokedModal] = useState(false);
  const navigate = useNavigate();
  const lastDeviceAuthCheckAtRef = useRef(0);
  const deviceAuthCheckInFlightRef = useRef(false);
  const deviceRevocationHandledRef = useRef(false);
  const deviceRevocationTimerRef = useRef<number | null>(null);

  const clearDeviceRevocationTimer = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (deviceRevocationTimerRef.current !== null) {
      window.clearTimeout(deviceRevocationTimerRef.current);
      deviceRevocationTimerRef.current = null;
    }
  }, []);

  // Public routes that don't need auth check
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email', '/household-choice', '/join-household', '/pending-approval', '/profile-setup', '/about', '/services', '/contact', '/pricing', '/terms', '/privacy', '/cookies', '/debug'];
    return publicPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      clearDeviceRevocationTimer();
    };
  }, [clearDeviceRevocationTimer]);

  const performLogout = useCallback(async ({
    revokeCurrentDevice = true,
    clearDeviceId = true,
    redirectTo = "/",
  }: {
    revokeCurrentDevice?: boolean;
    clearDeviceId?: boolean;
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

      if (revokeCurrentDevice) {
        try {
          const { getDeviceId } = await import('~/utils/deviceFingerprint');
          const { deviceService } = await import('~/services/grpc/device.service');
          const deviceId = await getDeviceId();
          const userObj = JSON.parse(localStorage.getItem('user_object') || '{}');
          const userId = userObj.user_id || userObj.id || '';
          if (deviceId && userId) {
            await deviceService.revokeDevice(deviceId, userId, 'logout');
          }
        } catch {
        }
      }

      clearStoredAuthSession();
      if (clearDeviceId) {
        localStorage.removeItem("device_id");
      }

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

  const triggerRevokedDeviceLogout = useCallback((message?: string) => {
    if (deviceRevocationHandledRef.current) {
      return;
    }

    deviceRevocationHandledRef.current = true;
    clearDeviceRevocationTimer();
    setError(message || 'This device is no longer authorized for your account.');
    setShowDeviceRevokedModal(true);

    if (typeof window !== "undefined") {
      deviceRevocationTimerRef.current = window.setTimeout(() => {
        void performLogout({
          revokeCurrentDevice: false,
          clearDeviceId: false,
          redirectTo: '/login?device_revoked=1',
        });
      }, DEVICE_REVOKED_REDIRECT_DELAY_MS);
    }
  }, [clearDeviceRevocationTimer, performLogout]);

  const verifyCurrentDeviceAccess = useCallback(async (reason: 'startup' | 'route' | 'interval' | 'visibility') => {
    if (typeof window === "undefined" || deviceAuthCheckInFlightRef.current || deviceRevocationHandledRef.current) {
      return;
    }

    const token = getStoredAccessToken();
    const cachedUser = getStoredUser() as any;
    const currentUser = (user as any)?.user || user || cachedUser;
    const userId = currentUser?.user_id || currentUser?.id || '';

    if (!token || !userId) {
      return;
    }

    if (reason === 'route') {
      const elapsed = Date.now() - lastDeviceAuthCheckAtRef.current;
      if (elapsed < DEVICE_AUTH_ROUTE_CHECK_COOLDOWN_MS) {
        return;
      }
    }

    deviceAuthCheckInFlightRef.current = true;
    try {
      const { getDeviceId } = await import('~/utils/deviceFingerprint');
      const { default: deviceService } = await import('~/services/grpc/device.service');
      const currentDeviceId = await getDeviceId();
      const response = await deviceService.getUserDevices(userId, currentDeviceId);
      const matchingDevice = response.devices.find((device: any) => {
        const responseDeviceId = device.deviceId || device.device_id || '';
        return responseDeviceId === currentDeviceId || Boolean(device.isCurrentDevice || device.is_current_device);
      });

      lastDeviceAuthCheckAtRef.current = Date.now();

      if (!matchingDevice || matchingDevice.status !== 'active') {
        triggerRevokedDeviceLogout('This device has been revoked or is no longer approved. You have been signed out for your security.');
      }
    } catch (deviceError) {
      if (!shouldSilenceGatewayError(deviceError)) {
        console.warn('[DeviceAuth] Failed to verify current device access:', deviceError);
      }
    } finally {
      deviceAuthCheckInFlightRef.current = false;
    }
  }, [user, triggerRevokedDeviceLogout]);

  useEffect(() => {
    if (!user || typeof window === "undefined" || deviceRevocationHandledRef.current) {
      return;
    }

    const runVisibilityCheck = () => {
      if (document.visibilityState === 'visible') {
        void verifyCurrentDeviceAccess('visibility');
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void verifyCurrentDeviceAccess('interval');
      }
    }, DEVICE_AUTH_CHECK_INTERVAL_MS);

    document.addEventListener('visibilitychange', runVisibilityCheck);
    void verifyCurrentDeviceAccess('startup');

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', runVisibilityCheck);
    };
  }, [user, verifyCurrentDeviceAccess]);

  useEffect(() => {
    if (!user || typeof window === "undefined" || deviceRevocationHandledRef.current) {
      return;
    }

    const runRouteCheck = () => {
      void verifyCurrentDeviceAccess('route');
    };

    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(runRouteCheck, { timeout: 1500 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(runRouteCheck, 400);
    return () => globalThis.clearTimeout(timeoutId);
  }, [location.pathname, user, verifyCurrentDeviceAccess]);

  useEffect(() => {
    if (user) {
      deviceRevocationHandledRef.current = false;
      setShowDeviceRevokedModal(false);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const token = getStoredAccessToken() || null;
      const cachedUser = getStoredUser();

      if (cachedUser && token) {
        setUser({ token, user: cachedUser } as unknown as LoginResponse);
      }

      if (isPublicRoute()) {
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
      const profileType = user.profile_type;
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
      
      // Use gRPC-Web instead of REST
      const { default: authService } = await import('~/services/grpc/auth.service');
      const loginResponse = await authService.login(normalizedPhone, password);

      // Extract data from gRPC response
      const token = loginResponse.getToken();
      const refreshToken = loginResponse.getRefreshToken();
      const userProto = loginResponse.getUser();
      
      // Convert gRPC User to plain object
      const userData = {
        id: userProto?.getId() || "",
        user_id: userProto?.getId() || "",
        email: userProto?.getEmail() || "",
        phone: userProto?.getPhone() || "",
        first_name: userProto?.getFirstName() || "",
        last_name: userProto?.getLastName() || "",
        profile_type: userProto?.getProfileType() || "",
        is_verified: userProto?.getIsVerified() || false,
        profile_image: userProto?.getProfileImage() || "",
      };
      cacheAuthSession({
        token,
        refreshToken,
        user: userData,
        provider: "password",
      });
      
      const profileType = userData.profile_type || "";
      
      setUser({ token, user: userData } as unknown as LoginResponse);
      
      migratePreferences().catch(err => console.error("Failed to migrate preferences:", err));

      // Register device after successful login (non-blocking, before navigate)
      try {
        const { getDeviceId, getDeviceName } = await import('~/utils/deviceFingerprint');
        const { default: deviceService } = await import('~/services/grpc/device.service');
        const deviceId = await getDeviceId();
        const result = await deviceService.registerDevice(
          userData.user_id, deviceId, getDeviceName(), navigator.userAgent, ''
        );
      } catch (deviceError) {
        console.warn('[Device] Registration failed after login:', deviceError);
      }

      // If user has no phone number, redirect to add-phone page
      if (!userData.phone) {
        navigate('/add-phone', {
          replace: true,
          state: {
            user_id: userData.id,
            profileType,
            redirectTo: '/',
          },
        });
        return;
      }

      if (profileType === "bureau") {
        navigate("/");
        return;
      }

      if (profileType === "household" || profileType === "househelp") {
        try {
          const destination = await resolveProfileSetupDestination({
            userId: userData.id,
            profileType,
            completedPath: '/',
          });
          navigate(destination);
          return;
        } catch (err: any) {
          console.error('Failed to check profile setup status:', err);
        }
      }

      navigate("/");
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
      <BaseModal
        isOpen={showDeviceRevokedModal}
        onClose={() => {}}
        title="Device Access Removed"
        description="Your device is no longer approved for this account. We’re signing you out to keep your account secure."
        showCloseButton={false}
        closeOnOutsideClick={false}
        size="sm"
      >
        <div className="space-y-4 px-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            This device was removed from your allowed devices list or is no longer active.
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-purple-200/70 bg-purple-50/70 px-4 py-3 text-sm text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Logging you out automatically...
          </div>
        </div>
      </BaseModal>
    </AuthContext.Provider>
  );
}
