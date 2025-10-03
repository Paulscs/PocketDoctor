import { useState } from "react";
import { Alert } from "react-native";

// Auth API types - ready for future API integration
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

// Mock API functions - replace these with actual API calls later
const mockLogin = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (
    credentials.email === "test@example.com" &&
    credentials.password === "password123"
  ) {
    return {
      success: true,
      token: "mock-jwt-token",
      user: {
        id: "1",
        email: credentials.email,
        name: "Test User",
      },
    };
  }

  return {
    success: false,
    error: "Invalid email or password",
  };
};

const mockRegister = async (data: RegisterData): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (data.email && data.password && data.name) {
    return {
      success: true,
      token: "mock-jwt-token",
      user: {
        id: "2",
        email: data.email,
        name: data.name,
      },
    };
  }

  return {
    success: false,
    error: "Registration failed",
  };
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await mockLogin(credentials);

      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user || null);
        // TODO: Store token securely (AsyncStorage, Keychain, etc.)
        return true;
      } else {
        Alert.alert("Login Failed", response.error || "Something went wrong");
        return false;
      }
    } catch (error) {
      Alert.alert("Login Error", "Network error. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await mockRegister(data);

      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user || null);
        // TODO: Store token securely
        return true;
      } else {
        Alert.alert(
          "Registration Failed",
          response.error || "Something went wrong"
        );
        return false;
      }
    } catch (error) {
      Alert.alert("Registration Error", "Network error. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // TODO: Call logout API endpoint
      // TODO: Clear stored token
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      Alert.alert("Logout Error", "Failed to logout properly");
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (
    provider: "google" | "apple" | "facebook"
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Implement social login with respective SDKs
      Alert.alert("Coming Soon", `${provider} login will be implemented soon`);
      return false;
    } catch (error) {
      Alert.alert("Social Login Error", `Failed to login with ${provider}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Call forgot password API
      Alert.alert("Password Reset", "Password reset link sent to your email");
      return true;
    } catch (error) {
      Alert.alert("Error", "Failed to send password reset email");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    isAuthenticated,
    user,

    // Actions
    login,
    register,
    logout,
    socialLogin,
    forgotPassword,
  };
}
