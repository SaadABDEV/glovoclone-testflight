import type { ExpoConfig } from "expo/config";

const bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER ?? "com.yourcompany.glovoclone";
const merchantIdentifier =
  process.env.EXPO_PUBLIC_APPLE_MERCHANT_ID ?? "merchant.com.yourcompany.glovoclone";

const config: ExpoConfig = {
  name: "GlovoClone",
  slug: "glovo-clone",
  scheme: "glovoclone",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier,
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Votre position est utilisee pour afficher les restaurants proches et suivre la livraison en temps reel.",
      NSUserTrackingUsageDescription:
        "Nous demandons votre autorisation afin d'ameliorer l'experience de livraison et les notifications pertinentes."
    }
  },
  plugins: [
    "expo-apple-authentication",
    [
      "@stripe/stripe-react-native",
      {
        merchantIdentifier,
        enableGooglePay: false
      }
    ],
    "expo-notifications"
  ]
};

export default config;
