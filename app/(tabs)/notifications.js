import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import Card from "../../components/Card";
import { auth, db } from "../../firebaseConfig";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = auth.currentUser;

  // Fetch notifications in real-time
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, "users", user.uid, "notifications");
    const q = query(notificationsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationList = snapshot.docs.map((doc) => ({
          notificationId: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt descending (newest first)
        notificationList.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setNotifications(notificationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(
        doc(db, "users", user.uid, "notifications", notificationId),
        { isRead: true }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Alert.alert("Error", "Failed to mark notification as read");
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.notificationId);
    }

    // Navigate to relevant screen based on notification type
    if (
      (notification.type === "new_recipe" ||
        notification.type === "recipe_updated") &&
      notification.recipeId
    ) {
      router.push(`/recipe-detail/${notification.recipeId}`);
    } else if (
      (notification.type === "new_chef" ||
        notification.type === "chef_updated") &&
      notification.chefId
    ) {
      router.push(`/chef-detail/${notification.chefId}`);
    } else if (
      notification.type === "new_recipe" ||
      notification.type === "recipe_updated"
    ) {
      // Navigate to home screen recipes tab
      router.push("/(tabs)/home");
    } else if (
      notification.type === "new_chef" ||
      notification.type === "chef_updated"
    ) {
      // Navigate to home screen chefs tab
      router.push("/(tabs)/home");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_recipe":
        return "restaurant";
      case "new_chef":
        return "people";
      case "recipe_updated":
        return "create";
      case "chef_updated":
        return "person";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "new_recipe":
        return "#A12D2A"; // Red
      case "new_chef":
        return "#8B4513"; // Brown
      case "recipe_updated":
        return "#3498DB"; // Blue
      case "chef_updated":
        return "#2ECC71"; // Green
      default:
        return "#999";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#A12D2A" />
          <Text style={styles.centeredText}>
            Please sign in to view notifications
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={true}
      hasHeader={true}
      header={
        <AppHeader title="Notifications" centered={true} showBack={false} />
      }
    >
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#DDD" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            You'll get notifications when the admin adds new recipes or chefs
          </Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.notificationId}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <Card
                variant={notification.isRead ? "outlined" : "flat"}
                padding={16}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
              >
                <View style={styles.notificationContent}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: getNotificationColor(
                          notification.type
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color="#FFF"
                    />
                  </View>

                  {/* Message & Time */}
                  <View style={styles.messageContainer}>
                    <Text
                      style={[
                        styles.message,
                        !notification.isRead && styles.messageUnread,
                      ]}
                    >
                      {notification.message}
                    </Text>
                    {notification.createdAt && (
                      <Text style={styles.timestamp}>
                        {formatTimestamp(notification.createdAt)}
                      </Text>
                    )}
                  </View>

                  {/* Unread Indicator */}
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </AppLayout>
  );
}

/**
 * Format Firestore timestamp to readable text
 * Returns: "just now", "2 hours ago", "3 days ago", or date
 */
function formatTimestamp(firebaseTimestamp) {
  if (!firebaseTimestamp || !firebaseTimestamp.seconds) {
    return "recently";
  }

  const now = Date.now() / 1000; // Current time in seconds
  const timestamp = firebaseTimestamp.seconds;
  const diffSeconds = Math.floor(now - timestamp);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return `${days}d ago`;
  } else {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  notificationsList: {
    marginBottom: 16,
  },
  notificationCard: {
    marginBottom: 12,
    marginHorizontal: 0,
  },
  notificationCardUnread: {
    backgroundColor: "#F9F4F0",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  messageUnread: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A12D2A",
    flexShrink: 0,
  },
});
