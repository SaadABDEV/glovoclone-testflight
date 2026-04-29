import React, { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import {
  CardField,
  PlatformPay,
  confirmPayment,
  confirmPlatformPayPayment,
  isPlatformPaySupported
} from "@stripe/stripe-react-native";
import { useCart } from "../state/CartContext";
import { api } from "../api/client";

export const CartScreen = () => {
  const { items, totalCents, clear, restaurantId } = useCart();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const payloadItems = useMemo(
    () =>
      items.map((entry) => ({
        menuItemId: entry.item.id,
        quantity: entry.quantity
      })),
    [items]
  );

  const createOrderAndIntent = async () => {
    if (!restaurantId) throw new Error("Restaurant introuvable.");
    const location = await Location.getCurrentPositionAsync({});
    const order = await api.post("/orders", {
      restaurantId,
      items: payloadItems,
      deliveryLat: location.coords.latitude,
      deliveryLng: location.coords.longitude
    });

    const intent = await api.post("/payments/intent", {
      orderId: order.data.id,
      amountCents: totalCents
    });

    setLastOrderId(order.data.id);
    return intent.data.clientSecret as string;
  };

  const payWithApplePay = async () => {
    setLoading(true);
    try {
      const supported = await isPlatformPaySupported();
      if (!supported) throw new Error("Apple Pay non supporte.");

      const clientSecret = await createOrderAndIntent();
      const result = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          merchantCountryCode: "FR",
          currencyCode: "EUR",
          cartItems: [
            {
              label: "Commande",
              amount: (totalCents / 100).toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate
            }
          ]
        }
      });

      if (result.error) throw new Error(result.error.message);
      clear();
      Alert.alert("Paiement reussi", "Votre commande est en preparation.");
    } catch (error) {
      Alert.alert("Paiement", error instanceof Error ? error.message : "Echec Apple Pay.");
    } finally {
      setLoading(false);
    }
  };

  const payWithCard = async () => {
    if (!cardComplete) {
      Alert.alert("Carte", "Completez les informations de carte.");
      return;
    }
    setLoading(true);
    try {
      const clientSecret = await createOrderAndIntent();
      const result = await confirmPayment(clientSecret, { paymentMethodType: "Card" });
      if (result.error) throw new Error(result.error.message);
      clear();
      Alert.alert("Paiement reussi", "Votre commande est en preparation.");
    } catch (error) {
      Alert.alert("Paiement", error instanceof Error ? error.message : "Echec carte bancaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(entry) => entry.item.id}
        ListHeaderComponent={<Text style={styles.title}>Panier</Text>}
        ListFooterComponent={
          <View style={{ gap: 10 }}>
            <Text style={styles.total}>Total: {(totalCents / 100).toFixed(2)} EUR</Text>
            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              disabled={loading || !items.length}
              onPress={payWithApplePay}
            >
              <Text style={styles.buttonText}>Payer avec Apple Pay</Text>
            </TouchableOpacity>
            <CardField
              postalCodeEnabled
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={{ backgroundColor: "#fff", textColor: "#111827" }}
              style={{ width: "100%", height: 50 }}
              onCardChange={(details) => setCardComplete(Boolean(details.complete))}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              disabled={loading || !items.length}
              onPress={payWithCard}
            >
              <Text style={styles.buttonText}>Payer par carte</Text>
            </TouchableOpacity>
            {lastOrderId ? <Text style={styles.orderId}>Derniere commande: {lastOrderId}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>
              {item.item.name} x {item.quantity}
            </Text>
            <Text>{((item.item.price_cents * item.quantity) / 100).toFixed(2)} EUR</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  name: { fontWeight: "600" },
  total: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  button: {
    backgroundColor: "#111827",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
  orderId: { color: "#6b7280", fontSize: 12 }
});
