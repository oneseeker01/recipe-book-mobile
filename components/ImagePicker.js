import { Ionicons } from "@expo/vector-icons";
import * as ImagePickerLib from "expo-image-picker";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ImagePicker({
  label,
  imageUri,
  onImageSelected,
  error,
  containerStyle,
}) {
  const handlePickImage = async () => {
    try {
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleRemoveImage = () => {
    onImageSelected(null);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveImage}
          >
            <Ionicons name="close-circle" size={32} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadBox, error && styles.errorBorder]}
          onPress={handlePickImage}
        >
          <Ionicons name="image-outline" size={48} color="#A12D2A" />
          <Text style={styles.uploadText}>Tap to select recipe image</Text>
          <Text style={styles.uploadSubtext}>JPG, PNG or GIF • Max 5MB</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {imageUri && (
        <TouchableOpacity style={styles.changeButton} onPress={handlePickImage}>
          <Ionicons name="camera-outline" size={16} color="#A12D2A" />
          <Text style={styles.changeButtonText}>Change Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#A12D2A",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FFF9F9",
  },
  errorBorder: {
    borderColor: "#E74C3C",
    backgroundColor: "#FFF5F5",
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#F0F0F0",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 2,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#A12D2A",
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A12D2A",
  },
  errorText: {
    fontSize: 12,
    color: "#E74C3C",
    marginTop: 8,
  },
});
