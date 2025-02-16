import { ProductService } from "../services/product.service";
import { apiClient } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, Stock, Location } from "../types";

jest.mock("../api/client");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLocation: Location = {
    city: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const mockStock: Stock = {
    id: 1,
    name: "Main Warehouse",
    quantity: 100,
    localisation: mockLocation,
  };

  describe("getProductById", () => {
    const mockProduct: Product = {
      id: 1,
      name: "iPhone 13",
      type: "Smartphone",
      barcode: "123456789",
      price: 999.99,
      supplier: "Apple Inc",
      image: "https://example.com/iphone13.jpg",
      stocks: [mockStock],
      editedBy: {
        warehouseManId: 1,
        at: "2024-02-15T10:00:00.000Z",
      },
    };

    it("should successfully fetch a product by ID", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
      });

      const result = await ProductService.getProductById("1");

      expect(result.data).toEqual(mockProduct);
      expect(result.status).toBe(200);
      expect(apiClient.get).toHaveBeenCalledWith("/products/1");
    });

    it("should throw an error when API call fails", async () => {
      const error = new Error("Network error");
      (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById("1")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("updateProductStock", () => {
    const mockProduct: Product = {
      id: 1,
      name: "MacBook Pro",
      type: "Laptop",
      barcode: "456789123",
      price: 1299.99,
      supplier: "Apple Inc",
      image: "https://example.com/macbook.jpg",
      stocks: [
        {
          id: 1,
          name: "Main Warehouse",
          quantity: 25,
          localisation: mockLocation,
        },
      ],
      editedBy: {
        warehouseManId: 1,
        at: "2024-02-15T10:00:00.000Z",
      },
    };

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ id: 1 })
      );
    });

    it("should successfully add stock quantity", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
      });

      const updatedProduct = {
        ...mockProduct,
        stocks: [
          {
            ...mockProduct.stocks[0],
            quantity: 30,
          },
        ],
        editedBy: {
          warehouseManId: 1,
          at: expect.any(String),
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        data: updatedProduct,
        status: 200,
      });

      const result = await ProductService.updateProductStock(1, 1, 5, true);

      expect(result.status).toBe(200);
      expect(result.message).toBe("Stock added successfully");
      expect(result.data).toEqual(updatedProduct);
      expect(apiClient.put).toHaveBeenCalledWith(
        "/products/1",
        expect.objectContaining({
          stocks: [expect.objectContaining({ quantity: 30 })],
        })
      );
    });

    it("should successfully remove stock quantity", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
      });

      const updatedProduct = {
        ...mockProduct,
        stocks: [
          {
            ...mockProduct.stocks[0],
            quantity: 20,
          },
        ],
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        data: updatedProduct,
        status: 200,
      });

      const result = await ProductService.updateProductStock(1, 1, 5, false);

      expect(result.status).toBe(200);
      expect(result.message).toBe("Stock removed successfully");
      expect(result.data).toEqual(updatedProduct);
    });

    it("should prevent removing more stock than available", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
      });

      const result = await ProductService.updateProductStock(1, 1, 30, false);

      expect(result.status).toBe(400);
      expect(result.message).toBe("Insufficient stock quantity");
      expect(apiClient.put).not.toHaveBeenCalled();
    });

    it("should return error if stock not found", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
      });

      const result = await ProductService.updateProductStock(1, 999, 5, true);

      expect(result.status).toBe(404);
      expect(result.message).toBe("Stock not found for this product");
      expect(apiClient.put).not.toHaveBeenCalled();
    });
  });
});
