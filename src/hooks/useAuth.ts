// src/hooks/useAuth.ts
import { useState } from "react";
import { authService } from "../services/auth.service";
import { User } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (secretKey: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(secretKey);

      await AsyncStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (err) {
      setError("Invalid secret key. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
  };

  return { login, logout, loading, error };
};
