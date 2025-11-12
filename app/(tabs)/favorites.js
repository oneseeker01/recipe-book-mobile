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

export default function FavoritesScreen() {
  const [viewMode, setViewMode] = useState("recipes"); // "recipes" or "chefs"
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [favoriteChefs, setFavoriteChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const currentUser = auth.currentUser;

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
        const recipes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  // Fetch favorite chefs
  useEffect(() => {
    if (!user) return;

    const fetchFavoriteChefs = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const followedChefIds = userDoc.data().following || [];

          if (followedChefIds.length > 0) {
            const chefsPromises = followedChefIds.map((chefId) =>
              getDoc(doc(db, "users", chefId))
            );
            const chefDocs = await Promise.all(chefsPromises);
            const chefs = chefDocs
              .filter((doc) => doc.exists())
              .map((doc) => ({
                userId: doc.id,
                ...doc.data(),
              }));
            setFavoriteChefs(chefs);
          }
        }
      } catch (error) {
        console.error("Error fetching favorite chefs:", error);
      }
    };

    fetchFavoriteChefs();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPromptContainer}>
          <Ionicons name="heart-dislike-outline" size={60} color="#CCC" />
          <Text style={styles.loginPromptText}>
            Please log in to view your favorite recipes
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
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
          ]}
          onPress={() => setViewMode("recipes")}
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
          onPress={() => setViewMode("chefs")}
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

      {/* Favorites List */}
      <FlatList
        data={viewMode === "recipes" ? favoriteRecipes : favoriteChefs}
        keyExtractor={(item) => item.id || item.userId}
        renderItem={({ item }) =>
          viewMode === "recipes" ? (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe-detail/${item.id}`)}
            />
          ) : (
            <ChefCard chef={item} />
          )
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>
              {viewMode === "recipes"
                ? "No favorite recipes yet"
                : "No favorite chefs yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {viewMode === "recipes"
                ? "Tap the heart icon on recipes to save them here"
                : "Follow chefs to see them here"}
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Ionicons name="compass-outline" size={18} color="#FFF" />
              <Text style={styles.exploreButtonText}>
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
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#A12D2A",
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
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: "#A12D2A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exploreButtonText: {
    color: "#FFF",
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
