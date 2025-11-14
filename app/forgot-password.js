import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import AppLayout from "../components/AppLayout";
import { auth } from "../firebaseConfig";
import { useColors } from "../hooks/useTheme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "Check Your Email",
        "We sent a password reset email. Follow the link in your inbox to change your password.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <AppLayout
            scrollable={true}
            hasHeader={true}
            header={<AppHeader title="Forgot Password" showBack />}
          >
            <View style={styles.content}>
              <View style={[styles.infoCard, { backgroundColor: colors.backgroundCard, borderColor: colors.borderPrimary }] }>
                <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Reset your password</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }] }>
                  Enter your email address. We will send a secure link to reset your password.
                </Text>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.borderPrimary }] }>
                <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
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

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSendReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={20} color={colors.textInverse} />
                    <Text style={[styles.sendButtonText, { color: colors.textInverse }]}>Send Reset Email</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backLink} onPress={() => router.replace("/login")}>
                <Ionicons name="arrow-back" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, marginLeft: 6 }}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </AppLayout>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  sendButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  backLink: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
});
