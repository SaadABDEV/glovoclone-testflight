import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useConsent } from "../state/ConsentContext";

export const ConsentScreen = () => {
  const { setAcceptedPrivacy } = useConsent();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confidentialite & permissions</Text>
      <Text style={styles.text}>
        Nous utilisons votre localisation pour afficher les restaurants proches et suivre la
        livraison. Les notifications servent a vous informer des etapes de commande.
      </Text>
      <Text style={styles.text}>
        Aucune donnee sensible n'est exploitee sans votre consentement explicite.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => setAcceptedPrivacy(true)}>
        <Text style={styles.buttonText}>J'accepte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  text: { fontSize: 16, lineHeight: 22 },
  button: {
    marginTop: 12,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: { color: "#ffffff", fontWeight: "700" }
});
