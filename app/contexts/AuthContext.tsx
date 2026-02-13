import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { API_ENDPOINTS, API_BASE_URL, AUTH_API_BASE_URL } from '~/config/api';
import { migratePreferences } from '~/utils/preferencesApi';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";

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
      const token = localStorage.getItem("token");
      // Always hydrate from localStorage to avoid guest UI on public pages
      const userObj = localStorage.getItem("user_object");
      if (userObj) {
        try {
          const parsedUser = JSON.parse(userObj);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse user_object from localStorage:", e);
        }
      }

      // Skip server verification on public routes
      if (isPublicRoute()) {
        setLoading(false);
        return;
      }

      if (!token) {
        console.log("not token found in local storage")
        setLoading(false);
        return;
      }

      // Verify with the server on non-public routes
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const userResponse = await response.json();
        console.log('Auth check response:', userResponse);
        
        // Extract user data from nested structure
        const user = userResponse.data || userResponse;
        console.log('Extracted user data in auth check:', user);
        
        setUser({ token: localStorage.getItem("token") || "", user } as LoginResponse);
        localStorage.setItem("user_object", JSON.stringify(user));
      } else {
        console.log("not logged in")
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user_object");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Normalize phone number to international format
      const normalizedPhone = normalizeKenyanPhoneNumber(phone);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: normalizedPhone, password } as LoginRequest),
      });

      const dataResponse = await response.json();
      console.log('Login response:', dataResponse);
      
      // Extract login data from nested structure
      const data = dataResponse.data || dataResponse;
      console.log('Extracted login data:', data);
      
      if (!response.ok) {
        const rawMsg = extractErrorMessage(data);
        const errorMsg = rawMsg ? transformErrorMessage(rawMsg) : "Invalid phone number or password. Please check and try again.";
        throw new Error(errorMsg);
      }

      localStorage.setItem("token", (data as LoginResponse).token);
      const userData = (data as LoginResponse).user;
      localStorage.setItem("user_object", JSON.stringify(userData));
      localStorage.setItem("profile_type", userData.profile_type || "");
      setUser(data as LoginResponse);
      
      // Migrate anonymous preferences to user account
      migratePreferences().catch(err => {
        console.error("Failed to migrate preferences:", err);
        // Don't block login if migration fails
      });
      
      // Redirect to specific dashboard based on profile_type
      const profileType = userData.profile_type;
      try { localStorage.setItem("userType", profileType || ""); } catch {}
      console.log("User data after login:", userData);
      console.log("Redirecting to home with profile type:", profileType);

      // Bureau users should not login through regular flow
      if (profileType === "bureau") {
        console.log("Bureau user detected, redirecting to home");
        navigate("/");
        return;
      }

      // Check if profile setup is complete
      if (profileType === "household" || profileType === "househelp") {
        try {
          const setupResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
            headers: {
              'Authorization': `Bearer ${(data as LoginResponse).token}`
            }
          });

          if (setupResponse.ok) {
            const setupData = await setupResponse.json();
            // Handle response structure: { data: { last_completed_step: ..., status: ... } }
            const progressData = setupData.data || {};
            const isComplete = progressData.status === 'completed';
            const lastStep = progressData.last_completed_step || 0;

            console.log("Profile setup status:", { isComplete, lastStep });

            if (!isComplete) {
              // Redirect to profile setup at the last completed step
              const setupRoute = profileType === "household" 
                ? `/profile-setup/household?step=${lastStep + 1}`
                : `/profile-setup/househelp?step=${lastStep + 1}`;
              
              console.log("Profile incomplete, redirecting to:", setupRoute);
              navigate(setupRoute);
              return;
            }
          } else if (setupResponse.status === 404) {
            // No profile setup record exists - user hasn't started setup
            console.log("No profile setup record found, starting from step 1");
            const setupRoute = profileType === "household" 
              ? `/profile-setup/household?step=1`
              : `/profile-setup/househelp?step=1`;
            navigate(setupRoute);
            return;
          }
        } catch (err) {
          console.error("Failed to check profile setup status:", err);
          // Continue to home if check fails
        }
      }

      // Profile is complete or setup check failed, redirect to home
      if (profileType === "household" || profileType === "household") {
        console.log("Redirecting to /");
        navigate("/");
      } else if (profileType === "househelp") {
        console.log("Redirecting to /");
        navigate("/");
      } else {
        console.log("No valid profile type found, redirecting to /");
        navigate("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log('Signup error response:', errorResponse);
        
        // Extract error data from nested structure
        const errorData = errorResponse.data || errorResponse;
        console.log('Extracted signup error data:', errorData);
        
        const errorMsg = extractErrorMessage(errorData) || "Failed to sign up";
        throw new Error(errorMsg);
      }

      const signupResponse = await response.json();
      console.log('Signup success response:', signupResponse);
      
      // Extract signup data from nested structure
      const signupData = signupResponse.data || signupResponse;
      console.log('Extracted signup data:', signupData);
      
      const { token, user } = signupData;
      localStorage.setItem("token", token);
      setUser(user);
      
      // Migrate anonymous preferences to user account
      migratePreferences().catch(err => {
        console.error("Failed to migrate preferences:", err);
        // Don't block signup if migration fails
      });
      
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to call logout endpoint (optional - for server-side cleanup)
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        // Ignore server logout errors - we'll still clear local state
        console.log("Server logout failed, but clearing local state");
      }

      // Clear all auth-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user_object");
      localStorage.removeItem("userType");

      // Clear user state
      setUser(null);

      // Force full page reload to ensure unauthenticated homepage is shown
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
