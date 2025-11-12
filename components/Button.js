import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * Reusable Button component with multiple variants
 * @param {string} title - Button label
 * @param {function} onPress - Callback when pressed
 * @param {string} variant - "primary" | "secondary" | "danger" | "ghost"
 * @param {boolean} loading - Show loading indicator
 * @param {boolean} disabled - Disable button
 * @param {string} iconName - Ionicons icon name (optional)
 * @param {string} size - "small" | "medium" | "large"
 * @param {object} style - Additional custom styles
 */
export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  iconName = null,
  size = "medium",
  style = {},
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "ghost" ? "#444" : "#FFF"}
          />
        ) : (
          <>
            {iconName && (
              <Ionicons
                name={iconName}
                size={getSizeValue(size, "icon")}
                color={
                  variant === "ghost"
                    ? "#444"
                    : variant === "secondary"
                    ? "#A12D2A"
                    : "#FFF"
                }
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.buttonText,
                styles[`buttonText_${variant}`],
                styles[`buttonText_${size}`],
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const getSizeValue = (size, type) => {
  if (type === "icon") {
    return size === "small" ? 14 : size === "large" ? 22 : 18;
  }
  // height
  return size === "small" ? 40 : size === "large" ? 56 : 48;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button_small: {
    height: 40,
    paddingHorizontal: 12,
  },
  button_medium: {
    height: 48,
    paddingHorizontal: 16,
  },
  button_large: {
    height: 56,
    paddingHorizontal: 20,
  },
  button_primary: {
    backgroundColor: "#A12D2A",
    shadowColor: "#A12D2A",
    shadowOpacity: 0.3,
  },
  button_secondary: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#A12D2A",
  },
  button_danger: {
    backgroundColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowOpacity: 0.3,
  },
  button_ghost: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowOpacity: 0.05,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontWeight: "600",
  },
  buttonText_primary: {
    color: "#FFF",
  },
  buttonText_secondary: {
    color: "#A12D2A",
  },
  buttonText_danger: {
    color: "#FFF",
  },
  buttonText_ghost: {
    color: "#444",
  },
  buttonText_small: {
    fontSize: 13,
  },
  buttonText_medium: {
    fontSize: 15,
  },
  buttonText_large: {
    fontSize: 16,
  },
});
