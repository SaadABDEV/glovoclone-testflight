import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/RootNavigator";
import { api } from "../api/client";

type Props = NativeStackScreenProps<HomeStackParamList, "Tracking">;

type TrackingPayload = {
  status: string;
  courier_lat: number;
  courier_lng: number;
  delivery_lat: number;
  delivery_lng: number;
};

export const TrackingScreen = ({ route }: Props) => {
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);
  const { orderId } = route.params;

  useEffect(() => {
    const load = async () => {
      const response = await api.get<TrackingPayload>(`/tracking/${orderId}`);
      setTracking(response.data);
    };

    load();
    const interval = setInterval(load, 7000);
    return () => clearInterval(interval);
  }, [orderId]);

  const eta = useMemo(() => {
    if (!tracking) return null;
    const distance = Math.sqrt(
      Math.pow(tracking.delivery_lat - tracking.courier_lat, 2) +
        Math.pow(tracking.delivery_lng - tracking.courier_lng, 2)
    );
    return Math.max(3, Math.round(distance * 1000));
  }, [tracking]);

  if (!tracking) {
    return (
      <View style={styles.center}>
        <Text>Chargement du tracking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: tracking.delivery_lat,
          longitude: tracking.delivery_lng,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04
        }}
      >
        <Marker
          coordinate={{ latitude: tracking.delivery_lat, longitude: tracking.delivery_lng }}
          title="Vous"
        />
        <Marker
          coordinate={{ latitude: tracking.courier_lat, longitude: tracking.courier_lng }}
          title="Livreur"
          pinColor="#10b981"
        />
        <Polyline
          coordinates={[
            { latitude: tracking.courier_lat, longitude: tracking.courier_lng },
            { latitude: tracking.delivery_lat, longitude: tracking.delivery_lng }
          ]}
          strokeWidth={4}
          strokeColor="#2563eb"
        />
      </MapView>
      <View style={styles.panel}>
        <Text style={styles.status}>Statut: {tracking.status}</Text>
        <Text>ETA estimee: {eta} min</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  panel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 14
  },
  status: { fontWeight: "700", marginBottom: 4 }
});
