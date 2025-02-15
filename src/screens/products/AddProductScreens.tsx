import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { colors, commonStyles } from "../../../assets/style/common";
import { ProductService } from "../../services/product.service";
import { Stock, CreateProductDTO, Product } from "../../types/product.types";
import ProductScann from "../../components/ProductScann";

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await ProductService.getStocks();
        if (response?.status === 200) {
          setStocks(response.data);
        } else {
          console.error("Error fetching stocks:", response);
          Alert.alert("Error", "Failed to load stocks. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching stocks:", error);
        Alert.alert(
          "Error",
          "Failed to load stocks. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const handleBarcodeScanned = async (scanData: {
    type: string;
    data: string;
  }) => {
    try {
      const response = await ProductService.getProductByBarcode(scanData.data);

      if (response.status === 404) {
        setBarcode(scanData.data);
        setShowScanner(false);
        Alert.alert("Success", "Barcode scanned successfully");
      } else if (response.status === 200 && response.data) {
        Alert.alert(
          "Product Exists",
          `A product with barcode ${scanData.data} already exists in the database.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error checking barcode:", error);
      Alert.alert("Error", "Failed to verify barcode. Please try again.");
    }
  };

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

  const handleAddProduct = async () => {
    if (!name || !type || !price || !selectedStock || !barcode) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const stockWithQuantity = {
        ...selectedStock,
        quantity: 0,
      };

      const productData: CreateProductDTO = {
        name,
        type,
        barcode,
        price: parseFloat(price),
        image,
        supplier: "",
        stocks: [stockWithQuantity],
        sold: 0,
      };

      const response = await ProductService.createProduct(productData);

      if (response?.status === 201) {
        Alert.alert("Success", "Product added successfully");
        navigation.goBack();
      } else if (response?.status === 409) {
        Alert.alert("Error", "Product with this barcode already exists");
      } else {
        console.error("Error adding product:", response);
        Alert.alert("Error", response?.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "An error occurred while adding the product");
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>Add New Product</Text>
      <View style={styles.form}>
        <InputField
          icon="package"
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
        <View style={styles.barcodeContainer}>
          <InputField
            icon="hash"
            placeholder="Barcode"
            value={barcode}
            onChangeText={setBarcode}
            editable={false}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <Feather name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <InputField
          icon="dollar-sign"
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Feather name="map-pin" size={24} style={styles.inputIcon} />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Picker
              style={styles.picker}
              selectedValue={selectedStock?.id}
              onValueChange={(stockId) => {
                const stock = stocks.find((s) => s.id === stockId);
                if (stock) {
                  setSelectedStock(stock);
                }
              }}
            >
              <Picker.Item label="Select Stock Location" value={null} />
              {stocks.length > 0 ? (
                stocks.map((stock) => (
                  <Picker.Item
                    key={stock.id}
                    label={`${stock.name} - ${stock.localisation.city}`}
                    value={stock.id}
                  />
                ))
              ) : (
                <Picker.Item label="No stocks available" value={null} />
              )}
            </Picker>
          )}
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          <Feather name="image" size={24} color={colors.primary} />
          <Text style={styles.imagePickerText}>
            {image ? "Change Image" : "Select Image"}
          </Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
        <Feather name="plus-circle" size={24} color={colors.white} />
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>

      <ProductScann
        showScanner={showScanner}
        setShowScanner={setShowScanner}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </ScrollView>
  );
}

function InputField({ icon, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <Feather name={icon} size={24} style={styles.inputIcon} />
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
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  scanButton: {
    padding: 10,
    marginLeft: 10,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 5,
    marginTop: 10,
  },
  imagePickerText: {
    marginLeft: 10,
    color: colors.primary,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center",
  },
  button: {
    ...commonStyles.button,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    ...commonStyles.buttonText,
    marginLeft: 10,
  },
});
