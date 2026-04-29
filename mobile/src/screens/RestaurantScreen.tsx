import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../api/client";
import { MenuItem } from "../types";
import { HomeStackParamList } from "../navigation/RootNavigator";
import { useCart } from "../state/CartContext";

type Props = NativeStackScreenProps<HomeStackParamList, "Restaurant">;

export const RestaurantScreen = ({ route, navigation }: Props) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const { addItem, totalCents } = useCart();
  const { restaurantId, restaurantName } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: restaurantName });
  }, [navigation, restaurantName]);

  useEffect(() => {
    api.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`).then((response) => setItems(response.data));
  }, [restaurantId]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>{(item.price_cents / 100).toFixed(2)} EUR</Text>
            </View>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
            <TouchableOpacity style={styles.addButton} onPress={() => addItem(restaurantId, item)}>
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.cartButton} onPress={() => navigation.getParent()?.navigate("Panier")}>
        <Text style={styles.cartText}>Voir panier - {(totalCents / 100).toFixed(2)} EUR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: 12, gap: 12, paddingBottom: 88 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    gap: 10
  },
  name: { fontWeight: "700", fontSize: 16 },
  description: { color: "#6b7280", marginTop: 4 },
  price: { marginTop: 6, fontWeight: "700" },
  image: { width: 70, height: 70, borderRadius: 10 },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center"
  },
  addText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: -2 },
  cartButton: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 14,
    alignItems: "center"
  },
  cartText: { color: "#fff", fontWeight: "700" }
});
