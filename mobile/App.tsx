import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useColorScheme } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/state/AuthContext";
import { CartProvider } from "./src/state/CartContext";
import { ConsentProvider } from "./src/state/ConsentContext";

const stripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const merchantId = process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID ?? "";

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider publishableKey={stripeKey} merchantIdentifier={merchantId}>
      <ConsentProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <RootNavigator />
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </ConsentProvider>
    </StripeProvider>
  );
}
