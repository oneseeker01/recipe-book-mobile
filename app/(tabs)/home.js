import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import Card from "../../components/Card";
import ChefCard from "../../components/ChefCard";
import RecipeCard from "../../components/RecipeCard";
import { auth, db } from "../../firebaseConfig";

const RECIPE_CATEGORIES = [
  "All",
  "Chicken",
  "Pork",
  "Vegetables",
  "Seafood",
  "Beef",
  "Dessert",
  "Pasta",
  "Soup",
];
const CHEF_CUISINES = [
  "All",
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "French",
  "Indian",
  "Thai",
  "American",
  "Mediterranean",
  "British",
];

const RECIPE_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "A-Z", value: "alphabetical" },
  { label: "Z-A", value: "alphabeticalReverse" },
];

const CHEF_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "A-Z", value: "alphabetical" },
  { label: "Z-A", value: "alphabeticalReverse" },
];

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState("recipes"); // "recipes" or "chefs"
  const [recipes, setRecipes] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [favorites, setFavorites] = useState(new Set());
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const userDisplay = auth.currentUser?.displayName || "Chef";

  // Fetch admin-added recipes only (simplified to avoid composite indexes)
  useEffect(() => {
    if (viewMode !== "recipes") return;

    const recipesRef = collection(db, "recipes");

    const setUpRecipeQuery = (queryRef) => {
      setLoading(true);
      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot) => {
          const allRecipes = snapshot.docs.map((doc) => ({
            recipeId: doc.id,
            ...doc.data(),
            // Add cuisine information from recipe data or author data
            cuisine: doc.data().cuisine || doc.data().authorCuisine,
          }));
          // Filter to only show admin-added recipes client-side
          const adminRecipes = allRecipes.filter(
            (recipe) => recipe.isAdminContent === true
          );
          setRecipes(adminRecipes);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching recipes: ", error);
          setLoading(false);
        }
      );
      return unsubscribe;
    };

    // Use simpler queries to avoid composite index requirements
    switch (sortBy) {
      case "alphabetical":
        const q3 = query(
          recipesRef,
          where("isPublished", "==", true),
          orderBy("title", "asc"),
          limit(100)
        );
        return setUpRecipeQuery(q3);
      case "alphabeticalReverse":
        const q4 = query(
          recipesRef,
          where("isPublished", "==", true),
          orderBy("title", "desc"),
          limit(100)
        );
        return setUpRecipeQuery(q4);
      default: // newest
        const q5 = query(
          recipesRef,
          where("isPublished", "==", true),
          orderBy("createdAt", "desc"),
          limit(100)
        );
        return setUpRecipeQuery(q5);
    }
  }, [sortBy, viewMode, isAdmin]);

  // Fetch admin-added chefs only (from chefs collection)
  useEffect(() => {
    if (viewMode !== "chefs") return;

    const fetchChefs = async () => {
      setLoading(true);
      try {
        const chefsRef = collection(db, "chefs");
        let q;

        // Use simpler queries and filter client-side
        switch (sortBy) {
          case "alphabetical":
            q = query(chefsRef, orderBy("name", "asc"), limit(100));
            break;
          case "alphabeticalReverse":
            q = query(chefsRef, orderBy("name", "desc"), limit(100));
            break;
          default: // newest
            q = query(chefsRef, orderBy("createdAt", "desc"), limit(100));
        }

        const snapshot = await getDocs(q);
        const allChefs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            userId: doc.id, // Map chefId to userId for ChefCard compatibility
            displayName: data.displayName || data.name,
            cuisine: data.cuisine || data.specialty, // Support both cuisine and specialty fields
            bio: data.bio,
            profilePicture: data.image,
            verified: data.verified,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Set defaults for missing fields
            followersCount: 0,
            totalRecipes: 0,
            totalLikes: 0,
            averageRating: 0,
          };
        });
        // Filter to only show admin-added chefs client-side (verified by admin)
        const adminChefs = allChefs.filter((chef) => chef.verified === true);

        // Fetch recipe counts for admin chefs
        const recipesRef = collection(db, "recipes");
        const recipesQuery = query(
          recipesRef,
          where("isPublished", "==", true),
          where("isAdminContent", "==", true)
        );
        const recipesSnapshot = await getDocs(recipesQuery);
        const recipeCountMap = {};

        recipesSnapshot.docs.forEach((doc) => {
          const recipeData = doc.data();
          const chefId = recipeData.chefId;
          if (chefId) {
            recipeCountMap[chefId] = (recipeCountMap[chefId] || 0) + 1;
          }
        });

        // Update chefs with actual recipe counts
        const chefsWithRecipeCounts = adminChefs.map((chef) => ({
          ...chef,
          totalRecipes: recipeCountMap[chef.userId] || 0,
        }));

        setChefs(chefsWithRecipeCounts);
      } catch (error) {
        console.error("Error fetching chefs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChefs();
  }, [sortBy, viewMode]);

  // Load current user flags (isAdmin)
  useEffect(() => {
    const loadUserFlags = async () => {
      const u = auth.currentUser;
      if (!u) return;
      try {
        const userDocRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch (err) {
        console.warn("Failed to load user flags:", err);
      }
    };

    loadUserFlags();
  }, []);

  // Fetch top-rated admin-added recipes with weekly cache (simplified to avoid composite indexes)
  useEffect(() => {
    // Check if we have cached top recipes and if the cache is still valid (less than 7 days old)
    const checkAndFetchTopRecipes = async () => {
      const cacheKey = "topRecipesCache";
      const timestampKey = "topRecipesCacheTimestamp";

      try {
        const lastCacheTime = await AsyncStorage.getItem(timestampKey);
        const now = Date.now();
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

        // If cache exists and is still valid, use cached data
        if (lastCacheTime && now - parseInt(lastCacheTime) < ONE_WEEK_MS) {
          try {
            const cachedRecipes = await AsyncStorage.getItem(cacheKey);
            if (cachedRecipes) {
              setTopRecipes(JSON.parse(cachedRecipes));
              return;
            }
          } catch (error) {
            console.warn("Error reading top recipes cache:", error);
          }
        }

        // Cache expired or doesn't exist, fetch fresh data - admin recipes only (simplified query)
        const recipesRef = collection(db, "recipes");
        const q = query(
          recipesRef,
          where("isPublished", "==", true),
          orderBy("ratings", "desc"),
          limit(20) // Increased limit to account for client-side filtering
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const allRecipes = snapshot.docs.map((doc) => ({
              recipeId: doc.id,
              ...doc.data(),
              // Add cuisine information from recipe data or author data
              cuisine: doc.data().cuisine || doc.data().authorCuisine,
            }));
            // Filter to only show admin-added recipes client-side
            const adminRecipes = allRecipes.filter(
              (recipe) => recipe.isAdminContent === true
            );
            // Take only top 8 admin recipes
            const topList = adminRecipes.slice(0, 8);
            setTopRecipes(topList);

            // Update cache with fresh data
            (async () => {
              try {
                await AsyncStorage.setItem(cacheKey, JSON.stringify(topList));
                await AsyncStorage.setItem(timestampKey, String(Date.now()));
              } catch (error) {
                console.warn("Error caching top recipes:", error);
              }
            })();
          },
          (error) => {
            console.error("Error fetching top recipes: ", error);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error in checkAndFetchTopRecipes:", error);
      }
    };

    checkAndFetchTopRecipes();
  }, []);

  // Filter recipes by search and category
  let filteredRecipes = recipes;
  let filteredChefs = chefs;

  if (viewMode === "recipes") {
    if (selectedCategory !== "All") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.category &&
          recipe.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description &&
            recipe.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting after filtering
    if (sortBy === "alphabetical") {
      filteredRecipes = [...filteredRecipes].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    } else if (sortBy === "alphabeticalReverse") {
      filteredRecipes = [...filteredRecipes].sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }
  } else {
    // Chefs view - add cuisine filtering
    if (selectedCuisine !== "All") {
      filteredChefs = filteredChefs.filter(
        (chef) =>
          chef.cuisine &&
          chef.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filteredChefs = filteredChefs.filter(
        (chef) =>
          (chef.displayName &&
            chef.displayName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (chef.bio &&
            chef.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting after filtering
    if (sortBy === "alphabetical") {
      filteredChefs = [...filteredChefs].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    } else if (sortBy === "alphabeticalReverse") {
      filteredChefs = [...filteredChefs].sort((a, b) =>
        b.displayName.localeCompare(a.displayName)
      );
    }
  }

  const handleRecipePress = (recipeId) => {
    console.log("handleRecipePress called with recipeId:", recipeId);
    const route = `/recipe-detail/${recipeId}`;
    console.log("Navigating to route:", route);
    try {
      router.push(route);
      console.log("Router.push executed successfully");
    } catch (error) {
      console.error("Router.push failed:", error);
    }
  };

  const handleToggleFavorite = (recipeId) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={true}
      hasHeader={true}
      header={<AppHeader title={"Recipe Book"} centered={true} />}
    >
      {/* Top Recipes Section */}
      {topRecipes.length > 0 && (
        <View style={styles.topSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>⭐ Top Recipes This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topRecipesScroll}
            contentContainerStyle={styles.topRecipesContent}
          >
            {topRecipes.slice(0, 5).map((recipe) => (
              <Card
                key={recipe.recipeId}
                variant="elevated"
                padding={0}
                style={styles.topRecipeCard}
              >
                <TouchableOpacity
                  onPress={() => handleRecipePress(recipe.recipeId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.topRecipeImage}>
                    <Ionicons name="image-outline" size={40} color="#DDD" />
                  </View>
                  <View style={styles.topRecipeContent}>
                    <Text style={styles.topRecipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingValue}>
                        {(recipe.ratings || 0).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {/* View Mode Toggle */}
      <Card variant="flat" padding={4} style={styles.toggleCard}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "recipes" && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setViewMode("recipes");
              setSelectedCategory("All");
            }}
          >
            <Ionicons
              name="restaurant"
              size={18}
              color={viewMode === "recipes" ? "#FFF" : "#A12D2A"}
            />
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === "recipes" && styles.toggleButtonTextActive,
              ]}
            >
              Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "chefs" && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setViewMode("chefs");
              setSelectedCuisine("All");
            }}
          >
            <Ionicons
              name="people"
              size={18}
              color={viewMode === "chefs" ? "#FFF" : "#A12D2A"}
            />
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === "chefs" && styles.toggleButtonTextActive,
              ]}
            >
              Chefs
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Search Bar */}
      <Card variant="outlined" padding={8} style={styles.searchCard}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#A12D2A" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              viewMode === "recipes" ? "Search recipes..." : "Search chefs..."
            }
            placeholderTextColor="#BBB"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#A12D2A" />
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Sort & Filter Controls */}
      <View style={styles.controlsSection}>
        <Text style={styles.controlsLabel}>Sort By:</Text>
        <Card
          variant="flat"
          padding={10}
          style={[styles.sortControl, styles.sortControlNoBg]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortOptions}
          >
            {(viewMode === "recipes"
              ? RECIPE_SORT_OPTIONS
              : CHEF_SORT_OPTIONS
            ).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortButton,
                  sortBy === option.value && styles.sortButtonActive,
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === option.value && styles.sortButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>
      </View>

      {/* Category Filter - only show for recipes */}
      {viewMode === "recipes" && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Categories:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {RECIPE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTag,
                  selectedCategory === category && styles.categoryTagActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    selectedCategory === category &&
                      styles.categoryTagTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Cuisine Filter - only show for chefs */}
      {viewMode === "chefs" && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Cuisines:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CHEF_CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.categoryTag,
                  selectedCuisine === cuisine && styles.categoryTagActive,
                ]}
                onPress={() => setSelectedCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    selectedCuisine === cuisine && styles.categoryTagTextActive,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recipe/Chef List */}
      {viewMode === "recipes" ? (
        filteredRecipes.length > 0 ? (
          <View style={styles.recipeList}>
            {filteredRecipes.map((recipe) => {
              console.log(
                "Rendering RecipeCard for:",
                recipe.title,
                "with recipeId:",
                recipe.recipeId
              );
              return (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe.recipeId)}
                  onLike={handleToggleFavorite}
                  isLiked={favorites.has(recipe.recipeId)}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "Try a different search" : "Check back later!"}
            </Text>
            <Text style={styles.debugText}>
              Debug: Total recipes: {recipes.length}, Filtered:{" "}
              {filteredRecipes.length}
            </Text>
          </View>
        )
      ) : filteredChefs.length > 0 ? (
        <View style={styles.recipeList}>
          {filteredChefs.map((chef) => (
            <ChefCard key={chef.userId} chef={chef} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#DDD" />
          <Text style={styles.emptyText}>No chefs found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? "Try a different search" : "Check back later!"}
          </Text>
        </View>
      )}
    </AppLayout>
  );
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
  topSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 12,
    color: "#A12D2A",
    fontWeight: "600",
  },
  topRecipesScroll: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  topRecipesContent: {
    gap: 8,
  },
  topRecipeCard: {
    width: 140,
  },
  topRecipeImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  topRecipeContent: {
    padding: 8,
  },
  topRecipeTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  searchCard: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    paddingVertical: 4,
  },
  controlsRow: {
    marginBottom: 12,
  },
  sortControl: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  sortOptions: {
    gap: 8,
  },
  sortControlNoBg: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "transparent",
  },
  sortButtonActive: {
    backgroundColor: "#A12D2A",
    borderColor: "#A12D2A",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  controlsSection: {
    marginBottom: 16,
  },
  controlsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    marginHorizontal: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    marginHorizontal: 16,
  },
  categoriesContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  categoryTagActive: {
    backgroundColor: "#A12D2A",
    borderColor: "#A12D2A",
  },
  categoryTagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  categoryTagTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  recipeList: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#BBB",
    marginTop: 4,
  },
  debugText: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  toggleCard: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
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
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toggleButtonActive: {
    backgroundColor: "#A12D2A",
    borderColor: "#A12D2A",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#A12D2A",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#FFF",
  },
});
