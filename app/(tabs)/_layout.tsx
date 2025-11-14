import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";
import { useTheme } from "../../hooks/useTheme";

// A helper function to render tab icons (compact for Android nav)
function TabBarIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  const { appTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Listen for auth state and subscribe to unread notifications when signed in
    let unsubscribeNotifications = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      if (!user) {
        setUnreadCount(undefined);
        return;
      }

      const notificationsRef = collection(
        db,
        "users",
        user.uid,
        "notifications"
      );
      const q = query(notificationsRef, where("isRead", "==", false));
      unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size || undefined);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.iconSecondary,
        tabBarLabelStyle: {
          display: "none", // Hide tab labels - icon only
        },
        tabBarStyle: {
          backgroundColor: appTheme.colors.background,
          height: 70 + Math.max(insets.bottom, 12), // Increased base height + adaptive inset
          paddingBottom: Math.max(12, insets.bottom + 8), // Extra padding for system nav clearance
          paddingTop: 10,
          paddingHorizontal: 8,
          borderTopWidth: 1,
          borderTopColor: appTheme.colors.borderPrimary,
          elevation: 12, // Increased shadow elevation
          shadowColor: appTheme.colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: appTheme.isDark ? 0.4 : 0.15,
          shadowRadius: 6,
        },
        tabBarIconStyle: {
          marginBottom: 0, // Remove bottom margin for compact look
        },
        headerStyle: {
          backgroundColor: appTheme.colors.primary,
        },
        headerTintColor: appTheme.colors.textInverse,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {/* Home Tab - Browse Recipes & Chefs */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* My Recipes Tab - User's Own Recipes */}
      <Tabs.Screen
        name="myrecipes"
        options={{
          title: "My Recipes",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="document-text" color={color} />
          ),
        }}
      />

      {/* Favorites Tab - Saved Recipes & Chefs */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />

      {/* Gemini AI Tab - Cooking Assistant */}
      <Tabs.Screen
        name="gemini"
        options={{
          title: "AI Chat",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="sparkles" color={color} />
          ),
        }}
      />

      {/* Notifications Tab - Updates from Admin */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="notifications" color={color} />
          ),
          tabBarBadge: unreadCount,
          tabBarBadgeStyle: {
            backgroundColor: "#E74C3C",
            color: "#FFF",
            fontSize: 10,
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />

      {/* Profile Tab - User Profile & Settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
