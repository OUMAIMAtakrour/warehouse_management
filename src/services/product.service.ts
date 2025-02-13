import { apiClient } from "../api/client";
import {
  Product,
  CreateProductDTO,
  CreateStcokDto,
  ApiResponse,
} from "../types";

export const ProductService = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await apiClient.get<Product[]>("/products");
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};
