/**
 * Animation Utilities for Recipe Book App
 * Provides smooth animations and transitions using React Native Animated API
 */

import { Animated, Easing } from "react-native";

// Animation configurations
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Create animated value
export const createAnimatedValue = (
  initialValue: number = 0
): Animated.Value => {
  return new Animated.Value(initialValue);
};

// Fade animation
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  type: "in" | "out" | "inOut" = "in"
): Animated.CompositeAnimation => {
  const toValue = type === "in" ? 1 : type === "out" ? 0 : 1;
  const fromValue = type === "in" ? 0 : type === "out" ? 1 : 0;

  animatedValue.setValue(fromValue);

  return Animated.timing(animatedValue, {
    toValue,
    duration: animations.normal,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  });
};

// Slide animation
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  direction: "up" | "down" | "left" | "right" = "up"
): Animated.CompositeAnimation => {
  const translateValue = 50;
  const toValue = 0;
  const fromValue =
    direction === "up" || direction === "left"
      ? translateValue
      : -translateValue;

  animatedValue.setValue(fromValue);

  return Animated.timing(animatedValue, {
    toValue,
    duration: animations.normal,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

// Scale animation
export const createScaleAnimation = (
  animatedValue: Animated.Value,
  type: "in" | "out" = "in"
): Animated.CompositeAnimation => {
  const toValue = type === "in" ? 1 : 0.8;
  const fromValue = type === "in" ? 0.8 : 1;

  animatedValue.setValue(fromValue);

  return Animated.timing(animatedValue, {
    toValue,
    duration: animations.fast,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

// Spring animation
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  config = { tension: 2, friction: 8 }
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: config.tension,
    friction: config.friction,
    useNativeDriver: true,
  });
};

// Bounce animation
export const createBounceAnimation = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.spring(animatedValue, {
      toValue: 1,
      velocity: 8,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 0.95,
      velocity: 8,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      velocity: 8,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }),
  ]);
};

// Rotate animation
export const createRotateAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1
): Animated.CompositeAnimation => {
  animatedValue.setValue(0);

  return Animated.timing(animatedValue, {
    toValue,
    duration: animations.normal,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  });
};

// Haptic feedback simulation (for future enhancement)
export const hapticFeedback = {
  light: () => {
    // Simulated light haptic feedback
    console.log("Haptic: light");
  },
  medium: () => {
    // Simulated medium haptic feedback
    console.log("Haptic: medium");
  },
  heavy: () => {
    // Simulated heavy haptic feedback
    console.log("Haptic: heavy");
  },
};

// Animation hook for components
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = createAnimatedValue(initialValue);

  return {
    animatedValue,
    fadeIn: () => createFadeAnimation(animatedValue, "in").start(),
    fadeOut: () => createFadeAnimation(animatedValue, "out").start(),
    slideUp: () => createSlideAnimation(animatedValue, "up").start(),
    slideDown: () => createSlideAnimation(animatedValue, "down").start(),
    scaleIn: () => createScaleAnimation(animatedValue, "in").start(),
    scaleOut: () => createScaleAnimation(animatedValue, "out").start(),
    bounce: () => createBounceAnimation(animatedValue).start(),
  };
};

// Common animation presets
export const animationPresets = {
  // Card entrance animation
  cardEnter: (animatedValue: Animated.Value) => {
    animatedValue.setValue(0);
    return Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
  },

  // Button press animation
  buttonPress: (animatedValue: Animated.Value) => {
    return Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
  },

  // Button release animation
  buttonRelease: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    });
  },

  // Loading spinner animation
  loading: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  },

  // List item animation
  listItem: (animatedValue: Animated.Value) => {
    animatedValue.setValue(0);
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },
};

export default animations;
