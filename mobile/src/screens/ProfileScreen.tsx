import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../state/AuthContext";
import { api } from "../api/client";

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const enableNotifications = async () => {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Notifications", "Permission refusee.");
      return;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    await api.post("/notifications/register-token", { token: token.data });
    Alert.alert("Notifications", "Notifications activees.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={enableNotifications}>
        <Text style={styles.buttonText}>Activer notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={signOut}>
        <Text style={styles.buttonText}>Deconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  email: { fontSize: 16, color: "#4b5563" },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  secondary: { backgroundColor: "#374151" },
  buttonText: { color: "#fff", fontWeight: "700" }
});
