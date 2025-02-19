import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, commonStyles } from "../../assets/style/common";
import { ProductService } from "../services/product.service";
import { Product, Stock } from "../types";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

interface EditProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onUpdateSuccess: () => void;
  handleImagePick: () => Promise<void>;
}
const handleImagePick = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert(
      "Permission denied. You need to grant permission to access the media library."
    );
    return;
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.5,
  });

  if (
    !pickerResult.canceled &&
    pickerResult.assets &&
    pickerResult.assets.length > 0
  ) {
    const imageUri = pickerResult.assets[0].uri;
    setImage(imageUri);
  } else {
    alert("No image selected. Please try again.");
  }
};

export default function EditProductModal({
  visible,
  onClose,
  product,
  onUpdateSuccess,
  handleImagePick,
}: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [type, setType] = useState(product.type);
  const [price, setPrice] = useState(product.price.toString());
  const [image, setImage] = useState(product.image);
  const [stocks, setStocks] = useState<Stock[]>(product.stocks);
  const [selectedStockIndex, setSelectedStockIndex] = useState(0);

  useEffect(() => {
    setName(product.name);
    setType(product.type);
    setPrice(product.price.toString());
    setImage(product.image);
    setStocks(product.stocks);
  }, [product]);

  const updateStockQuantity = (index: number, quantity: string) => {
    const newStocks = [...stocks];
    newStocks[index] = {
      ...newStocks[index],
      quantity: parseInt(quantity) || 0,
    };
    setStocks(newStocks);
  };

  const handleSave = async () => {
    try {
      if (!name || !type || !price) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      const updatedProduct = {
        ...product,
        name,
        type,
        price: parseFloat(price),
        image,
        stocks,
      };

      const response = await ProductService.updateProduct(
        product.id,
        updatedProduct
      );

      if (response?.status === 200) {
        Alert.alert("Success", "Product updated successfully");
        onUpdateSuccess();
        onClose();
      } else {
        Alert.alert("Error", "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "An error occurred while updating the product");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Product</Text>

            <View style={styles.inputContainer}>
              <Feather name="package" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Product Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="tag" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={type}
                onChangeText={setType}
                placeholder="Product Type"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="dollar-sign" size={24} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Price"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.stockSection}>
              <Text style={styles.sectionTitle}>Stock Management</Text>
              <Picker
                selectedValue={selectedStockIndex}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setSelectedStockIndex(Number(itemValue))
                }
              >
                {stocks.map((stock, index) => (
                  <Picker.Item
                    key={stock.id}
                    label={`${stock.name} - ${stock.localisation.city}`}
                    value={index}
                  />
                ))}
              </Picker>

              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={stocks[selectedStockIndex]?.quantity.toString()}
                  onChangeText={(value) =>
                    updateStockQuantity(selectedStockIndex, value)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.imageSection}>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handleImagePick}
              >
                <Feather name="image" size={24} color={colors.primary} />
                <Text style={styles.imagePickerText}>Change Image</Text>
              </TouchableOpacity>
              {image && (
                <Image
                  source={{ uri: image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  inputIcon: {
    marginRight: 10,
    color: colors.primary,
  },
  input: {
    flex: 1,
    height: 40,
  },
  stockSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  picker: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  quantityInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  imageSection: {
    marginVertical: 15,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    color: colors.primary,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    textAlign: "center",
    color: colors.white,
    fontWeight: "bold",
  },
});
