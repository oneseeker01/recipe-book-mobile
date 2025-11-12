import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * Reusable Card component for displaying content in a container
 * Matches app theme with shadow and rounded corners
 * @param {React.ReactNode} children - Content inside the card
 * @param {object} style - Additional custom styles
 * @param {number} padding - Padding inside card (default: 16)
 * @param {string} variant - "elevated" | "flat" | "outlined"
 */
export default function Card({
  children,
  style = {},
  padding = 16,
  variant = "elevated",
}) {
  return (
    <View style={[styles.card, styles[`card_${variant}`], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  card_elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  card_flat: {
    shadowColor: "transparent",
  },
  card_outlined: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});
