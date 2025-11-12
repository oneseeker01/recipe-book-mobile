import { StyleSheet, Text, View } from "react-native";

/**
 * Reusable screen header component for consistent typography and spacing.
 * @param {string} title - Main header title
 * @param {string} subtitle - Optional subtitle text
 */
export default function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
  },
});
