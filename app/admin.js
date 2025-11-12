import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import Card from "../components/Card";
import { auth, db } from "../firebaseConfig";
import { isAdmin } from "../lib/auth-helpers";

export default function AdminScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    activeUsers: 0,
    publishedRecipes: 0,
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);

    // Check admin privileges
    const checkAdminStatus = async () => {
      if (currentUser) {
        const adminStatus = await isAdmin(currentUser);
        setIsUserAdmin(adminStatus);
        if (adminStatus) {
          loadDashboardData();
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);

      // Load recipes
      const recipesSnapshot = await getDocs(collection(db, "recipes"));
      const recipesList = recipesSnapshot.docs.map((doc) => ({
        recipeId: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesList);

      // Calculate stats
      const totalUsers = usersList.length;
      const activeUsers = usersList.filter((u) => u.emailVerified).length;
      const totalRecipes = recipesList.length;
      const publishedRecipes = recipesList.filter((r) => r.isPublished).length;

      setStats({
        totalUsers,
        totalRecipes,
        activeUsers,
        publishedRecipes,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", userId));
              Alert.alert("Success", "User deleted successfully");
              loadDashboardData();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecipe = async (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "recipes", recipeId));
              Alert.alert("Success", "Recipe deleted successfully");
              loadDashboardData();
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Error", "Failed to delete recipe");
            }
          },
        },
      ]
    );
  };

  // Access denied screen
  if (!loading && !isUserAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader
          title="Admin Access Denied"
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="shield-outline" size={64} color="#E74C3C" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            You need administrator privileges to access this section.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDashboard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Dashboard Overview</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={24} color="#A12D2A" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#27AE60"
            />
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={24} color="#3498DB" />
            <Text style={styles.statNumber}>{stats.totalRecipes}</Text>
            <Text style={styles.statLabel}>Total Recipes</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="publish-outline" size={24} color="#F39C12" />
            <Text style={styles.statNumber}>{stats.publishedRecipes}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card variant="flat" padding={20} style={styles.sectionCard}>
        <Text style={styles.cardTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            title="Add Recipe"
            onPress={() => router.push("/(tabs)/myrecipes?admin=true")}
            variant="primary"
            iconName="add-circle-outline"
            style={styles.quickActionButton}
          />
          <Button
            title="Manage Users"
            onPress={() => setActiveTab("users")}
            variant="secondary"
            iconName="people-outline"
            style={styles.quickActionButton}
          />
        </View>
      </Card>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 User Management</Text>
        <Text style={styles.countText}>({users.length} users)</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <Card variant="flat" padding={16} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(item.displayName || item.email || "U")[0]}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {item.displayName || "No Name"}
                </Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          item.role === "admin" ? "#E74C3C" : "#95A5A6",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.role || "user"}</Text>
                  </View>
                  {item.emailVerified && (
                    <View
                      style={[styles.badge, { backgroundColor: "#27AE60" }]}
                    >
                      <Text style={styles.badgeText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/chef-detail/${item.uid}`)}
              >
                <Ionicons name="eye-outline" size={20} color="#3498DB" />
              </TouchableOpacity>
              {item.uid !== user?.uid && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteUser(item.uid)}
                >
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );

  const renderRecipes = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🍳 Recipe Management</Text>
        <Text style={styles.countText}>({recipes.length} recipes)</Text>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.recipeId}
        renderItem={({ item }) => (
          <Card variant="flat" padding={16} style={styles.recipeCard}>
            <View style={styles.recipeHeader}>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>
                  {item.title || "Untitled"}
                </Text>
                <Text style={styles.recipeMeta}>
                  by {item.authorId?.slice(0, 8)}... • {item.category}
                </Text>
                <View style={styles.recipeBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: item.isPublished
                          ? "#27AE60"
                          : "#95A5A6",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "#F39C12" }]}>
                    <Text style={styles.badgeText}>{item.difficulty}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.recipeActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/recipe-detail/${item.recipeId}`)}
              >
                <Ionicons name="eye-outline" size={20} color="#3498DB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteRecipe(item.recipeId)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );

  return (
    <AppLayout
      scrollable={false}
      header={
        <AppHeader
          title="Admin Dashboard"
          showBack={true}
          onBackPress={() => router.back()}
        />
      }
    >
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: "dashboard", label: "Dashboard", icon: "analytics-outline" },
          { key: "users", label: "Users", icon: "people-outline" },
          { key: "recipes", label: "Recipes", icon: "restaurant-outline" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? "#FFF" : "#666"}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "recipes" && renderRecipes()}
      </View>
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#A12D2A",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabLabel: {
    color: "#FFF",
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userBadges: {
    flexDirection: "row",
    gap: 4,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  recipeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recipeHeader: {
    flex: 1,
  },
  recipeInfo: {
    gap: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  recipeMeta: {
    fontSize: 12,
    color: "#666",
  },
  recipeBadges: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
  },
});
