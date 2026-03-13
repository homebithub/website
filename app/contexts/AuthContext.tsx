import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import { clearAuthCookies, getAuthFromCookies, setAuthCookies } from "~/utils/cookie";
import { API_BASE_URL, API_ENDPOINTS } from "~/config/api";

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
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email', '/about', '/services', '/contact', '/pricing', '/terms', '/privacy', '/cookies'];
    return publicPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const { token: cookieToken, user: cookieUser } = getAuthFromCookies();
      const legacyToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

      const meResponse = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meResponse.ok) {
        throw new Error("Failed to verify session");
      }

      const meData = await meResponse.json();
      const user = meData.data || meData.user || meData;
      
      setUser({ token: token || "", user } as unknown as LoginResponse);
      setAuthCookies(token || "", null, user);
      localStorage.setItem("token", token || "");
      localStorage.setItem("user_object", JSON.stringify(user));
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      clearAuthCookies();
      localStorage.removeItem("token");
      localStorage.removeItem("user_object");
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

      if (profileType === "bureau") {
        navigate("/");
        return;
      }

      if (profileType === "household" || profileType === "househelp") {
        try {
          const setupResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (setupResponse.ok) {
            const setupData = await setupResponse.json();
            const progressData = setupData.data || {};
            const totalSteps = progressData.total_steps || 0;
            const lastStep = progressData.last_completed_step || 0;
            const status = progressData.status || "";
          
            const isComplete = status === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

            if (!isComplete) {
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
          } else if (setupResponse.status === 404) {
            if (profileType === 'household') {
              navigate('/household-choice');
              return;
            }
            navigate('/profile-setup/househelp?step=1');
            return;
          }
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

      const signupResult = await fetch(API_ENDPOINTS.auth.signup, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      });

      if (!signupResult.ok) {
        const errorBody = await signupResult.json().catch(() => null);
        throw new Error(extractErrorMessage(errorBody) || "Signup failed");
      }

      const signupResponse = await signupResult.json();
      const data = (signupResponse as any).data || signupResponse;
      
      const token = (data as any).token?.stringValue || (data as any).token || "";
      const refreshToken = (data as any).refresh_token?.stringValue || (data as any).refresh_token || "";
      const user = (data as any).user?.structValue?.fields || (data as any).user || {};

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
        const { token } = getAuthFromCookies();
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });
      } catch (error) {
        console.log("Server logout failed, but clearing local state");
      }

      clearAuthCookies();
      localStorage.removeItem("token");
      localStorage.removeItem("user_object");
      localStorage.removeItem("userType");
      localStorage.removeItem("profile_type");

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
