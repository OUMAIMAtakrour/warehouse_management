import { ProductService } from "../services/product.service";
import { apiClient } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CreateProductDTO, Stock, Location } from "../types";

jest.mock("../api/client");
jest.mock("@react-native-async-storage/async-storage");

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

  describe("createProduct", () => {
    const mockWarehouseman = {
      id: 1,
      name: "John Doe",
    };

    const mockProductDTO: CreateProductDTO = {
      name: "Samsung Galaxy S21",
      type: "Smartphone",
      barcode: "987654321",
      price: 899.99,
      supplier: "Samsung Electronics",
      image: "https://example.com/galaxys21.jpg",
      stocks: [
        {
          id: 1,
          name: "Main Warehouse",
          quantity: 50,
          localisation: mockLocation,
        },
      ],
    };

    const mockCreatedProduct: Product = {
      ...mockProductDTO,
      id: 1,
      sold: 0,
      editedBy: {
        warehouseManId: 1,
        at: expect.any(String),
      },
    };

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockWarehouseman)
      );
    });

    it("should successfully create a new product", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: [],
        status: 200,
      });

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockCreatedProduct,
        status: 201,
      });

      const result = await ProductService.createProduct(mockProductDTO);

      expect(result.data).toEqual(mockCreatedProduct);
      expect(result.status).toBe(201);
      expect(result.message).toBe("Product created successfully");
      expect(apiClient.post).toHaveBeenCalledWith(
        "/products",
        expect.objectContaining({
          ...mockProductDTO,
          sold: 0,
        })
      );
    });

    it("should return conflict error if product with barcode exists", async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: [mockCreatedProduct],
        status: 200,
      });

      const result = await ProductService.createProduct(mockProductDTO);

      expect(result.status).toBe(409);
      expect(result.message).toBe("Product with this barcode already exists");
      expect(apiClient.post).not.toHaveBeenCalled();
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
