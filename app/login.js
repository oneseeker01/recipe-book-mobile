import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";
import { useColors } from "../hooks/useTheme";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      console.log("Firebase Auth successful:", userCredential.user.uid);

      try {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        console.log("Checking Firestore document:", userDocRef.path);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log("No Firestore document found for user");
          try {
            await signOut(auth);
          } catch (e) {
            console.warn("Sign out error:", e);
          }
          Alert.alert(
            "Account Not Found",
            "Your account exists in Firebase Auth but not in our database. Please sign up first to create your profile."
          );
          return;
        }

        console.log("User document found:", userDocSnap.data());
        console.log("Login successful - navigating to home");

        // Navigate to home screen after successful login
        router.replace("/(tabs)/home");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        try {
          await signOut(auth);
        } catch (e) {
          console.warn("Sign out error:", e);
        }
        Alert.alert(
          "Login Error",
          `Unable to verify your account: ${firestoreError.message}`
        );
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      console.log("Guest login successful");
      // Navigate to home screen
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Guest Login Failed", error);
      Alert.alert("Guest Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <View style={[styles.logoContainer, { backgroundColor: colors.backgroundCard }]}>
                <Image
                  source={require("../assets/images/recipebook.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Recipe Book</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>Discover Culinary Delights</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Welcome Back!</Text>

              <View style={[styles.inputContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.borderPrimary }]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.borderPrimary }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color={colors.textInverse} />
                    <Text style={[styles.loginButtonText, { color: colors.textInverse }]}>Login</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                style={{ alignSelf: "flex-end", marginTop: 10 }}
                disabled={loading}
              >
                <Text style={[{ fontSize: 13 }, { color: colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.guestButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleGuestLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="person-outline" size={20} color={colors.textInverse} />
                    <Text style={[styles.loginButtonText, { color: colors.textInverse }]}>
                      Continue as Guest
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.signupSection}>
                <Text style={[styles.signupText, { color: colors.textSecondary }]}>No account yet? </Text>
                <Link href="/signup">
                  <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
                </Link>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textTertiary }]}>Recipe Book v1.0</Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "flex-start",
  },
  headerSection: { alignItems: "center", marginTop: 80, marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: { width: 80, height: 80, borderRadius: 40 },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  tagline: { fontSize: 14, color: "#999", marginBottom: 0 },
  formSection: { marginBottom: 32 },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 48, fontSize: 16, color: "#1A1A1A" },
  eyeIcon: { padding: 8 },
  loginButton: {
    backgroundColor: "#A12D2A",
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  guestButton: {
    backgroundColor: "#666",
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    shadowColor: "#666",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: { fontSize: 14, color: "#666" },
  signupLink: { fontSize: 14, color: "#A12D2A", fontWeight: "bold" },
  footer: { alignItems: "center", paddingTop: 16, paddingBottom: 16 },
  footerText: { fontSize: 12, color: "#CCC" },
});
