import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isImpersonating: boolean;
  login: (user: User, remember?: boolean, identifierOnLogin?: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<Omit<User, 'password'>>) => void;
  startImpersonation: (userToImpersonate: User) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'ff-tournament-user';
const ADMIN_STORAGE_KEY = 'ff-tournament-admin-user'; // For impersonation
const IDENTIFIER_STORAGE_KEY = 'ff-tournament-identifier';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null); // Stores the admin during impersonation
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    try {
        const storedUserString = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
        const storedAdminString = sessionStorage.getItem(ADMIN_STORAGE_KEY);

        if (storedAdminString) {
            // If there's a stored admin, we are in an impersonation session
            const storedAdmin = JSON.parse(storedAdminString) as User;
            const impersonatedUser = JSON.parse(storedUserString!) as User;
            setAdminUser(storedAdmin);
            setUser(impersonatedUser);
            setIsImpersonating(true);
        } else if (storedUserString) {
            const storedUser = JSON.parse(storedUserString) as User;
            setUser(storedUser);
        }
    } catch (error) {
        console.error("Failed to parse user from storage", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, []);

  const login = (userData: User, remember = false, identifierOnLogin?: string) => {
    setUser(userData);
    setAdminUser(null);
    setIsImpersonating(false);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);

    if (remember) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        if (identifierOnLogin) {
            localStorage.setItem(IDENTIFIER_STORAGE_KEY, identifierOnLogin);
        }
        sessionStorage.removeItem(USER_STORAGE_KEY);
    } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(IDENTIFIER_STORAGE_KEY);
    }
  };

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    setIsImpersonating(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    // Note: IDENTIFIER_STORAGE_KEY is not removed on logout, allowing the username to be remembered.
  };

  const updateUser = (updatedUserData: Partial<Omit<User, 'password'>>) => {
    if (user) {
        const updatedUser = { ...user, ...updatedUserData };
        setUser(updatedUser);
        // Update storage if user was persisted
        if (localStorage.getItem(USER_STORAGE_KEY)) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem(USER_STORAGE_KEY)) {
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    }
  }

  const startImpersonation = (userToImpersonate: User) => {
      if (user?.role === 'superadmin') {
          setAdminUser(user);
          setUser(userToImpersonate);
          setIsImpersonating(true);
          // Use session storage for impersonation so it doesn't persist across browser closures
          sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
          // Overwrite the current user in session storage for consistency on refresh
          sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToImpersonate));
          if (localStorage.getItem(USER_STORAGE_KEY)) {
              localStorage.removeItem(USER_STORAGE_KEY); // Move from local to session
          }
      }
  };

  const stopImpersonation = () => {
      if (adminUser) {
          // Check if the original session was a "remember me" session
          const wasRemembered = !!localStorage.getItem(IDENTIFIER_STORAGE_KEY);
          // Restore admin user
          login(adminUser, wasRemembered, localStorage.getItem(IDENTIFIER_STORAGE_KEY) || undefined);
          setAdminUser(null);
          setIsImpersonating(false);
          sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      }
  };

  return (
    <AuthContext.Provider value={{ user, isImpersonating, login, logout, updateUser, startImpersonation, stopImpersonation }}>
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