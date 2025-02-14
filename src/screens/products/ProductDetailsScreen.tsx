import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../assets/style/common";
import { ProductService } from "../../services/product.service";
import { Product, Stock } from "../../types";

interface ProductDetailsProps {
  route: {
    params: {
      productId: string;
      barcode?: string;
    };
  };
  navigation: any;
}

interface InfoItemProps {
  icon: string;
  label: string;
  value: string | number;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      <Feather name={icon} size={16} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default function ProductDetailsScreen({
  route,
  navigation,
}: ProductDetailsProps) {
  const { productId } = route.params;
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductService.getProductById(productId);
      setProduct(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch product details"
      );
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuantity = (stocks?: Stock[]) => {
    return stocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0;
  };

  const handleAddStock = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity number");
      return;
    }
    Alert.alert("Success", `Added ${quantity} units to stock`);
    setQuantity("");
    fetchProductDetails();
  };

  const handleRemoveStock = () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity number");
      return;
    }
    const totalStock = getTotalQuantity(product?.stocks);
    if (Number(quantity) > totalStock) {
      Alert.alert(
        "Invalid Quantity",
        "Cannot remove more than available stock"
      );
      return;
    }
    Alert.alert("Success", `Removed ${quantity} units from stock`);
    setQuantity("");
    fetchProductDetails();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProductDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productType}>{product.type}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <InfoItem
            icon="tag"
            label="Price"
            value={`$${product.price.toFixed(2)}`}
          />
          <InfoItem
            icon="package"
            label="Total Stock"
            value={getTotalQuantity(product.stocks)}
          />
        </View>
        <InfoItem icon="truck" label="Supplier" value={product.supplier} />
        <InfoItem
          icon="clock"
          label="Last Updated"
          value={new Date(product.editedBy.at).toLocaleDateString()}
        />
        <InfoItem icon="user" label="Updated By" value={product.editedBy.by} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stock Locations</Text>
        {product.stocks.map((stock, index) => (
          <View
            key={index}
            style={[
              styles.stockLocation,
              index === product.stocks.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.locationCity}>{stock.localisation.city}</Text>
            <Text style={styles.locationQuantity}>{stock.quantity} units</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Stock Management</Text>
        <TextInput
          style={styles.quantityInput}
          placeholder="Enter quantity"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddStock}
          >
            <Feather name="plus" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={handleRemoveStock}
          >
            <Feather name="minus" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Remove Stock</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 16,
  },
  imageContainer: {
    backgroundColor: colors.white,
    width: "100%",
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  productImage: {
    width: "80%",
    height: "80%",
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastSection: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  productType: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    flex: 1,
  },
  infoIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  stockLocation: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationCity: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  locationQuantity: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: colors.secondary,
  },
  removeButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});