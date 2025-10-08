import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/types/users";
import { API_ENDPOINTS, API_BASE_URL, AUTH_API_BASE_URL } from '~/config/api';
import { migratePreferences } from '~/utils/preferencesApi';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("not token found in local storage")
        return;
      }
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setUser(user);
      }else{
        console.log("not logged in")
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

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password } as LoginRequest),
      });

      const data: LoginResponse | LoginErrorResponse = await response.json();
      if (!response.ok) {

        throw new Error((data as LoginErrorResponse).message || "Failed to login");
      }

      localStorage.setItem("token", (data as LoginResponse).token);
      const userData = {...data as LoginResponse};
      delete (userData as any).token;
      localStorage.setItem("user_object", JSON.stringify(userData));
      setUser(data as LoginResponse);
      
      // Migrate anonymous preferences to user account
      migratePreferences().catch(err => {
        console.error("Failed to migrate preferences:", err);
        // Don't block login if migration fails
      });
      
      // Redirect to specific dashboard based on profile_type
      const profileType = userData.profile_type;
      console.log("User data after login:", userData);
      console.log("Profile type:", profileType);

      // Bureau users should not login through regular flow
      if (profileType === "bureau") {
        console.log("Bureau user detected, redirecting to home");
        navigate("/");
        return;
      }

      if (profileType === "household" || profileType === "employer") {
        console.log("Redirecting to /household/profile");
        navigate("/household/profile");
      } else if (profileType === "househelp") {
        console.log("Redirecting to /househelp");
        navigate("/househelp");
      } else {
        console.log("No valid profile type found, redirecting to /");
        navigate("/"); // fallback
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

      const response = await fetch(`${AUTH_API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error((data as LoginErrorResponse).message || "Failed to sign up");
      }

      const { token, user } = await response.json();
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

      // Clear user state
      setUser(null);

      // Navigate to home page instead of login to avoid redirect loops
      navigate("/");
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
