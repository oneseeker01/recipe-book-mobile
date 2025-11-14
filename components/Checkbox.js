import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Reusable Checkbox component
 * @param {boolean} checked - Whether checkbox is checked
 * @param {function} onChange - Callback when toggled
 * @param {string} label - Label text
 * @param {object} style - Additional styles
 */
export default function Checkbox({
  checked = false,
  onChange,
  label,
  style = {},
}) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onChange?.(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#A12D2A",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  labelChecked: {
    color: "#999",
    textDecorationLine: "line-through",
  },
});
