import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductScannerProps {
  showScanner: boolean;
  setShowScanner: (show: boolean) => void;
  onBarcodeScanned: (scanData: { type: string; data: string }) => void;
}

const ProductScanner: React.FC<ProductScannerProps> = ({
  showScanner,
  setShowScanner,
  onBarcodeScanned,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = (scanData: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      onBarcodeScanned(scanData);
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showScanner}
      onRequestClose={() => setShowScanner(false)}
    >
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barCodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={styles.scannerMarker} />
              <Text style={styles.scanText}>Position barcode within frame</Text>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
        </CameraView>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowScanner(false)}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  focusedContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerMarker: {
    width: 280,
    height: 230,
    borderWidth: 2,
    borderColor: "#00FF00",
    backgroundColor: "transparent",
  },
  scanText: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 10,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
});

export default ProductScanner;
