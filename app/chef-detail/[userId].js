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
import ChefAvatar from "../../components/ChefAvatar";
import RecipeCard from "../../components/RecipeCard";
import { auth, db } from "../../firebaseConfig";
import useChefFavorites from "../../hooks/useChefFavorites";

export default function ChefProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = auth.currentUser;
  const { favoriteChefIds } = useChefFavorites();

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

  // Helper function to convert string to title case
  const toTitleCase = (str) => {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch chef profile data
  useEffect(() => {
    if (!userId) return;

    const fetchChefData = async () => {
      try {
        setLoading(true);

        // First try to fetch from users collection (for user profiles)
        let chefDoc = await getDoc(doc(db, "users", userId));

        if (!chefDoc.exists()) {
          // If not found in users, try chefs collection (for admin-created chefs)
          chefDoc = await getDoc(doc(db, "chefs", userId));
        }

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
        // Query recipes by chefId for chef profiles
        const q = query(
          collection(db, "recipes"),
          where("chefId", "==", userId),
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
  const isFavorited = favoriteChefIds.includes(userId);

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      Alert.alert("Sign in required", "Please sign in to favorite chefs");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          favoriteChefs: [userId],
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
        });
      } else {
        const currentFavorites = userDoc.data().favoriteChefs || [];
        const newFavorites = isFavorited
          ? currentFavorites.filter((id) => id !== userId)
          : [...currentFavorites, userId];

        await updateDoc(userRef, {
          favoriteChefs: newFavorites,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  return (
    <AppLayout
      scrollable={true}
      hasHeader={true}
      header={<AppHeader title="Chef Profile" showBack={true} />}
    >
      {/* Simplified Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <ChefAvatar
            name={chef.displayName || chef.name || "Anonymous Chef"}
            photoURL={chef.image || chef.profilePicture}
            showName={false}
          />
        </View>

        {/* Favorite Button - Repositioned below avatar */}
        {!isOwnProfile && (
          <TouchableOpacity
            style={styles.favoriteButtonBelow}
            onPress={handleFavoriteToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={20}
              color={isFavorited ? "#E74C3C" : "#666"}
            />
            <Text
              style={[
                styles.favoriteButtonText,
                { color: isFavorited ? "#E74C3C" : "#666" },
              ]}
            >
              {isFavorited ? "Favorited" : "Add to Favorites"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Chef Info */}
        <Text style={styles.displayName}>
          {chef.displayName || chef.name || "Anonymous Chef"}
        </Text>
        {chef.email && <Text style={styles.email}>{chef.email}</Text>}

        {/* Additional Chef Details */}
        <View style={styles.detailsContainer}>
          {chef.cuisine && (
            <View style={[styles.detailBadge, styles.cuisineBadge]}>
              <Ionicons
                name="restaurant-outline"
                size={14}
                color="#FFF"
                style={styles.badgeIcon}
              />
              <Text style={styles.detailBadgeText}>
                {toTitleCase(chef.cuisine)}
              </Text>
            </View>
          )}

          {chef.sex && (
            <View style={[styles.detailBadge, styles.genderBadge]}>
              <Ionicons
                name="male-female-outline"
                size={14}
                color="#FFF"
                style={styles.badgeIcon}
              />
              <Text style={styles.detailBadgeText}>
                {toTitleCase(chef.sex)}
              </Text>
            </View>
          )}
          {formatBirthday(chef.birthdate) && (
            <View style={[styles.detailBadge, styles.birthdayBadge]}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#FFF"
                style={styles.badgeIcon}
              />
              <Text style={styles.detailBadgeText}>
                {formatBirthday(chef.birthdate)}
              </Text>
            </View>
          )}
        </View>

        {chef.bio && <Text style={styles.bio}>{chef.bio}</Text>}
      </View>

      {/* Recipes Section */}
      <Card variant="flat" padding={20} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            👨‍🍳 {chef.displayName || chef.name || "Chef"}&#39;s Recipes
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
              This chef hasn&#39;t published any recipes yet.
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
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
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
  detailsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  badgeIcon: {
    marginRight: 4,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  cuisineBadge: {
    backgroundColor: "#3498DB",
  },
  ageBadge: {
    backgroundColor: "#E74C3C",
  },
  genderBadge: {
    backgroundColor: "#9B59B6",
  },
  birthdayBadge: {
    backgroundColor: "#F39C12",
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
  favoriteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonBelow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
