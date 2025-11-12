import { Image, StyleSheet, Text, View } from "react-native";

/**
 * ChefAvatar component
 * Displays a circular avatar of a chef with their name
 * @param {Object} props
 * @param {string} props.name - Chef's display name
 * @param {string} props.photoURL - URL to chef's photo
 */
export default function ChefAvatar({ name, photoURL }) {
  // Generate initials from name if no photo is available
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const backgroundColor =
    photoURL === undefined
      ? "#" + Math.floor(Math.random() * 16777215).toString(16)
      : "#A12D2A";

  return (
    <View style={styles.container}>
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={styles.avatar} />
      ) : (
        <View
          style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor }]}
        >
          <Text style={styles.initials}>{initials}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {name || "Unknown"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 70,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#A12D2A",
    backgroundColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  name: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#1A1A1A",
  },
});
