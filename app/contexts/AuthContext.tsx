import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "../types/users";

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
      const response = await fetch("http://localhost:8080/api/v1/auth/me", {
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

      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
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
      setUser(data as LoginResponse);
      navigate("/dashboard");
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

      const response = await fetch("http://localhost:8080/auth/signup", {
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

      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
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
