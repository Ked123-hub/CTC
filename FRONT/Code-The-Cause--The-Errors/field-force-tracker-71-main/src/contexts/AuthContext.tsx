import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";

export type UserRole = "ADMIN" | "MANAGER" | "WORKER";

export interface AuthUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.verifyAuth();
        const userData = response.data?.data ?? response.data;
        setUser(userData);
        setToken(storedToken);
      } catch {
        // Token invalid, clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const data = response.data?.data ?? response.data;

      // Defensive checks and logging
      if (!data) {
        console.error("Auth login: empty response", response);
        throw new Error("Login failed: empty response from server");
      }

      const authToken = data.token;
      if (!authToken) {
        console.error("Auth login: token missing", data);
        throw new Error("Login failed: token not returned by server");
      }

      const userData: AuthUser = {
        id: data.user?.id ?? data.id,
        email: data.user?.email ?? data.email,
        firstname: data.user?.firstname ?? data.firstname ?? "",
        lastname: data.user?.lastname ?? data.lastname ?? "",
        role: (data.user?.role ?? data.role ?? "WORKER") as AuthUser["role"],
      };

      // Persist and update context
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      console.log("Auth login: success", { email, id: userData.id, role: userData.role });
    } catch (err: any) {
      console.error("Auth login error:", err);
      // Rethrow so callers (Login page) can display a message
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
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
