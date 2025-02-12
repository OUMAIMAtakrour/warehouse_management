import { apiClient } from "../api/client";
import { User } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  login: async (secretKey: string): Promise<User | null> => {
    try {
      const response = await apiClient.get<User[]>("/warehousemans");
      const warehouseman = response.data.find((w) => w.secretKey === secretKey);

      if (warehouseman) {
        await AsyncStorage.setItem(
          "warehouseman",
          JSON.stringify(warehouseman)
        );
        return warehouseman;
      }

      return null;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("warehouseman");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem("warehouseman");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
};
