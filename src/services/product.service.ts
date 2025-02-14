import { apiClient } from "../api/client";
import {
  Product,
  CreateProductDTO,
  CreateStockDto,
  ApiResponse,
  Stock,
  User,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  getStocks: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      const response = await apiClient.get<Product[]>("/products");
      const products = response.data;

      const stocks: Stock[] = products.flatMap((product) =>
        product.stocks.filter(
          (stock) => stock && stock.localisation && stock.localisation.city
        )
      );

      return {
        data: stocks,
        status: response.status,
      };
    } catch (error) {
      console.error("Error fetching stocks:", error);
      throw error;
    }
  },

  getWarehousemen: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.get<User[]>("/warehousemans");
      return { data: response.data, status: response.status };
    } catch (error) {
      console.error("Error fetching warehousemen:", error);
      throw error;
    }
  },
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  getProductByBarcode: async (
    barcode: string
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.get<Product[]>(
        `/products?barcode=${barcode}`
      );
      if (response.data.length === 0) {
        return {
          data: null,
          status: 404,
          message: "Product not found",
        };
      }
      return {
        data: response.data[0],
        status: response.status,
      };
    } catch (error) {
      console.error("Error fetching product by barcode:", error);
      throw error;
    }
  },
  createProduct: async (
    productData: CreateProductDTO
  ): Promise<ApiResponse<Product>> => {
    try {
      const existingProduct = await ProductService.getProductByBarcode(
        productData.barcode
      );
      if (existingProduct.data) {
        return {
          data: null,
          status: 409,
          message: "Product with this barcode already exists",
        };
      }

      const warehouseman = await AsyncStorage.getItem("warehouseman");
      const warehousemanData = warehouseman ? JSON.parse(warehouseman) : null;

      const newProduct = {
        ...productData,
        sold: 0,
        stocks: [
          {
            id: productData.stocks,
            quantity: productData.initialQuantity,
          },
        ],
        editedBy: {
          warehouseManId: warehousemanData?.id || 1,
          at: new Date().toISOString(),
        },
      };

      const response = await apiClient.post<Product>("/products", newProduct);
      return {
        data: response.data,
        status: response.status,
        message: "Product created successfully",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },
};
