import React from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const ProductCard = ({ item, navigation }) => {
  const getTotalQuantity = (stocks) => {
    return stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  };

  const totalQuantity = getTotalQuantity(item.stocks);
  const isOutOfStock = totalQuantity === 0;
  const isLowStock = totalQuantity > 0 && totalQuantity < 5;

  const getStockStatusColor = () => {
    if (isOutOfStock) return "#dc3545";
    if (isLowStock) return "#ffc107";
    return "#28a745";
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProductDetails", { productId: item.id })
      }
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productType}>{item.type}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stockInfo}>
            <Feather
              name="package"
              size={16}
              color={getStockStatusColor()}
              style={styles.icon}
            />
            <Text style={[styles.stockText, { color: getStockStatusColor() }]}>
              {isOutOfStock ? "Out of Stock" : `${totalQuantity} units`}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Feather
              name="dollar-sign"
              size={16}
              color="#2c3e50"
              style={styles.icon}
            />
            <Text style={styles.productPrice}>{item.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
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
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  mainInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
});
