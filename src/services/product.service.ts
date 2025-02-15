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
  updateProduct: async (
    productId: number | string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.put<Product>(
        `/products/${productId}`,
        productData
      );
      return {
        data: response.data,
        status: response.status,
        message: "Product updated successfully",
      };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
  updateProductStock: async (
    productId: number,
    stockId: number,
    quantity: number,
    isAddition: boolean
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.get<Product>(`/products/${productId}`);
      const product = response.data;

      const stockIndex = product.stocks.findIndex((s) => s.id === stockId);
      if (stockIndex === -1) {
        return {
          data: null,
          status: 404,
          message: "Stock not found for this product",
        };
      }

      const currentQuantity = product.stocks[stockIndex].quantity;
      const newQuantity = isAddition
        ? currentQuantity + quantity
        : currentQuantity - quantity;

      if (newQuantity < 0) {
        return {
          data: null,
          status: 400,
          message: "Insufficient stock quantity",
        };
      }

      const warehouseman = await AsyncStorage.getItem("warehouseman");
      const warehousemanData = warehouseman ? JSON.parse(warehouseman) : null;

      product.stocks[stockIndex].quantity = newQuantity;
      product.editedBy = {
        warehouseManId: warehousemanData?.id || 1,
        at: new Date().toISOString(),
      };

      const updateResponse = await apiClient.put<Product>(
        `/products/${productId}`,
        product
      );

      return {
        data: updateResponse.data,
        status: updateResponse.status,
        message: `Stock ${isAddition ? "added" : "removed"} successfully`,
      };
    } catch (error) {
      console.error("Error updating product stock:", error);
      throw error;
    }
  },
  deleteProduct: async (productId: number): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete(`/products/${productId}`);

      return {
        data: null,
        status: response.status,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};
