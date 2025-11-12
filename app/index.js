import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in - redirect to tabs (main app)
        router.replace("/(tabs)/home");
      } else {
        // No user - redirect to login
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
      }}
    >
      <ActivityIndicator size="large" color="#A12D2A" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: "#666",
        }}
      >
        Loading Recipe Book...
      </Text>
    </View>
  );
}
