import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { API_ENDPOINTS, API_BASE_URL, AUTH_API_BASE_URL } from '~/config/api';
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import { transport, getGrpcMetadata, handleGrpcError } from "~/utils/grpcClient";
import { AuthServiceClient, ProfileSetupServiceClient } from "~/proto/auth/auth.client";

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

  const authClient = useMemo(() => new AuthServiceClient(transport), []);
  const profileSetupClient = useMemo(() => new ProfileSetupServiceClient(transport), []);

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
      const token = localStorage.getItem("token");
      const userObj = localStorage.getItem("user_object");
      if (userObj) {
        try {
          const parsedUser = JSON.parse(userObj);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse user_object from localStorage:", e);
        }
      }

      if (isPublicRoute()) {
        setLoading(false);
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

      const { response: userResponse } = await authClient.getCurrentUser({}, { metadata: getGrpcMetadata() });
      const user = userResponse.data?.fields ? userResponse.data.fields : userResponse;
      
      setUser({ token: localStorage.getItem("token") || "", user } as unknown as LoginResponse);
      localStorage.setItem("user_object", JSON.stringify(user));
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
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
      const { response: dataResponse } = await authClient.login({ phone: normalizedPhone, password }, { metadata: getGrpcMetadata(false) });
      
      const data = dataResponse.data?.fields || dataResponse;
      const token = (data as any).token?.stringValue || (data as any).token || "";
      const userData = (data as any).user?.structValue?.fields || (data as any).user || {};

      localStorage.setItem("token", token);
      localStorage.setItem("user_object", JSON.stringify(userData));
      
      const profileType = userData.profile_type?.stringValue || userData.profile_type || "";
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
          const { response: setupData } = await profileSetupClient.getProgress({ userId: (userData.id?.stringValue || userData.id) }, { metadata: { authorization: `Bearer ${token}` } });
          const progressData = setupData.data?.fields || {};
          const totalSteps = progressData.total_steps?.numberValue || 0;
          const lastStep = progressData.last_completed_step?.numberValue || 0;
          const status = progressData.status?.stringValue || "";
          
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
        } catch (err: any) {
          if (err.code === 'NOT_FOUND' || err.status === 5) {
            if (profileType === 'household') {
              navigate('/household-choice');
              return;
            }
            navigate('/profile-setup/househelp?step=1');
            return;
          }
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

      const { response: signupResponse } = await authClient.signup({ email, password, firstName, lastName }, { metadata: getGrpcMetadata(false) });
      const data = signupResponse.data?.fields || signupResponse;
      
      const token = (data as any).token?.stringValue || (data as any).token || "";
      const user = (data as any).user?.structValue?.fields || (data as any).user || {};

      localStorage.setItem("token", token);
      localStorage.setItem("user_object", JSON.stringify(user));
      setUser(user as any);
      
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
        await authClient.logout({}, { metadata: getGrpcMetadata() });
      } catch (error) {
        console.log("Server logout failed, but clearing local state");
      }

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
