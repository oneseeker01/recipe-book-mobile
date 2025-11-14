import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Rating } from "react-native-ratings";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import AppLayout from "../../components/AppLayout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Checkbox from "../../components/Checkbox";
import { auth, db } from "../../firebaseConfig";

export default function RecipeDetailScreen() {
  const { id: recipeId } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState(new Set());
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [allItemsComplete, setAllItemsComplete] = useState(false);

  const user = auth.currentUser;

  // Fetch recipe details
  useEffect(() => {
    if (!recipeId) {
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe({
            recipeId: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          Alert.alert("Error", "Recipe not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        Alert.alert("Error", "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // Fetch reviews in real-time
  useEffect(() => {
    if (!recipeId) return;

    const reviewsRef = collection(db, "recipes", recipeId, "reviews");
    const q = query(reviewsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewList = snapshot.docs.map((doc) => ({
        reviewId: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewList);
    });

    return () => unsubscribe();
  }, [recipeId]);

  // Check if recipe is in user's favorites
  useEffect(() => {
    if (!user) return;

    const checkFavorite = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const favorites = userDoc.data().favoriteRecipes || [];
          setIsFavorite(favorites.includes(recipeId));
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };

    checkFavorite();
  }, [user, recipeId]);

  // Check if all items are completed
  useEffect(() => {
    if (!recipe) return;

    const ingredientsCount = recipe.ingredients?.length || 0;
    const instructionsCount = recipe.instructions?.length || 0;
    const totalItems = ingredientsCount + instructionsCount;

    const completedItems = checkedIngredients.size + checkedInstructions.size;
    const isComplete = totalItems > 0 && completedItems === totalItems;

    setAllItemsComplete(isComplete);
  }, [checkedIngredients, checkedInstructions, recipe]);

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to save favorites");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      // First, check if the user document exists
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create the user document if it doesn't exist
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            favoriteRecipes: isFavorite ? [] : [recipeId],
            followers: [],
            followersCount: 0,
            totalRecipes: 0,
            totalLikes: 0,
            averageRating: 0,
            totalReceivedRatings: 0,
            isGuest: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );
        setIsFavorite(!isFavorite);
      } else {
        // Document exists, update it
        if (isFavorite) {
          await updateDoc(userRef, {
            favoriteRecipes: arrayRemove(recipeId),
          });
          setIsFavorite(false);
        } else {
          await updateDoc(userRef, {
            favoriteRecipes: arrayUnion(recipeId),
          });
          setIsFavorite(true);
        }
      }
      // Also update the recipe document to track who favorited it
      try {
        const recipeRef = doc(db, "recipes", recipeId);
        if (isFavorite) {
          await updateDoc(recipeRef, { isFavoritedBy: arrayRemove(user.uid) });
        } else {
          await updateDoc(recipeRef, { isFavoritedBy: arrayUnion(user.uid) });
        }
      } catch (err) {
        // Non-fatal: log and continue
        console.warn("Failed to update recipe favorite list:", err);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite");
    }
  };

  const handleToggleIngredient = (index) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleInstruction = (index) => {
    setCheckedInstructions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>Recipe not found</Text>
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

  return (
    <AppLayout
      scrollable={true}
      header={
        <AppHeader
          title="Recipe Detail"
          showBack={true}
          onBackPress={() => router.back()}
        />
      }
    >
      {/* Hero Image */}
      <View style={styles.heroSection}>
        {recipe.image ? (
          <Image
            source={{ uri: recipe.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="image-outline" size={60} color="#DDD" />
          </View>
        )}

        {/* Difficulty & Favorite Badge */}
        <View style={styles.badgeRow}>
          {recipe.difficulty && (
            <View
              style={[
                styles.difficultyBadge,
                styles[`difficulty_${recipe.difficulty?.toLowerCase()}`],
              ]}
            >
              <Text style={styles.badgeText}>
                {recipe.difficulty
                  ? recipe.difficulty.charAt(0).toUpperCase() +
                    recipe.difficulty.slice(1).toLowerCase()
                  : ""}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#E74C3C" : "#FFF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Title */}
      <Card variant="flat" padding={20} style={styles.titleCard}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
      </Card>

      {/* Recipe Header */}
      <Card variant="flat" padding={20} style={styles.headerCard}>
        {/* Description */}
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        {/* Chef Name */}
        {recipe.authorName && (
          <TouchableOpacity
            style={styles.chefContainer}
            onPress={() => {
              // For admin content, chefId refers to chefs collection
              // For user content, userId refers to users collection
              const chefId = recipe.isAdminContent
                ? recipe.chefId
                : recipe.userId;
              if (chefId) {
                router.push(`/chef-detail/${chefId}`);
              }
            }}
          >
            <Text style={styles.chefLabel}>Chef:</Text>
            <Text style={styles.chefName}>{recipe.authorName}</Text>
            <Ionicons name="chevron-forward" size={16} color="#A12D2A" />
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          {recipe.prepTime && (
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={18} color="#A12D2A" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Prep Time</Text>
                <Text style={styles.statValue}>{recipe.prepTime} minutes</Text>
              </View>
            </View>
          )}
          {recipe.servings && (
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={18} color="#A12D2A" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Serves</Text>
                <Text style={styles.statValue}>{recipe.servings} people</Text>
              </View>
            </View>
          )}
          {recipe.cost !== undefined && (
            <View style={styles.stat}>
              <Ionicons name="pricetag-outline" size={18} color="#A12D2A" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Est. Cost</Text>
                <Text style={styles.statValue}>
                  ₱{(parseFloat(recipe.cost) || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Ingredients Section */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Card variant="flat" padding={16} style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Ingredients</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <Checkbox
                key={index}
                checked={checkedIngredients.has(index)}
                onChange={() => handleToggleIngredient(index)}
                label={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
              />
            ))}
          </View>
        </Card>
      )}

      {/* Instructions Section */}
      {recipe.instructions && recipe.instructions.length > 0 && (
        <Card variant="flat" padding={16} style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <Checkbox
                key={index}
                checked={checkedInstructions.has(index)}
                onChange={() => handleToggleInstruction(index)}
                label={`Step ${index + 1}: ${instruction.instruction}`}
              />
            ))}
          </View>
        </Card>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <Card variant="flat" padding={16} style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Reviews ({reviews.length})</Text>
          <View style={styles.reviewsList}>
            {reviews.slice(0, 5).map((review) => (
              <Card
                key={review.reviewId}
                variant="outlined"
                padding={12}
                style={styles.reviewCard}
              >
                <View style={styles.reviewHeader}>
                  <Rating
                    type="star"
                    ratingCount={5}
                    imageSize={14}
                    readonly
                    startingValue={review.rating}
                  />
                  <Text style={styles.reviewRating}>{review.rating}.0</Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment} numberOfLines={3}>
                    {review.comment}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        </Card>
      )}

      {/* Completion Button */}
      {allItemsComplete ? (
        <Button
          title="Check Recipe Complete"
          onPress={() => setShowCongratsModal(true)}
          variant="primary"
          size="medium"
          iconName="checkmark-circle"
          style={styles.completionButton}
        />
      ) : null}

      {/* Congrats Modal */}
      <Modal
        visible={showCongratsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCongratsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Card variant="elevated" padding={24} style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={styles.modalTitle}>
                Congrats, you made it, chef!
              </Text>
              <Text style={styles.modalText}>
                You&#39;ve completed all the steps! Great job following the recipe.
              </Text>
              <Button
                title="Awesome!"
                onPress={() => setShowCongratsModal(false)}
                variant="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E74C3C",
    marginTop: 12,
  },
  heroSection: {
    position: "relative",
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 20,
  },
  heroImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#F0F0F0",
  },
  heroImagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  difficulty_easy: {
    backgroundColor: "rgba(76, 175, 80, 0.95)",
  },
  difficulty_normal: {
    backgroundColor: "rgba(255, 255, 0, 0.95)",
  },
  difficulty_medium: {
    backgroundColor: "rgba(255, 255, 0, 0.95)",
  },
  difficulty_hard: {
    backgroundColor: "rgba(244, 67, 54, 0.95)",
  },
  difficulty_expert: {
    backgroundColor: "rgba(156, 39, 176, 0.95)",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  titleCard: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 30,
  },
  headerCard: {
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  chefContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE0D0",
  },
  chefLabel: {
    fontSize: 14,
    color: "#A12D2A",
    fontWeight: "600",
    marginRight: 8,
  },
  chefName: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "bold",
    flex: 1,
  },
  quickStats: {
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#A12D2A",
  },
  statContent: {
    flex: 1,
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  ingredientsList: {
    gap: 4,
  },
  instructionsList: {
    gap: 4,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  reviewComment: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  completionButton: {
    marginBottom: 30,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    width: "100%",
    borderRadius: 20,
  },
  modalContent: {
    alignItems: "center",
  },
  modalEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    alignSelf: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
