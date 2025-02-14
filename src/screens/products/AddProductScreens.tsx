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
import { Stock } from "../../types/product.types";

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [stocks, setStocks] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!name || !type || !price || !initialQuantity || !selectedStock) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const productData = {
        name,
        type,
        barcode: `${Date.now()}`,
        price: parseFloat(price),
        image: image || "",
        stocks: [
          { quantity: parseInt(initialQuantity), location: selectedStock },
        ],
      };

      const response = await ProductService.createProduct(productData);
      if (response?.status === 201) {
        Alert.alert("Success", "Product added successfully");
        navigation.goBack();
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
        <InputField
          icon="dollar-sign"
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <InputField
          icon="hash"
          placeholder="Initial Quantity"
          value={initialQuantity}
          onChangeText={setInitialQuantity}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Feather name="map-pin" size={24} style={styles.inputIcon} />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Picker
              style={styles.picker}
              selectedValue={selectedStock}
              onValueChange={setSelectedStock}
            >
              <Picker.Item label="Select Stock Location" value="" />
              {stocks.length > 0 ? (
                stocks.map((stock) => (
                  <Picker.Item
                    key={stock.id}
                    label={stock.localisation.city}
                    value={stock.id}
                  />
                ))
              ) : (
                <Picker.Item label="No stocks available" value="" />
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
