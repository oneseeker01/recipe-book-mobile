import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import ChefCard from "../../components/ChefCard";
import RecipeCard from "../../components/RecipeCard";
import { auth, db } from "../../firebaseConfig";
import useChefFavorites from "../../hooks/useChefFavorites";
import { useColors } from "../../hooks/useTheme";

export default function FavoritesScreen() {
  const [viewMode, setViewMode] = useState("recipes"); // "recipes" or "chefs"
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [favoriteChefs, setFavoriteChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const currentUser = auth.currentUser;
  const colors = useColors();
  const { favoriteChefIds, loading: chefsLoading } = useChefFavorites();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch user's favorite recipes
    const recipesRef = collection(db, "recipes");
    const q = query(
      recipesRef,
      where("isFavoritedBy", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recipes = snapshot.docs.map((doc) => {
          const recipeData = doc.data();
          return {
            id: doc.id,
            ...recipeData,
            // Add chef cuisine to recipe for display
            cuisine: recipeData.authorCuisine || recipeData.cuisine,
          };
        });
        setFavoriteRecipes(recipes);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching favorite recipes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch favorite chefs using favoriteChefIds from hook
  useEffect(() => {
    if (!user || chefsLoading) return;

    console.log("favorites.js: favoriteChefIds:", favoriteChefIds);

    const fetchFavoriteChefs = async () => {
      try {
        if (favoriteChefIds.length > 0) {
          const fetchOne = async (chefId) => {
            const userDoc = await getDoc(doc(db, "users", chefId));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                id: chefId,
                userId: chefId,
                displayName: data.displayName || data.name,
                cuisine: data.cuisine || data.specialty,
                profilePicture: data.profilePicture || data.image || data.photoURL,
                ...data,
              };
            }
            const chefDoc = await getDoc(doc(db, "chefs", chefId));
            if (chefDoc.exists()) {
              const data = chefDoc.data();
              return {
                id: chefId,
                userId: chefId,
                displayName: data.displayName || data.name,
                cuisine: data.cuisine || data.specialty,
                profilePicture: data.profilePicture || data.image || data.photoURL,
                ...data,
              };
            }
            return null;
          };
          const fetched = await Promise.all(favoriteChefIds.map(fetchOne));
          const chefs = fetched.filter((c) => c);

          console.log(
            "favorites.js: fetched chefs:",
            chefs.map((c) => ({
              chefId: c.chefId,
              name: c.name,
              displayName: c.displayName,
            }))
          );

          setFavoriteRecipes((prevRecipes) =>
            prevRecipes.map((recipe) => {
              const chef = chefs.find((c) => c.userId === recipe.userId);
              return chef && chef.cuisine ? { ...recipe, cuisine: chef.cuisine } : recipe;
            })
          );

          console.log(
            "favorites.js: setting favoriteChefs:",
            chefs.map((c) => ({
              chefId: c.chefId,
              name: c.name,
              displayName: c.displayName,
            }))
          );
          setFavoriteChefs(chefs);
        } else {
          console.log("favorites.js: no favoriteChefIds, setting empty chefs");
          setFavoriteChefs([]);
        }
      } catch (error) {
        console.error("Error fetching favorite chefs:", error);
      }
    };

    fetchFavoriteChefs();
  }, [user, favoriteChefIds, chefsLoading]);

  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loginPromptContainer}>
          <Ionicons
            name="heart-dislike-outline"
            size={60}
            color={colors.iconMuted}
          />
          <Text
            style={[styles.loginPromptText, { color: colors.textSecondary }]}
          >
            Please log in to view your favorite recipes
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || chefsLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={false}
      isList={true}
      header={<AppHeader title="Favorites" centered={true} />}
    >
      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "recipes" && styles.toggleButtonActive,
            {
              backgroundColor:
                viewMode === "recipes" ? colors.primary : colors.backgroundCard,
              borderColor: colors.borderPrimary,
            },
          ]}
          onPress={() => setViewMode("recipes")}
        >
          <Ionicons
            name="restaurant"
            size={18}
            color={
              viewMode === "recipes" ? colors.iconInverse : colors.iconPrimary
            }
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === "recipes" && styles.toggleButtonTextActive,
              {
                color:
                  viewMode === "recipes"
                    ? colors.textInverse
                    : colors.textPrimary,
              },
            ]}
          >
            Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "chefs" && styles.toggleButtonActive,
            {
              backgroundColor:
                viewMode === "chefs" ? colors.primary : colors.backgroundCard,
              borderColor: colors.borderPrimary,
            },
          ]}
          onPress={() => setViewMode("chefs")}
        >
          <Ionicons
            name="people"
            size={18}
            color={
              viewMode === "chefs" ? colors.iconInverse : colors.iconPrimary
            }
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === "chefs" && styles.toggleButtonTextActive,
              {
                color:
                  viewMode === "chefs"
                    ? colors.textInverse
                    : colors.textPrimary,
              },
            ]}
          >
            Chefs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Favorites List */}
      {console.log(
        "favorites.js: rendering FlatList, viewMode:",
        viewMode,
        "data length:",
        (viewMode === "recipes" ? favoriteRecipes : favoriteChefs).length
      )}
      <FlatList
        data={viewMode === "recipes" ? favoriteRecipes : favoriteChefs}
        keyExtractor={(item) => item.id || item.chefId}
        renderItem={({ item }) =>
          viewMode === "recipes" ? (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe-detail/${item.id}`)}
            />
          ) : (
            <ChefCard chef={item} showGender={false} />
          )
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color={colors.iconMuted} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              {viewMode === "recipes"
                ? "No favorite recipes yet"
                : "No favorite chefs yet"}
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              {viewMode === "recipes"
                ? "Tap the heart icon on recipes to save them here"
                : "Follow chefs to see them here"}
            </Text>
            <TouchableOpacity
              style={[
                styles.exploreButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Ionicons
                name="compass-outline"
                size={18}
                color={colors.iconInverse}
              />
              <Text
                style={[
                  styles.exploreButtonText,
                  { color: colors.textInverse },
                ]}
              >
                Explore {viewMode === "recipes" ? "Recipes" : "Chefs"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loginPromptText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleButtonActive: {
    borderColor: "transparent",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#FFF",
  },
});
