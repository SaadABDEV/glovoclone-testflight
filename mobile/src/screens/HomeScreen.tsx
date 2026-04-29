import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../api/client";
import { Restaurant } from "../types";
import { HomeStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export const HomeScreen = ({ navigation }: Props) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNearby = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const response = await api.get<Restaurant[]>("/restaurants", {
        params: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
      setRestaurants(response.data);
      setLoading(false);
    };

    loadNearby();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={restaurants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("Restaurant", {
              restaurantId: item.id,
              restaurantName: item.name
            })
          }
        >
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>Livraison estimee: {item.eta_min} min</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 12, gap: 12 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden"
  },
  image: { width: "100%", height: 140 },
  name: { fontSize: 18, fontWeight: "700", paddingHorizontal: 12, paddingTop: 12 },
  meta: { color: "#6b7280", paddingHorizontal: 12, paddingBottom: 12 }
});
