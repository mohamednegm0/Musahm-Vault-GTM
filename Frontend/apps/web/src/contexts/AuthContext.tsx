import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import posthog from 'posthog-js';

interface User {
  email: string;
  token: string;
  name?: string;
  NameAr?: string;
  NameEn?: string;
  MobileNumber?: string;
  CompanyNameAr?: string;
  CompanyNameEn?: string;
  IsDefaultPassword?: string;
  IsAdmin?: string;
  AdminId?: string;
  CompanyTypeId?: string;
  IsTwoFactorAuthentication?: string;
  UserType?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initial load from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');

        console.log('AuthContext - Initial load from localStorage:', { token: !!token, email });

        if (token && email) {
          try {
            const decoded: any = jwtDecode(token);
            const name = decoded.NameEn || decoded.NameAr || decoded.name || decoded.unique_name;

            const userData: User = {
              email,
              token,
              name,
              NameAr: decoded.NameAr,
              NameEn: decoded.NameEn,
              MobileNumber: decoded.MobileNumber,
              CompanyNameAr: decoded.CompanyNameAr,
              CompanyNameEn: decoded.CompanyNameEn,
              IsDefaultPassword: decoded.IsDefaultPassword,
              IsAdmin: decoded.IsAdmin,
              AdminId: decoded.AdminId,
              CompanyTypeId: decoded.CompanyTypeId,
              IsTwoFactorAuthentication: decoded.IsTwoFactorAuthentication,
              UserType: decoded.UserType
            };

            setUser(userData);

            // Identify user in PostHog
            posthog.identify(email, {
              ...userData
            });
          } catch (e) {
            console.error('Error decoding token for initial load:', e);
            setUser({ email, token });
          }
        }
      } catch (error) {
        console.error('Error reading auth from localStorage:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Watch for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');

      console.log('AuthContext - Storage changed:', { token: !!token, email });

      if (token && email) {
        try {
          const decoded: any = jwtDecode(token);
          const name = decoded.NameEn || decoded.NameAr || decoded.name || decoded.unique_name;

          const userData: User = {
            email,
            token,
            name,
            NameAr: decoded.NameAr,
            NameEn: decoded.NameEn,
            MobileNumber: decoded.MobileNumber,
            CompanyNameAr: decoded.CompanyNameAr,
            CompanyNameEn: decoded.CompanyNameEn,
            IsDefaultPassword: decoded.IsDefaultPassword,
            IsAdmin: decoded.IsAdmin,
            AdminId: decoded.AdminId,
            CompanyTypeId: decoded.CompanyTypeId,
            IsTwoFactorAuthentication: decoded.IsTwoFactorAuthentication,
            UserType: decoded.UserType
          };

          setUser(userData);

          // Identify user in PostHog
          posthog.identify(email, {
            ...userData
          });
        } catch (e) {
          console.error('Error decoding token for storage change:', e);
          setUser({ email, token });
        }
      } else {
        setUser(null);
        posthog.reset();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (email: string, token: string) => {
    try {
      if (!token || !email) {
        throw new Error('Invalid token or email');
      }

      console.log('AuthContext - Login called:', { email });

      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);

      let name;
      let userData: User;
      try {
        const decoded: any = jwtDecode(token);
        name = decoded.NameEn || decoded.NameAr || decoded.name || decoded.unique_name;

        userData = {
          email,
          token,
          name,
          NameAr: decoded.NameAr,
          NameEn: decoded.NameEn,
          MobileNumber: decoded.MobileNumber,
          CompanyNameAr: decoded.CompanyNameAr,
          CompanyNameEn: decoded.CompanyNameEn,
          IsDefaultPassword: decoded.IsDefaultPassword,
          IsAdmin: decoded.IsAdmin,
          AdminId: decoded.AdminId,
          CompanyTypeId: decoded.CompanyTypeId,
          IsTwoFactorAuthentication: decoded.IsTwoFactorAuthentication,
          UserType: decoded.UserType
        };
      } catch (e) {
        console.error('Error decoding token for login:', e);
        userData = { email, token };
      }

      // Update state immediately
      setUser(userData);

      // Identify user in PostHog
      posthog.identify(email, {
        ...userData
      });

      console.log('AuthContext - User state updated and identified in PostHog:', { email, name, token: !!token });
    } catch (error) {
      console.error('Error saving auth to localStorage:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user');
      setUser(null);
      posthog.reset();
      console.log('AuthContext - User logged out and PostHog reset');
    } catch (error) {
      console.error('Error clearing auth from localStorage:', error);
      setUser(null);
      posthog.reset();
    }
  };

  const isAuthenticated = !!user && !!user.token;

  // Debug: log authentication state
  useEffect(() => {
    console.log('Auth state updated:', { isAuthenticated, isInitialized, user: user?.email });
  }, [isAuthenticated, isInitialized, user?.email]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isInitialized }}>
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
