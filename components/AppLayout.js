import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useColors } from "../hooks/useTheme";

/**
 * Global AppLayout wrapper component
 * Provides consistent padding, background, and safe area
 * Used as a wrapper for all main screens
 * @param {React.ReactNode} children - Screen content
 * @param {boolean} scrollable - Wrap in ScrollView (default: true)
 * @param {string} backgroundColor - Background color (default: app background)
 * @param {object} style - Additional custom styles
 * @param {boolean} hasHeader - Whether the screen has a header (affects top padding)
 * @param {boolean} isList - Whether content is a FlatList/SectionList (skips ScrollView wrapping)
 */
export default function AppLayout({
  children,
  scrollable = true,
  backgroundColor,
  style = {},
  hasHeader = false,
  header = null,
  isList = false,
}) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  // Use theme background if no custom color provided
  const bgColor = backgroundColor || colors.background;

  // When wrapped in a ScrollView we must NOT force the inner container to flex:1
  // because that prevents the ScrollView from measuring content height and
  // makes scrolling behave like a fixed layout. For non-scrollable screens we
  // still want the content to fill the available space.
  const innerBase = {
    backgroundColor: bgColor,
    paddingTop: hasHeader ? 0 : 8,
    // Add bottom padding to account for system nav buttons + extra spacing
    paddingBottom: Math.max(16, insets.bottom + 16),
  };

  const containerStyle = [
    // Use container (which includes flex:1) only when NOT scrollable.
    scrollable && !isList ? styles.containerNonFlex : styles.container,
    innerBase,
    style,
  ];

  const content = <View style={containerStyle}>{children}</View>;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: bgColor }]}
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Render optional fixed header outside the scrollable content */}
      {header}

      {scrollable && !isList ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Default container for screens that should stretch to fill the space
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20, // Increased from 6 to provide more bottom spacing for system nav
  },
  // Container variant used when wrapping inside a ScrollView (no flex:1)
  containerNonFlex: {
    paddingHorizontal: 16,
    paddingBottom: 20, // Increased from 6 to provide more bottom spacing for system nav
  },
});
