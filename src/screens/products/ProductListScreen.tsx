import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import { Feather } from "@expo/vector-icons";
import { colors, commonStyles } from "../../../assets/style/common";
import { Product, Stock } from "../../types";
import { ProductService } from "../../services/product.service";

export default function ProductListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getAllProducts();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuantity = (stocks: Stock[]) => {
    return stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  };

  const renderStockInfo = (stocks: Stock[]) => {
    const totalQuantity = getTotalQuantity(stocks);
    const stockLocations = stocks
      .map((stock) => `${stock.localisation.city}: ${stock.quantity}`)
      .join("\n");

    return (
      <View>
        <Text style={styles.totalQuantity}>Total Qty: {totalQuantity}</Text>
        <Text style={styles.stockLocations}>{stockLocations}</Text>
      </View>
    );
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.type.toLowerCase().includes(searchLower) ||
      product.supplier.toLowerCase().includes(searchLower) ||
      product.price.toString().includes(searchLower)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "quantity") {
      return getTotalQuantity(b.stocks) - getTotalQuantity(a.stocks);
    }
    return 0;
  });

  const renderItem = ({ item }: { item: Product }) => {
    // const totalQuantity = getTotalQuantity(item.stocks);

    console.log("test", item.image);

    return <ProductCard item={item} navigation={navigation}></ProductCard>;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, type, supplier or price..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.sortButtons}>
        <TouchableOpacity
          onPress={() => setSortBy("name")}
          style={[
            styles.sortButton,
            sortBy === "name" && styles.activeSortButton,
          ]}
        >
          <Feather
            name="type"
            size={16}
            color={sortBy === "name" ? colors.white : colors.primary}
          />
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "name" && styles.activeSortButtonText,
            ]}
          >
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortBy("price")}
          style={[
            styles.sortButton,
            sortBy === "price" && styles.activeSortButton,
          ]}
        >
          <Feather
            name="dollar-sign"
            size={16}
            color={sortBy === "price" ? colors.white : colors.primary}
          />
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "price" && styles.activeSortButtonText,
            ]}
          >
            Price
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortBy("quantity")}
          style={[
            styles.sortButton,
            sortBy === "quantity" && styles.activeSortButton,
          ]}
        >
          <Feather
            name="package"
            size={16}
            color={sortBy === "quantity" ? colors.white : colors.primary}
          />
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "quantity" && styles.activeSortButtonText,
            ]}
          >
            Quantity
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  searchInput: {
    ...commonStyles.input,
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeSortButton: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    marginLeft: 5,
    color: colors.primary,
    fontWeight: "bold",
  },
  activeSortButtonText: {
    color: colors.white,
  },
  list: {
    flex: 1,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.text,
  },
  productType: {
    color: colors.text,
    opacity: 0.7,
  },
  productSupplier: {
    color: colors.text,
    opacity: 0.7,
    fontSize: 12,
  },
  productStats: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontWeight: "bold",
    color: colors.primary,
  },
  totalQuantity: {
    color: colors.text,
    fontWeight: "bold",
    marginTop: 4,
  },
  stockLocations: {
    color: colors.text,
    opacity: 0.7,
    fontSize: 12,
  },
  editedBy: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  outOfStock: {
    backgroundColor: colors.danger + "20",
  },
  lowStock: {
    backgroundColor: colors.warning + "20",
  },
});
