import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * ChefCard component for displaying chef profile in a list
 * Shows chef avatar, name, bio, cuisine, and stats
 * @param {Object} chef - Chef data object
 * @param {function} onPress - Callback when card is tapped
 */
export default function ChefCard({ chef, onPress }) {
  const router = useRouter();

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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {chef.profilePicture || chef.photoURL ? (
            <Image
              source={{ uri: chef.profilePicture || chef.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={36} color="#A12D2A" />
            </View>
          )}
        </View>

        {/* Chef Info */}
        <View style={styles.chefInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {chef.displayName || chef.name || "Anonymous Chef"}
          </Text>

          {chef.cuisine && (
            <View style={styles.cuisineBadge}>
              <Ionicons name="restaurant-outline" size={12} color="#A12D2A" />
              <Text style={styles.cuisineText}>{chef.cuisine}</Text>
            </View>
          )}

          {/* Personal Info */}
          <View style={styles.personalInfo}>
            {chef.age && (
              <Text style={styles.personalText}>Age: {chef.age}</Text>
            )}
            {chef.sex && <Text style={styles.personalText}>{chef.sex}</Text>}
            {chef.birthday && (
              <Text style={styles.personalText}>🎂 {chef.birthday}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Bio Section */}
      {chef.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bio} numberOfLines={2}>
            {chef.bio}
          </Text>
        </View>
      )}

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={16} color="#A12D2A" />
          <Text style={styles.statText}>{recipeCount}</Text>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#A12D2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E8E8E8",
  },
  chefInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 24,
  },
  cuisineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFE0D0",
  },
  cuisineText: {
    fontSize: 12,
    color: "#A12D2A",
    fontWeight: "600",
  },
  personalInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  personalText: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bioContainer: {
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bio: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
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
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
});
