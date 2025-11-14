import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "../hooks/useTheme";

/**
 * ChefCard component for displaying chef profile in a list
 * Shows chef avatar, name, bio, cuisine, and stats
 * @param {Object} chef - Chef data object
 * @param {function} onPress - Callback when card is tapped
 */
export default function ChefCard({ chef, onPress, showGender = true }) {
  const router = useRouter();
  const colors = useColors();

  if (!chef) return null;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (chef.userId || chef.uid) {
      router.push(`/chef-detail/${chef.userId || chef.uid}`);
    }
  };

  const followerCount = chef.followers?.length || chef.followersCount || 0;
  const recipeCount = chef.myRecipes?.length || chef.totalRecipes || 0;
  const avatarUri = chef.profilePicture || chef.photoURL || chef.image;
  const cuisineLabel = typeof chef.cuisine === "string"
    ? chef.cuisine
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
        .join(" ")
    : chef.cuisine;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundCard,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { borderColor: colors.borderSecondary },
              ]}
            >
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Chef Info */}
        <View style={styles.chefInfo}>
          <Text
            style={[styles.name, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {chef.displayName || chef.name || "Anonymous Chef"}
          </Text>

          {chef.cuisine && (
            <View
              style={[
                styles.cuisineBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="restaurant-outline" size={12} color="#FFFFFF" />
              <Text style={[styles.cuisineText, { color: "#FFFFFF" }]}>
                {cuisineLabel}
              </Text>
            </View>
          )}

          {/* Personal Info */}
          <View style={styles.personalInfo}>
            {chef.age && (
              <Text
                style={[
                  styles.personalText,
                  {
                    color: colors.textSecondary,
                    backgroundColor: colors.backgroundInput,
                  },
                ]}
              >
                Age: {chef.age}
              </Text>
            )}
            {showGender && chef.sex && (
              <Text
                style={[
                  styles.personalText,
                  {
                    color: colors.textSecondary,
                    backgroundColor: colors.backgroundInput,
                  },
                ]}
              >
                {chef.sex}
              </Text>
            )}
            {chef.birthday && (
              <Text
                style={[
                  styles.personalText,
                  {
                    color: colors.textSecondary,
                    backgroundColor: colors.backgroundInput,
                  },
                ]}
              >
                🎂 {chef.birthday}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Bio Section */}
      {chef.bio && (
        <View
          style={[
            styles.bioContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Text
            style={[styles.bio, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {chef.bio}
          </Text>
        </View>
      )}

      {/* Stats Section */}
      <View
        style={[
          styles.statsContainer,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.textPrimary }]}>
            {recipeCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Recipes
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  chefInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  cuisineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  cuisineText: {
    fontSize: 12,
    fontWeight: "600",
  },
  personalInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  personalText: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bioContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});
