/**
 * Animated Loading Components
 * Provides smooth loading animations with theme support
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../hooks/useTheme";

// Animated Spinner Component
export const AnimatedSpinner: React.FC<{
  size?: "small" | "large";
  color?: string;
  style?: any;
}> = ({ size = "large", color, style }) => {
  const { appTheme } = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    return () => rotationAnimation.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        {
          width: size === "large" ? 40 : 20,
          height: size === "large" ? 40 : 20,
          borderRadius: size === "large" ? 20 : 10,
          borderWidth: 3,
          borderStyle: "solid",
          borderTopColor: color || appTheme.colors.primary,
          borderRightColor: appTheme.colors.borderPrimary,
          borderBottomColor: appTheme.colors.borderPrimary,
          borderLeftColor: appTheme.colors.borderPrimary,
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    />
  );
};

// Animated Pulse Component
export const AnimatedPulse: React.FC<{
  children: React.ReactNode;
  duration?: number;
  style?: any;
}> = ({ children, duration = 1000, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [scale, duration]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Loading Container with Skeleton Animation
export const LoadingContainer: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  style?: any;
}> = ({ children, isLoading = true, style }) => {
  const { appTheme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        })
      );
      shimmerAnimation.start();

      return () => shimmerAnimation.stop();
    }
  }, [shimmer, isLoading]);

  const backgroundColor = isLoading
    ? shimmer.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
          appTheme.colors.backgroundSecondary,
          appTheme.colors.backgroundCard,
          appTheme.colors.backgroundSecondary,
        ],
      })
    : appTheme.colors.backgroundCard;

  return (
    <Animated.View
      style={[
        {
          backgroundColor,
          borderRadius: appTheme.borderRadius.md,
        },
        style,
      ]}
    >
      {!isLoading && children}
    </Animated.View>
  );
};

// Skeleton Item for loading states
export const SkeletonItem: React.FC<{
  height?: number;
  width?: number | "100%";
  borderRadius?: number;
  style?: any;
}> = ({ height = 20, width = "100%", borderRadius, style }) => {
  const { appTheme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      appTheme.colors.backgroundSecondary,
      appTheme.colors.backgroundCard,
      appTheme.colors.backgroundSecondary,
    ],
  });

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: borderRadius || appTheme.borderRadius.sm,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Loading State Component
export const LoadingState: React.FC<{
  message?: string;
  showSpinner?: boolean;
  style?: any;
}> = ({ message = "Loading...", showSpinner = true, style }) => {
  const { appTheme } = useTheme();
  const colors = appTheme.colors;

  return (
    <View
      style={[
        styles.loadingContainer,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      {showSpinner && (
        <AnimatedPulse>
          <AnimatedSpinner
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
        </AnimatedPulse>
      )}
      <SkeletonItem height={20} width={120} style={styles.loadingText} />
      <SkeletonItem height={16} width={160} style={styles.loadingSubtext} />
    </View>
  );
};

// Empty State Component with Animation
export const EmptyState: React.FC<{
  icon?: string;
  title?: string;
  message?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
  style?: any;
}> = ({
  icon = "document-outline",
  title = "No data found",
  message = "Get started by adding some content",
  action,
  style,
}) => {
  const { appTheme } = useTheme();
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          backgroundColor: appTheme.colors.background,
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View style={styles.emptyContent}>
        <AnimatedPulse>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: appTheme.colors.backgroundSecondary },
            ]}
          >
            <Text style={{ fontSize: 32, color: appTheme.colors.iconMuted }}>
              {icon}
            </Text>
          </View>
        </AnimatedPulse>

        <SkeletonItem height={24} width={200} style={styles.emptyTitle} />
        <SkeletonItem height={16} width={250} style={styles.emptyMessage} />

        {action && (
          <TouchableOpacity
            style={[
              styles.emptyAction,
              { backgroundColor: appTheme.colors.primary },
            ]}
            onPress={action.onPress}
          >
            <Text
              style={[
                styles.emptyActionText,
                { color: appTheme.colors.textInverse },
              ]}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Fade In Animation Component
export const FadeIn: React.FC<{
  children: React.ReactNode;
  duration?: number;
  style?: any;
}> = ({ children, duration = 300, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
};

// Slide In Animation Component
export const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  style?: any;
}> = ({ children, direction = "up", duration = 300, style }) => {
  const translateValue = direction === "up" || direction === "down" ? 50 : 50;
  const translate = useRef(
    new Animated.Value(
      direction === "up" || direction === "left"
        ? translateValue
        : -translateValue
    )
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translate, duration]);

  const transform =
    direction === "up" || direction === "down"
      ? [{ translateY: translate }]
      : [{ translateX: translate }];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    marginBottom: 8,
  },
  loadingSubtext: {
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyMessage: {
    marginBottom: 24,
  },
  emptyAction: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default {
  AnimatedSpinner,
  AnimatedPulse,
  LoadingContainer,
  SkeletonItem,
  LoadingState,
  EmptyState,
  FadeIn,
  SlideIn,
};
