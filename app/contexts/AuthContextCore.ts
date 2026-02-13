import React, { createContext } from "react";
import type { LoginResponse } from "~/routes/login";

export interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


