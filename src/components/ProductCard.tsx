import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ProductService } from "../services/product.service";

const ProductCard = ({ item, navigation, onDelete }) => {
  const getTotalQuantity = (stocks) => {
    return stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  };

  const totalQuantity = getTotalQuantity(item.stocks);
  const isOutOfStock = totalQuantity === 0;
  const isLowStock = totalQuantity > 0 && totalQuantity < 5;

  const getStockStatusColor = () => {
    if (isOutOfStock) return "#E74C3C";
    if (isLowStock) return "#F39C12";
    return "#2ECC71";
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await ProductService.deleteProduct(item.id);
              if (response.status === 200) {
                onDelete(item.id);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete product");
              console.error("Error deleting product:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProductDetails", { productId: item.id })
        }
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text
              style={styles.productName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={18} color="#E74C3C" />
            </TouchableOpacity>
          </View>
          <Text
            style={styles.productType}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.type}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.stockInfo}>
              <View
                style={[
                  styles.stockIndicator,
                  { backgroundColor: getStockStatusColor() },
                ]}
              />
              <Text
                style={[styles.stockText, { color: getStockStatusColor() }]}
              >
                {isOutOfStock ? "Out of Stock" : `${totalQuantity} units`}
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  deleteButton: {
    padding: 4,
  },
  productType: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
});

export default ProductCard;
