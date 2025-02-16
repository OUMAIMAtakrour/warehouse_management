import { ProductService } from "../services/product.service";
import { apiClient } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CreateProductDTO, Stock, Location } from "../types";

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
});
