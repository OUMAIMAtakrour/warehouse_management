import React from "react";
import { TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Product } from "../types";
import { colors } from "../../assets/style/common";

const generateHtml = (product: Product) => {
  const totalStock = product.stocks.reduce(
    (sum, stock) => sum + stock.quantity,
    0
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: -apple-system, system-ui; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .product-image { max-width: 300px; margin: 0 auto; display: block; }
          .product-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .product-type { color: #666; margin-bottom: 20px; }
          .info-section { margin: 20px 0; }
          .info-item { margin: 10px 0; }
          .info-label { color: #666; }
          .stock-location { padding: 10px 0; border-bottom: 1px solid #eee; }
          .timestamp { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${product.image}" class="product-image" />
          <h1 class="product-name">${product.name}</h1>
          <div class="product-type">${product.type}</div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">Price:</span> $${product.price.toFixed(2)}
          </div>
          <div class="info-item">
            <span class="info-label">Total Stock:</span> ${totalStock} units
          </div>
          <div class="info-item">
            <span class="info-label">Supplier:</span> ${product.supplier}
          </div>
        </div>

        <div class="info-section">
          <h2>Stock Locations</h2>
          ${product.stocks
            .map(
              (stock) => `
            <div class="stock-location">
              <div><span class="info-label">Location:</span> ${stock.localisation.city}</div>
              <div><span class="info-label">Quantity:</span> ${stock.quantity} units</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="timestamp">
          Last updated: ${new Date(product.editedBy.at).toLocaleString()}
          by ${product.editedBy.by}
        </div>
      </body>
    </html>
  `;
};

interface ExportPDFButtonProps {
  product: Product;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ product }) => {
  const handleExport = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateHtml(product),
        base64: false,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  return (
    <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
      <Feather name="download" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ExportPDFButton;
