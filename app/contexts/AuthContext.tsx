import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import { clearAuthCookies, getAuthFromCookies, getAccessTokenFromCookies, setAuthCookies } from "~/utils/cookie";

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
  const navigate = useNavigate();

  // Public routes that don't need auth check
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email', '/household-choice', '/join-household', '/profile-setup', '/about', '/services', '/contact', '/pricing', '/terms', '/privacy', '/cookies'];
    return publicPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const { token: cookieToken, user: cookieUser } = getAuthFromCookies();
      const legacyToken = typeof window !== "undefined" ? getAccessTokenFromCookies() : null;
      const token = cookieToken || legacyToken;

      if (cookieUser) {
        setUser({ token: token || "", user: cookieUser } as unknown as LoginResponse);
        localStorage.setItem("user_object", JSON.stringify(cookieUser));
      } else {
        const rawUser = localStorage.getItem("user_object");
        if (rawUser && token) {
          try {
            const parsedUser = JSON.parse(rawUser);
            setUser({ token, user: parsedUser } as unknown as LoginResponse);
          } catch {
            // Ignore malformed cache
          }
        }
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
      setAuthCookies(token || "", null, user);
      localStorage.setItem("token", token || "");
      localStorage.setItem("user_object", JSON.stringify(user));
    } catch (error: any) {
      console.error("Error checking auth:", error);
      // Only clear auth state on explicit UNAUTHENTICATED errors (gRPC code 16).
      // Transient errors (network, unavailable, internal) should NOT log the user out.
      const isUnauthenticated = error?.code === 16 ||
        error?.message?.includes('UNAUTHENTICATED') ||
        error?.message?.includes('Authentication required');
      if (isUnauthenticated) {
        setUser(null);
        clearAuthCookies();
        localStorage.removeItem("token");
        localStorage.removeItem("user_object");
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

      setAuthCookies(token, refreshToken, userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user_object", JSON.stringify(userData));
      
      const profileType = userData.profile_type || "";
      localStorage.setItem("profile_type", profileType);
      localStorage.setItem("userType", profileType);
      
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
        if (result.requiresConfirmation) {
          console.log('[Device] New device registered, confirmation email sent');
        }
      } catch (deviceError) {
        console.error('[Device] Registration failed after login:', deviceError);
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
          const { default: profileSetupService } = await import('~/services/grpc/profileSetup.service');
          const progressData = await profileSetupService.getProgress(userData.id, profileType);

          if (progressData) {
            const totalSteps = progressData.total_steps || 0;
            const lastStep = progressData.last_completed_step || 0;
            const setupStatus = progressData.status || "";
          
            const isComplete = setupStatus === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

            if (isComplete) {
              // Redirect completed users to home page instead of profile
              navigate('/');
              return;
            }

            if (profileType === 'household' && lastStep === 0) {
              navigate('/household-choice');
              return;
            }
            const setupRoute = profileType === "household" 
              ? `/profile-setup/household?step=${lastStep + 1}`
              : `/profile-setup/househelp?step=${lastStep + 1}`;
            navigate(setupRoute);
            return;
          }
        } catch (err: any) {
          // gRPC NOT_FOUND means no profile setup record
          if (err.message?.includes('not found') || err.message?.includes('NOT_FOUND')) {
            if (profileType === 'household') {
              navigate('/household-choice');
              return;
            }
            navigate('/profile-setup/househelp?step=1');
            return;
          }
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

      setAuthCookies(token, refreshToken, user);
      localStorage.setItem("token", token);
      localStorage.setItem("user_object", JSON.stringify(user));
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
    try {
      setLoading(true);
      setError(null);

      try {
        const { default: authService } = await import('~/services/grpc/auth.service');
        await authService.logout();
      } catch (error) {
        console.log("Server logout failed, but clearing local state");
      }

      // Remove the current device from the backend (non-blocking)
      try {
        const { getDeviceId } = await import('~/utils/deviceFingerprint');
        const { deviceService } = await import('~/services/grpc/device.service');
        const deviceId = await getDeviceId();
        const userObj = JSON.parse(localStorage.getItem('user_object') || '{}');
        const userId = userObj.user_id || userObj.id || '';
        if (deviceId && userId) {
          await deviceService.revokeDevice(deviceId, userId, 'logout');
        }
      } catch (deviceError) {
        console.log('[Device] Removal on logout failed:', deviceError);
      }

      clearAuthCookies();
      localStorage.removeItem("token");
      localStorage.removeItem("user_object");
      localStorage.removeItem("userType");
      localStorage.removeItem("profile_type");
      localStorage.removeItem("device_id");

      setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during logout");
      throw error;
    } finally {
      setLoading(false);
    }
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
