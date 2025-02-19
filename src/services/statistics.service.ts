import { Product, Stock } from "../types";
import { ProductService } from "./product.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
export interface Statistics {
  totalProducts: number;
  totalCities: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  recentlyAddedProducts: string[];
  mostRemovedProducts: string[];
}

const DELETION_COUNTS_KEY = "product_deletion_counts";

interface DeletionCount {
  productName: string;
  count: number;
  lastDeleted: string;
}
export const StatisticsService = {
  trackDeletion: async (productName: string) => {
    try {
      const storedCounts = await AsyncStorage.getItem(DELETION_COUNTS_KEY);
      let deletionCounts: DeletionCount[] = storedCounts
        ? JSON.parse(storedCounts)
        : [];

      const existingIndex = deletionCounts.findIndex(
        (p) => p.productName === productName
      );

      if (existingIndex >= 0) {
        deletionCounts[existingIndex] = {
          ...deletionCounts[existingIndex],
          count: deletionCounts[existingIndex].count + 1,
          lastDeleted: new Date().toISOString(),
        };
      } else {
        deletionCounts.push({
          productName,
          count: 1,
          lastDeleted: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(
        DELETION_COUNTS_KEY,
        JSON.stringify(deletionCounts)
      );
    } catch (error) {
      console.error("Error tracking product deletion:", error);
    }
  },

  getDeletionStats: async (): Promise<DeletionCount[]> => {
    try {
      const storedCounts = await AsyncStorage.getItem(DELETION_COUNTS_KEY);
      return storedCounts ? JSON.parse(storedCounts) : [];
    } catch (error) {
      console.error("Error getting deletion stats:", error);
      return [];
    }
  },

//   getStatistics: async (): Promise<Statistics> => {
//     try {
//       const response = await ProductService.getAllProducts();
//       const products = response.data;
//       const deletionStats = await StatisticsService.getDeletionStats();

//       const cities = new Set(
//         products
//           .flatMap((product) => product.stocks || [])
//           .filter((stock) => stock?.localisation?.city)
//           .map((stock) => stock.localisation.city)
//       );

//       const outOfStockProducts = products.filter((product) => {
//         const stocks = product.stocks || [];
//         return (
//           stocks.length === 0 ||
//           stocks.every((stock) => !stock || stock.quantity === 0)
//         );
//       }).length;

//       const totalInventoryValue = products.reduce((sum, product) => {
//         const stockQuantity = (product.stocks || []).reduce(
//           (total, stock) => total + (stock?.quantity || 0),
//           0
//         );
//         return sum + stockQuantity * (product.price || 0);
//       }, 0);

//       const recentlyAddedProducts = [...products]
//         .sort((a, b) => {
//           const stockA = (a.stocks || []).reduce(
//             (sum, stock) => sum + (stock?.quantity || 0),
//             0
//           );
//           const stockB = (b.stocks || []).reduce(
//             (sum, stock) => sum + (stock?.quantity || 0),
//             0
//           );
//           return stockB - stockA;
//         })
//         .slice(0, 5)
//         .map((product) => product.name);

//       const mostDeletedProducts = deletionStats
//         .sort((a, b) => b.count - a.count)
//         .slice(0, 5)
//         .map((stat) => `${stat.productName} (${stat.count})`);

//       return {
//         totalProducts: products.length,
//         totalCities: cities.size,
//         outOfStockProducts,
//         totalInventoryValue,
//         recentlyAddedProducts,
//         mostDeletedProducts,
//       };
//     } catch (error) {
//       console.error("Error calculating statistics:", error);
//       throw error;
//     }
//   },
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
