import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AUTH_TIMEOUT, API_PATHS } from "@/lib/config";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

type LoginResponse = {
  message: string;
  user: SelectUser;
};

type RegisterResponse = SelectUser;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Try to get locally stored user first
  const getInitialUser = (): SelectUser | null => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return null;
      }
      
      const parsedUser = JSON.parse(storedUser);
      
      // Validate that the user object has the expected structure
      if (parsedUser && typeof parsedUser === 'object' && 
          'id' in parsedUser && 
          'username' in parsedUser && 
          'isAdmin' in parsedUser) {
        console.log('Loaded user from localStorage:', parsedUser.username);
        return parsedUser;
      } else {
        console.warn('Invalid user data in localStorage, clearing it');
        localStorage.removeItem('user');
        return null;
      }
    } catch (e) {
      console.error('Error retrieving stored user:', e);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      return null;
    }
  };
  
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<SelectUser | null>({
    queryKey: [API_PATHS.USER],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1, // Only retry once for auth requests
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: getInitialUser,
  });

  // Automatically refresh the user session periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        refetchUser();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(intervalId);
  }, [user, refetchUser]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('Attempting login with credentials:', credentials.username);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT);
      
      try {
        const data = await apiRequest<LoginResponse>("POST", API_PATHS.LOGIN, credentials);
        console.log('Login response:', data);
        
        clearTimeout(timeoutId);
        
        if (!data || !data.user) {
          console.error('Invalid response format - missing user object');
          throw new Error("Invalid response from server - missing user data");
        }
        
        return data.user;
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Login request failed:', error);
        
        if (error.name === 'AbortError') {
          throw new Error("Login request timed out. Please try again.");
        }
        
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log('Login successful, setting user data:', user);
      
      // Store in react-query cache
      queryClient.setQueryData([API_PATHS.USER], user);
      
      // Also store in localStorage for persistence
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('Error storing user in localStorage:', e);
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Could not connect to the server",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        const response = await apiRequest<RegisterResponse>("POST", API_PATHS.REGISTER, credentials);
        
        if (!response) {
          throw new Error("Invalid response from server");
        }
        
        return response;
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Handle common registration errors with better messages
        if (error.message?.includes('username') && error.message?.includes('unique')) {
          throw new Error("Username already exists. Please choose a different username.");
        }
        
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData([API_PATHS.USER], user);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", API_PATHS.LOGOUT);
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData([API_PATHS.USER], null);
      
      // Remove from localStorage
      try {
        localStorage.removeItem('user');
      } catch (e) {
        console.error('Error removing user from localStorage:', e);
      }
      
      // Invalidate and refetch all queries to clear cached data
      queryClient.invalidateQueries();
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      
      // Even if there's an error, clear the user data
      queryClient.setQueryData([API_PATHS.USER], null);
      
      toast({
        title: "Logout issue",
        description: "You've been logged out, but there was an issue with the server.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
