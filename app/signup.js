import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      try {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: "",
          profilePicture: "",
          bio: "",
          age: null,
          sex: "",
          birthday: null,
          followers: [],
          followersCount: 0,
          totalRecipes: 0,
          totalLikes: 0,
          averageRating: 0,
          totalReceivedRatings: 0,
          emailVerified: true, // Auto-verify user
          role: "user",
          isAdmin: false,
          isGuest: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
      }

      // Show success popup and redirect to login
      Alert.alert(
        "Success!",
        "Account created successfully! Please login to continue.",
        [
          {
            text: "OK",
            onPress: () => {
              // Sign out the user immediately and redirect to login
              auth.signOut();
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/recipebook.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appTitle}>Recipe Book</Text>
              <Text style={styles.tagline}>Join the community</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Create Account</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#A12D2A"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#AAA"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#A12D2A"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#AAA"
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
                    color="#A12D2A"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#A12D2A"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#AAA"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#A12D2A"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  loading && styles.signUpButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginSection}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Link href="/login">
                  <Text style={styles.loginLink}>Login</Text>
                </Link>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Recipe Book v1.0</Text>
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
  headerSection: { alignItems: "center", marginTop: 120, marginBottom: 48 },
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
  formSection: { marginBottom: 40 },
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
  signUpButton: {
    backgroundColor: "#A12D2A",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: { fontSize: 14, color: "#666" },
  loginLink: { fontSize: 14, color: "#A12D2A", fontWeight: "bold" },
  footer: { alignItems: "center", paddingTop: 16, paddingBottom: 16 },
  footerText: { fontSize: 12, color: "#CCC" },
});
