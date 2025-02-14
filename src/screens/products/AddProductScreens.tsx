import { apiClient } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Product,
  CreateProductDTO,
  ApiResponse,
} from "../../types/product.types";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, commonStyles } from "../../../assets/style/common";
import { ProductService } from "../../services/product.service";

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [warehouse, setWarehouse] = useState("");

  const handleAddProduct = async () => {
    try {
      const productData = {
        name,
        type,
        barcode: `${Date.now()}`,
        price: parseFloat(price),
        supplier,
        image: "", 
        stocks: [{ quantity: parseInt(initialQuantity), location: warehouse }],
      };

      const response = await ProductService.createProduct(productData);
      if (response.status === 201) {
        Alert.alert("Success", "Product added successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "An error occurred while adding the product");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      <View style={styles.form}>
        <InputField
          icon="box"
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
        <InputField
          icon="tag"
          placeholder="Product Type"
          value={type}
          onChangeText={setType}
        />
        <InputField
          icon="dollar-sign"
          placeholder="Price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <InputField
          icon="truck"
          placeholder="Supplier"
          value={supplier}
          onChangeText={setSupplier}
        />
        <InputField
          icon="package"
          placeholder="Initial Quantity"
          keyboardType="numeric"
          value={initialQuantity}
          onChangeText={setInitialQuantity}
        />
        <InputField
          icon="home"
          placeholder="Warehouse"
          value={warehouse}
          onChangeText={setWarehouse}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
        <Feather name="plus" size={20} color={colors.white} />
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InputField({ icon, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <Feather
        name={icon}
        size={20}
        color={colors.primary}
        style={styles.inputIcon}
      />
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  form: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  button: {
    ...commonStyles.button,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { ...commonStyles.buttonText, marginLeft: 10 },
});
