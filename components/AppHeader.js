import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Reusable App Header component
 * Displays title with optional back button and right icon/action
 * @param {string} title - Header title
 * @param {boolean} showBack - Show back button (default: true if not on root screen)
 * @param {function} onBackPress - Custom back handler
 * @param {string} rightIcon - Ionicons icon name for right action
 * @param {function} onRightPress - Callback for right icon press
 * @param {boolean} centered - Center the title (default: false)
 * @param {number} paddingTop - Top padding for the header (default: 8)
 */
export default function AppHeader({
  title,
  showBack = false,
  onBackPress = null,
  rightIcon = null,
  onRightPress = null,
  centered = true,
  rightActions = null,
  paddingTop = 8,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.headerContent}>
        {/* Left side - back button or spacer */}
        <View style={styles.headerLeft}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* Center - title */}
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.headerTitle,
              centered ? styles.headerTitleCentered : styles.headerTitleLeft,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right side - actions */}
        <View style={styles.headerRight}>
          {rightActions ? (
            <View style={styles.rightActionsContainer}>{rightActions}</View>
          ) : rightIcon && onRightPress ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.headerButton}
            >
              <Ionicons name={rightIcon} size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  headerButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    maxWidth: "80%",
  },
  headerTitleCentered: {
    textAlign: "center",
  },
  headerTitleLeft: {
    textAlign: "left",
    alignSelf: "center",
  },
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
