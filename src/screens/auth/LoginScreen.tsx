import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, commonStyles } from "../../../assets/style/common";
import { authService } from "../../services/auth.service";

export default function LoginScreen({ navigation }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter your secret code");
      return;
    }

    try {
      setLoading(true);
      const user = await authService.login(code.trim());

      if (user) {
        setCode("");
        navigation.replace("Home");
      } else {
        Alert.alert("Error", "Invalid secret code. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Feather name="box" size={64} color={colors.primary} />
        <Text style={styles.logoText}>StockMaster</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your secret code"
        secureTextEntry
        value={code}
        onChangeText={setCode}
        editable={!loading}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 10,
  },
  input: {
    ...commonStyles.input,
    fontSize: 18,
  },
  button: {
    ...commonStyles.button,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
