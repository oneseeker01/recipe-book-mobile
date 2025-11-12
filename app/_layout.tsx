import { Stack } from "expo-router";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../firebaseConfig";
import { ThemeProvider } from "../hooks/useTheme";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#A12D2A" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!user && (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </>
        )}
        {user && (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="chef-detail/[userId]"
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="recipe-detail/[id]"
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="admin"
              options={{
                presentation: "modal",
              }}
            />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}
