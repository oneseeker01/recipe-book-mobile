import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * RecipeCard component for displaying recipe in a list
 * Shows recipe image, title, author, rating, and quick stats
 * @param {Object} recipe - Recipe data object
 * @param {function} onPress - Callback when card is tapped
 * @param {function} onLike - Callback for like/favorite button
 * @param {boolean} isLiked - Whether recipe is liked/favorited
 */
export default function RecipeCard({
  recipe,
  onPress,
  onLike,
  isLiked = false,
}) {
  const router = useRouter();

  if (!recipe) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) onLike(recipe.recipeId);
  };

  const handleCardPress = () => {
    if (onPress) {
      console.log("RecipeCard pressed for recipe:", recipe.title);
      onPress();
    } else {
      console.log(
        "RecipeCard pressed but no onPress handler for recipe:",
        recipe.title
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: recipe.image || "https://via.placeholder.com/300x200",
          }}
          style={styles.image}
        />

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Top Badges */}
        <View style={styles.topBadges}>
          {recipe.difficulty && (
            <View
              style={[
                styles.difficultyBadge,
                recipe.difficulty === "easy"
                  ? styles.easyBadge
                  : recipe.difficulty === "medium" ||
                    recipe.difficulty === "normal"
                  ? styles.mediumBadge
                  : recipe.difficulty === "hard"
                  ? styles.hardBadge
                  : styles.expertBadge,
              ]}
            >
              <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
            </View>
          )}

          {recipe.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
          )}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <Text style={styles.statText}>
                {recipe.prepTime || recipe.cookingTime || 0}m
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#FFF" />
              <Text style={styles.statText}>
                {recipe.servings || 1} serving
              </Text>
            </View>
            {recipe.cost && (
              <View style={styles.statItem}>
                <Ionicons name="pricetag-outline" size={14} color="#FFF" />
                <Text style={styles.statText}>₱{recipe.cost}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <Text style={styles.author}>👨‍🍳 {recipe.authorName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  topBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  easyBadge: { backgroundColor: "rgba(76, 175, 80, 0.9)" },
  mediumBadge: { backgroundColor: "rgba(255, 152, 0, 0.9)" },
  hardBadge: { backgroundColor: "rgba(244, 67, 54, 0.9)" },
  expertBadge: { backgroundColor: "rgba(156, 39, 176, 0.9)" },
  difficultyText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryText: {
    color: "#A12D2A",
    fontSize: 10,
    fontWeight: "600",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 22,
  },
  author: {
    fontSize: 14,
    color: "#A12D2A",
    fontWeight: "600",
  },
});
