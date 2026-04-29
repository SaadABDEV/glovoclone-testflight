import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../state/AuthContext";
import { useConsent } from "../state/ConsentContext";
import { AuthScreen } from "../screens/AuthScreen";
import { ConsentScreen } from "../screens/ConsentScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { RestaurantScreen } from "../screens/RestaurantScreen";
import { CartScreen } from "../screens/CartScreen";
import { TrackingScreen } from "../screens/TrackingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type HomeStackParamList = {
  Home: undefined;
  Restaurant: { restaurantId: string; restaurantName: string };
  Tracking: { orderId: string };
};

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: "Restaurants" }} />
    <HomeStack.Screen name="Restaurant" component={RestaurantScreen} />
    <HomeStack.Screen name="Tracking" component={TrackingScreen} options={{ title: "Suivi" }} />
  </HomeStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Explorer" component={HomeStackNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Panier" component={CartScreen} />
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const { acceptedPrivacy, loading: consentLoading } = useConsent();

  if (authLoading || consentLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!acceptedPrivacy ? (
        <RootStack.Screen name="Consent" component={ConsentScreen} />
      ) : !user ? (
        <RootStack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <RootStack.Screen name="Main" component={MainTabs} />
      )}
    </RootStack.Navigator>
  );
};
