import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import RecipeCard from "../../components/RecipeCard";
import { auth, db } from "../../firebaseConfig";

export default function ChefProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = auth.currentUser;

  // Chef Data
  const [chef, setChef] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);

  // Helper function to format date
  const formatBirthday = (birthday) => {
    if (!birthday) return null;
    try {
      const date = new Date(birthday);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return birthday;
    }
  };

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    try {
      const birthDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Fetch chef profile data
  useEffect(() => {
    if (!userId) return;

    const fetchChefData = async () => {
      try {
        setLoading(true);
        const chefDoc = await getDoc(doc(db, "users", userId));

        if (chefDoc.exists()) {
          setChef({
            userId: chefDoc.id,
            ...chefDoc.data(),
          });

          // Check if current user is following this chef
          if (currentUser && currentUser.uid !== userId) {
            const followers = chefDoc.data().followers || [];
            setIsFollowing(followers.includes(currentUser.uid));
          }
        } else {
          Alert.alert("Error", "Chef profile not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching chef profile:", error);
        Alert.alert("Error", "Failed to load chef profile");
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, [userId, currentUser]);

  // Fetch chef's recipes
  useEffect(() => {
    if (!userId) return;

    const fetchChefRecipes = async () => {
      try {
        setRecipesLoading(true);
        const q = query(
          collection(db, "recipes"),
          where("userId", "==", userId),
          where("isPublished", "==", true),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const recipeList = querySnapshot.docs.map((doc) => ({
          recipeId: doc.id,
          ...doc.data(),
        }));
        setRecipes(recipeList);
      } catch (error) {
        console.error("Error fetching chef recipes:", error);
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchChefRecipes();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      Alert.alert("Sign in required", "Please sign in to follow chefs");
      return;
    }

    if (currentUser.uid === userId) {
      Alert.alert(
        "Cannot follow yourself",
        "You cannot follow your own profile"
      );
      return;
    }

    try {
      const chefRef = doc(db, "users", userId);

      // Check if chef document exists
      const chefDoc = await getDoc(chefRef);

      if (!chefDoc.exists()) {
        // Chef document doesn't exist - create it
        await setDoc(
          chefRef,
          {
            uid: userId,
            followers: [currentUser.uid],
            followersCount: 1,
            totalRecipes: 0,
            totalLikes: 0,
            averageRating: 0,
            totalReceivedRatings: 0,
          },
          { merge: true }
        );
        setIsFollowing(true);
      } else if (isFollowing) {
        // Unfollow
        await updateDoc(chefRef, {
          followers: arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
      } else {
        // Follow
        await updateDoc(chefRef, {
          followers: arrayUnion(currentUser.uid),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading chef profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chef) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>Chef profile not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="medium"
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === userId;
  const followerCount = chef.followers?.length || 0;
  const avgRating = chef.averageRating || 0;

  return (
    <AppLayout
      scrollable={false}
      header={
        <AppHeader
          title="Chef Profile"
          showBack={true}
          onBackPress={() => router.back()}
        />
      }
    >
      {/* Chef Title Card */}
      <Card variant="flat" padding={20} style={styles.titleCard}>
        <Text style={styles.chefTitle}>
          {chef.displayName || "Anonymous Chef"}
        </Text>
        {chef.cuisine && (
          <Text style={styles.cuisineBadge}>{chef.cuisine}</Text>
        )}
      </Card>

      {/* Chef Profile Card */}
      <Card variant="flat" padding={20} style={styles.profileCard}>
        <View style={styles.profileContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {chef.profilePicture ? (
              <Image
                source={{ uri: chef.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(chef.displayName || "Chef")[0]}
                </Text>
              </View>
            )}
          </View>

          {/* Personal Info Grid */}
          <View style={styles.infoGrid}>
            {chef.age && (
              <View style={styles.infoChip}>
                <Ionicons name="calendar-outline" size={14} color="#A12D2A" />
                <Text style={styles.infoText}>Age: {chef.age}</Text>
              </View>
            )}
            {chef.sex && (
              <View style={styles.infoChip}>
                <Ionicons name="people-outline" size={14} color="#A12D2A" />
                <Text style={styles.infoText}>{chef.sex}</Text>
              </View>
            )}
            {chef.birthday && (
              <View style={styles.infoChip}>
                <Ionicons name="gift-outline" size={14} color="#A12D2A" />
                <Text style={styles.infoText}>
                  🎂 {formatBirthday(chef.birthday)}
                </Text>
              </View>
            )}
          </View>

          {/* Bio Section */}
          {chef.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bio}>{chef.bio}</Text>
            </View>
          )}

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color="#A12D2A" />
              <Text style={styles.statText}>{recipes.length}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#A12D2A" />
              <Text style={styles.statText}>{followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color="#A12D2A" />
              <Text style={styles.statText}>{chef.totalLikes || 0}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            {!isOwnProfile && (
              <Button
                title={isFollowing ? "Following" : "Follow Chef"}
                onPress={handleFollowToggle}
                variant={isFollowing ? "secondary" : "primary"}
                size="medium"
                iconName={isFollowing ? "checkmark" : "person-add-outline"}
                style={styles.followButton}
              />
            )}

            {isOwnProfile && (
              <Button
                title="Edit Profile"
                onPress={() => router.push("/profile")}
                variant="secondary"
                size="medium"
                iconName="pencil-outline"
                style={styles.editButton}
              />
            )}
          </View>
        </View>
      </Card>

      {/* Recipes Section */}
      <Card variant="flat" padding={20} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            👨‍🍳 {chef.displayName || "Chef"}'s Recipes
          </Text>
          <Text style={styles.recipeCount}>({recipes.length})</Text>
        </View>

        {recipesLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#A12D2A" />
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyContent}>
            <Ionicons name="document-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptyText}>
              This chef hasn't published any recipes yet.
            </Text>
          </View>
        ) : (
          <View style={styles.recipesList}>
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.recipeId}
                onPress={() => router.push(`/recipe-detail/${recipe.recipeId}`)}
              >
                <RecipeCard recipe={recipe} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E74C3C",
    marginTop: 12,
  },
  titleCard: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  chefTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 30,
  },
  cuisineBadge: {
    fontSize: 14,
    color: "#A12D2A",
    fontWeight: "600",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  profileCard: {
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  profileContent: {
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#E8E8E8",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  bioSection: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  actionSection: {
    marginTop: 8,
  },
  followButton: {
    width: "100%",
  },
  editButton: {
    width: "100%",
  },
  sectionCard: {
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  recipeCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  recipesList: {
    gap: 12,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
});
