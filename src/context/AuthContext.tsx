
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase';
import { RecordModel } from 'pocketbase';

// Define User type based on PocketBase 'users' collection
export interface User extends RecordModel {
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Teacher' | 'Student' | 'Parent' | 'Individual';
  avatar?: string;
  tenantId?: string; // Link to a School or Organization
  emailVisibility?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(pb.authStore.model as User | null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Refresh auth store to ensure we have latest user data (like roles)
    const refreshAuth = async () => {
        if (pb.authStore.isValid) {
            try {
                // Disable auto-cancellation to prevent React Strict Mode double-fetch issues
                const authData = await pb.collection('users').authRefresh({ requestKey: null });
                console.log("Auth Refreshed:", authData.record);
                setUser(authData.record as User);
            } catch (err) {
                // Ignore auto-cancellation errors
                if (err instanceof Error && err.name === 'AbortError') return;
                // PocketBase specific error check
                const isAbort = (err as { isAbort?: boolean }).isAbort;
                if (isAbort) return;

                console.warn("Session expired or invalid:", err instanceof Error ? err.message : String(err));
                // If refresh fails (e.g. deleted user), clear auth
                pb.authStore.clear();
                setUser(null);
            }
        }
        setLoading(false);
    };

    refreshAuth();

    // Listen to auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log("Auth State Changed:", model);
      setUser(model as User | null);
    }, false); // Don't trigger immediately, we handled it with refreshAuth

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      // Explicitly set user to ensure state is consistent immediately
      setUser(authData.record as User);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to login";
      console.error("Login failed:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, passwordConfirm: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create the user
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
        role: 'Individual', // Default role for self-registration
        emailVisibility: true,
      });

      // 2. Auto-login after registration
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to register";
      console.error("Registration failed:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
