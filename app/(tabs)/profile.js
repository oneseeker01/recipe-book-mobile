import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  PixelRatio,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import { auth, db } from "../../firebaseConfig";
import { isAdmin } from "../../lib/auth-helpers";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  const AVATAR_SIZE = 100;
  const getOptimizedAvatarUri = (url, sizeDp) => {
    try {
      const root = "res.cloudinary.com/dubvssmrp/image/upload/";
      const i = url.indexOf(root);
      if (i === -1) return url;
      const base = url.slice(0, i + root.length);
      const rest = url.slice(i + root.length);
      if (rest.startsWith("c_")) return url;
      const targetPx = Math.ceil(sizeDp * PixelRatio.get());
      const t = `c_fill,g_face,q_auto,f_auto,w_${targetPx},h_${targetPx}`;
      return `${base}${t}/${rest}`;
    } catch {
      return url;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) {
      // No user logged in - show login prompt
      setUser({
        uid: "guest",
        email: "Not logged in",
        displayName: "Please Login",
        photoURL: "",
        bio: "Please login to view your profile",
        totalRecipes: 0,
        isGuest: true,
      });
      setIsUserAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUser({
          uid: currentUser.uid,
          ...data,
          // Provide default values for display
          displayName:
            data.displayName || currentUser.displayName || "Guest User",
          email: data.email || currentUser.email,
          photoURL: data.photoURL || currentUser.photoURL,
          bio: data.bio || "",
          totalRecipes: data.totalRecipes || 0,
          isGuest: data.isGuest || false,
        });

        // Check if user is admin (skip for guest users)
        if (!data.isGuest) {
          try {
            const adminStatus = await isAdmin(currentUser);
            setIsUserAdmin(adminStatus);
          } catch (error) {
            console.log("Admin check failed:", error);
            setIsUserAdmin(false);
          }
        } else {
          setIsUserAdmin(false);
        }
      } else {
        // Create basic user object if no document exists
        const isGuestUser = currentUser.isAnonymous || !currentUser.email;
        setUser({
          uid: currentUser.uid,
          email: isGuestUser ? "guest@recipebook.app" : currentUser.email,
          displayName: isGuestUser
            ? "Guest User"
            : currentUser.displayName || "User",
          photoURL: currentUser.photoURL,
          bio: isGuestUser ? "Welcome! Sign up to save your favorites." : "",
          totalRecipes: 0,
          isGuest: isGuestUser,
        });
        setIsUserAdmin(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Still provide basic user info on error
      setUser({
        uid: currentUser.uid,
        email: currentUser.email || "Unknown",
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || "",
        bio: "Profile temporarily unavailable",
        totalRecipes: 0,
        isGuest: currentUser.isAnonymous || false,
      });
      setIsUserAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/login");
          } catch (error) {
            console.error("Logout Error", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Profile" centered={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Profile" centered={true} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              window.location.reload();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={true}
      hasHeader={true}
      header={
        <AppHeader
          title="Profile"
          centered={true}
          rightIcon="settings-outline"
          onRightPress={() => router.push("/settings")}
        />
      }
    >
      {/* Simplified Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.profilePicture ? (
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: getOptimizedAvatarUri(user.profilePicture, AVATAR_SIZE) }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          ) : user.photoURL ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.displayName || "U")[0]}
              </Text>
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person-circle" size={80} color="#A12D2A" />
            </View>
          )}
        </View>

        {/* User Info */}
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* Simplified Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.totalRecipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
        </View>
      </View>

      {/* Guest User Welcome Section */}
      {user.isGuest && (
        <View style={styles.guestWelcomeCard}>
          <View style={styles.guestWelcomeHeader}>
            <Ionicons name="star-outline" size={24} color="#F39C12" />
            <Text style={styles.guestWelcomeTitle}>
              {user.uid === "guest" ? "Login Required" : "Unlock Full Features"}
            </Text>
          </View>
          <Text style={styles.guestWelcomeText}>
            {user.uid === "guest"
              ? "Please login to view your profile and access all features."
              : "Sign up to save your favorite recipes, create your own recipes, and sync across devices."}
          </Text>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() =>
              router.push(user.uid === "guest" ? "/login" : "/signup")
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                user.uid === "guest" ? "log-in-outline" : "person-add-outline"
              }
              size={20}
              color="#FFF"
            />
            <Text style={styles.signupButtonText}>
              {user.uid === "guest" ? "Login" : "Sign Up Free"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Admin Dashboard Button */}
      {isUserAdmin && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push("/admin")}
          activeOpacity={0.8}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
          <Text style={styles.adminButtonText}>Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: "#A12D2A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "transparent",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    maxWidth: "90%",
  },
  statsCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#A12D2A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#A12D2A",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  adminButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  adminButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  guestWelcomeCard: {
    backgroundColor: "#FFF9E6",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F39C12",
    shadowColor: "#F39C12",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guestWelcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  guestWelcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  guestWelcomeText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: "#F39C12",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#F39C12",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
