import { Product, Stock } from "../types";
import { ProductService } from "./product.service";
export interface Statistics {
  totalProducts: number;
  totalCities: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  recentlyAddedProducts: string[];
  mostRemovedProducts: string[]; 
}

export const StatisticsService = {
  getStatistics: async (): Promise<Statistics> => {
    try {
      const response = await ProductService.getAllProducts();
      const products = response.data;

      const cities = new Set(
        products
          .flatMap((product) => product.stocks || [])
          .filter((stock) => stock?.localisation?.city)
          .map((stock) => stock.localisation.city)
      );

      const outOfStockProducts = products.filter((product) => {
        const stocks = product.stocks || [];
        return (
          stocks.length === 0 ||
          stocks.every((stock) => !stock || stock.quantity === 0)
        );
      }).length;

      const totalInventoryValue = products.reduce((sum, product) => {
        const stockQuantity = (product.stocks || []).reduce(
          (total, stock) => total + (stock?.quantity || 0),
          0
        );
        return sum + stockQuantity * (product.price || 0);
      }, 0);

      const recentlyAddedProducts = [...products]
        .sort((a, b) => {
          const stockA = (a.stocks || []).reduce(
            (sum, stock) => sum + (stock?.quantity || 0),
            0
          );
          const stockB = (b.stocks || []).reduce(
            (sum, stock) => sum + (stock?.quantity || 0),
            0
          );
          return stockB - stockA;
        })
        .slice(0, 5)
        .map((product) => product.name);

      const mostRemovedProducts = [...products]
        .sort((a, b) => {
          const soldA = a.sold || 0;
          const soldB = b.sold || 0;
          return soldB - soldA;
        })
        .slice(0, 5)
        .map((product) => ({
          name: product.name,
          sold: product.sold || 0,
        }))
        .filter((product) => product.sold > 0) 
        .map((product) => `${product.name} (${product.sold})`);

      return {
        totalProducts: products.length,
        totalCities: cities.size,
        outOfStockProducts,
        totalInventoryValue,
        recentlyAddedProducts,
        mostRemovedProducts,
      };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      throw error;
    }
  },

  calculateProductValue: (product: Product): number => {
    if (!product.stocks || !product.price) return 0;
    return product.stocks.reduce(
      (total, stock) => total + (stock?.quantity || 0) * product.price,
      0
    );
  },

  isOutOfStock: (product: Product): boolean => {
    if (!product.stocks || product.stocks.length === 0) return true;
    return product.stocks.every((stock) => !stock || stock.quantity === 0);
  },
};
