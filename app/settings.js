import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc, updateDoc, updatePassword } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DatePickerAndroid,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import AppHeader from "../components/AppHeader";
import AppLayout from "../components/AppLayout";
import { auth, db } from "../firebaseConfig";
import { useColors, useTheme } from "../hooks/useTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const currentUser = auth.currentUser;
  const { isDark, toggleTheme } = useTheme();
  const colors = useColors();

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: "",
    sex: "",
    birthday: "", // Format: YYYY-MM-DD
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFormData({
            username: userData.displayName || "",
            email: currentUser.email || "",
            age: userData.age ? String(userData.age) : "",
            sex: userData.sex || "",
            birthday: userData.birthday || "",
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            username: currentUser.displayName || "",
            email: currentUser.email || "",
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleDatePicker = async () => {
    if (Platform.OS === "android" && DatePickerAndroid) {
      try {
        const { action, year, month, day } = await DatePickerAndroid.open({
          date: formData.birthday ? new Date(formData.birthday) : new Date(),
        });

        if (action !== DatePickerAndroid.dismissedAction) {
          const selectedDate = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          setFormData((prev) => ({
            ...prev,
            birthday: selectedDate,
          }));
        }
      } catch ({ code, message }) {
        console.log("Error selecting date:", message);
      }
    } else {
      // iOS or fallback - show modal with simple date picker UI
      setShowDatePicker(true);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert("Validation Error", "Please enter your username");
      return;
    }

    if (
      formData.age &&
      (isNaN(formData.age) ||
        parseInt(formData.age) < 0 ||
        parseInt(formData.age) > 150)
    ) {
      Alert.alert("Validation Error", "Please enter a valid age (0-150)");
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);

      const updateData = {
        displayName: formData.username,
      };

      // Only include optional fields if they have values
      if (formData.age) {
        updateData.age = parseInt(formData.age);
      }
      if (formData.sex) {
        updateData.sex = formData.sex;
      }
      if (formData.birthday) {
        updateData.birthday = formData.birthday;
      }

      // Check if document exists
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Document exists - update it
        await updateDoc(userDocRef, updateData);
      } else {
        // Document doesn't exist - create it with updateData
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          followers: [],
          followersCount: 0,
          totalRecipes: 0,
          totalLikes: 0,
          averageRating: 0,
          totalReceivedRatings: 0,
          isGuest: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...updateData,
        });
      }

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate password inputs
    if (!passwordData.newPassword.trim()) {
      Alert.alert("Validation Error", "Please enter a new password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await updatePassword(currentUser, passwordData.newPassword);

      // Reset password form
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
        showNewPassword: false,
        showConfirmPassword: false,
      });
      setShowPasswordForm(false);

      Alert.alert("Success", "Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/weak-password") {
        Alert.alert(
          "Error",
          "Password is too weak. Please choose a stronger password."
        );
      } else {
        Alert.alert("Error", "Failed to update password. Please try again.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={false}
      header={<AppHeader title="Edit Profile" showBack={true} />}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 60}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form */}
            <View style={styles.formContainer}>
              {/* Username */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Username *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundInput,
                      borderColor: colors.borderPrimary,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.textMuted}
                  value={formData.username}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, username: text }))
                  }
                />
              </View>

              {/* Dark Mode Toggle */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Appearance
                </Text>
                <View
                  style={[
                    styles.toggleContainer,
                    { backgroundColor: colors.backgroundCard },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => toggleTheme()}
                    activeOpacity={0.7}
                  >
                    <View style={styles.toggleLeft}>
                      <Ionicons
                        name={isDark ? "moon-outline" : "sunny-outline"}
                        size={24}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.toggleLabel,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {isDark ? "Dark Mode" : "Light Mode"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.toggleSwitch,
                        { backgroundColor: colors.backgroundSecondary },
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          {
                            backgroundColor: colors.primary,
                            transform: [{ translateX: isDark ? 20 : 0 }],
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  {isDark ? "Switch to light theme" : "Switch to dark theme"}
                </Text>
              </View>

              {/* Email (Read-only) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>{formData.email}</Text>
                </View>
                <Text style={styles.helperText}>
                  Email cannot be changed here
                </Text>
              </View>

              {/* Age */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor="#AAA"
                  value={formData.age}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, age: text }))
                  }
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              {/* Sex/Gender */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioGroup}>
                  {["Male", "Female", "Other", "Prefer not to say"].map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData((prev) => ({ ...prev, sex: option }))
                        }
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            formData.sex === option &&
                              styles.radioCircleSelected,
                          ]}
                        >
                          {formData.sex === option && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Birthday */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={handleDatePicker}
                >
                  <Ionicons name="calendar-outline" size={20} color="#A12D2A" />
                  <Text style={styles.datePickerText}>
                    {formData.birthday || "Select your birthday"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>Format: YYYY-MM-DD</Text>
              </View>

              {/* Password Change Section */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                {!showPasswordForm ? (
                  <TouchableOpacity
                    style={styles.passwordButton}
                    onPress={() => setShowPasswordForm(true)}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#A12D2A"
                    />
                    <Text style={styles.passwordButtonText}>
                      Change Password
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.passwordForm}>
                    <View style={styles.passwordInputGroup}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="New password"
                        placeholderTextColor="#AAA"
                        value={passwordData.newPassword}
                        onChangeText={(text) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: text,
                          }))
                        }
                        secureTextEntry={!passwordData.showNewPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                          setPasswordData((prev) => ({
                            ...prev,
                            showNewPassword: !prev.showNewPassword,
                          }))
                        }
                      >
                        <Ionicons
                          name={
                            passwordData.showNewPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.passwordInputGroup}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm new password"
                        placeholderTextColor="#AAA"
                        value={passwordData.confirmPassword}
                        onChangeText={(text) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: text,
                          }))
                        }
                        secureTextEntry={!passwordData.showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                          setPasswordData((prev) => ({
                            ...prev,
                            showConfirmPassword: !prev.showConfirmPassword,
                          }))
                        }
                      >
                        <Ionicons
                          name={
                            passwordData.showConfirmPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.passwordButtonRow}>
                      <TouchableOpacity
                        style={[
                          styles.passwordActionButton,
                          styles.passwordCancelButton,
                        ]}
                        onPress={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            newPassword: "",
                            confirmPassword: "",
                            showNewPassword: false,
                            showConfirmPassword: false,
                          });
                        }}
                      >
                        <Text style={styles.passwordCancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.passwordActionButton,
                          styles.passwordSaveButton,
                          changingPassword && styles.passwordSaveButtonDisabled,
                        ]}
                        onPress={handlePasswordChange}
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.passwordSaveText}>
                            Update Password
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                All changes are saved to your profile
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Date Picker Modal - iOS & Fallback */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.datePickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerInputWrapper}>
            <Text style={styles.datePickerLabel}>Enter date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.datePickerInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#AAA"
              value={formData.birthday}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  birthday: text,
                }))
              }
            />
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#1A1A1A",
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
  },
  disabledText: {
    color: "#999",
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  // Dark Mode Toggle Styles
  toggleContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  // Radio Styles
  radioGroup: {
    flexDirection: "column",
    gap: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDD",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#A12D2A",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A12D2A",
  },
  radioLabel: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  // Date Picker Styles
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1A1A1A",
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  datePickerCancel: {
    fontSize: 14,
    color: "#999",
  },
  datePickerDone: {
    fontSize: 14,
    color: "#A12D2A",
    fontWeight: "600",
  },
  datePickerInputWrapper: {
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: 30,
  },
  datePickerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontWeight: "500",
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  // Password Styles
  passwordButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A12D2A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  passwordButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#A12D2A",
    fontWeight: "600",
  },
  passwordForm: {
    gap: 12,
  },
  passwordInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  passwordButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  passwordActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  passwordCancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  passwordCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  passwordSaveButton: {
    backgroundColor: "#A12D2A",
  },
  passwordSaveButtonDisabled: {
    backgroundColor: "#CCC",
  },
  passwordSaveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A12D2A",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#CCC",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
