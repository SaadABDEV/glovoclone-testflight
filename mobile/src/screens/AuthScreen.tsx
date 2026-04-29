import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../state/AuthContext";

export const AuthScreen = () => {
  const { signInWithEmail, signInWithApple } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onEmailSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase());
    } catch {
      Alert.alert("Erreur", "Connexion email impossible.");
    } finally {
      setLoading(false);
    }
  };

  const onAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch {
      Alert.alert("Erreur", "Connexion Apple impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue</Text>
      <Text style={styles.subtitle}>Connectez-vous pour commander.</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="email@exemple.com"
        style={styles.input}
      />
      <TouchableOpacity disabled={loading || !email} style={styles.button} onPress={onEmailSignIn}>
        <Text style={styles.buttonText}>Connexion email</Text>
      </TouchableOpacity>
      {Platform.OS === "ios" && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={10}
          style={styles.appleButton}
          onPress={onAppleSignIn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 14 },
  title: { fontSize: 32, fontWeight: "800" },
  subtitle: { fontSize: 16, color: "#4b5563" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  appleButton: { height: 44 }
});
