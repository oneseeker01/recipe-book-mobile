import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
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
import DynamicArray from "../../components/DynamicArray";
import ImagePicker from "../../components/ImagePicker";
import RecipeCard from "../../components/RecipeCard";
import Select from "../../components/Select";
import TextInput from "../../components/TextInput";
import { auth, db, storage } from "../../firebaseConfig";
import { isAdmin, isChef } from "../../lib/auth-helpers";

const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" },
  { label: "Normal", value: "normal" },
  { label: "Hard", value: "hard" },
  { label: "Expert", value: "expert" },
];

const CATEGORY_OPTIONS = [
  { label: "Chicken", value: "chicken" },
  { label: "Pork", value: "pork" },
  { label: "Beef", value: "beef" },
  { label: "Seafood", value: "seafood" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Pasta", value: "pasta" },
  { label: "Dessert", value: "dessert" },
  { label: "Soup", value: "soup" },
  { label: "Other", value: "other" },
];

export default function MyRecipesScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  // Lists & States
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    category: "",
    prepTime: "",
    servings: "",
    ingredients: [],
    instructions: [],
    image: null,
  });

  // Calculate total cost dynamically
  const totalCost = formData.ingredients.reduce((sum, ing) => {
    const price = parseFloat(ing.price) || 0;
    return sum + price;
  }, 0);

  const [formErrors, setFormErrors] = useState({});

  // Fetch recipes on component mount
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserRecipes();
      }
    }, [user])
  );

  const fetchUserRecipes = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "recipes"),
        where("userId", "==", user.uid),
        where("isAdminContent", "==", false),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const recipeList = querySnapshot.docs.map((doc) => ({
        recipeId: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipeList);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert("Error", "Failed to load your recipes");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Recipe title is required";
    if (!formData.difficulty) errors.difficulty = "Difficulty is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.prepTime || isNaN(formData.prepTime))
      errors.prepTime = "Valid prep time required";
    if (!formData.servings || isNaN(formData.servings))
      errors.servings = "Valid servings required";
    if (formData.ingredients.length === 0)
      errors.ingredients = "At least one ingredient required";
    if (formData.instructions.length === 0)
      errors.instructions = "At least one instruction required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;

    try {
      console.log("Starting image upload for URI:", imageUri);

      // Convert file URI to blob
      let blob;

      if (imageUri.startsWith("file://")) {
        // Mobile file path - use React Native's built-in FormData
        blob = {
          uri: imageUri,
          type: "image/jpeg",
          name: `recipe-${Date.now()}.jpg`,
        };
      } else if (
        imageUri.startsWith("http://") ||
        imageUri.startsWith("https://")
      ) {
        // Already a URL (from previous upload or web)
        return imageUri;
      } else {
        // Fallback: try to fetch as blob
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        blob = await response.blob();
      }

      // Create FormData for Cloudinary upload
      const formData = new FormData();

      // For mobile: pass the blob-like object directly
      // For web: pass the actual Blob
      formData.append("file", blob);
      formData.append("upload_preset", "recipe_book_mobile");
      formData.append("folder", `recipes/${user.uid}`);

      console.log("Uploading to Cloudinary...");

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dubvssmrp/image/upload",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.text();
        throw new Error(
          `Cloudinary upload failed: ${cloudinaryResponse.status} - ${errorData}`
        );
      }

      const cloudinaryData = await cloudinaryResponse.json();

      if (cloudinaryData.error) {
        throw new Error(`Cloudinary error: ${cloudinaryData.error.message}`);
      }

      console.log(
        "Image uploaded to Cloudinary successfully:",
        cloudinaryData.public_id
      );
      return cloudinaryData.secure_url; // Return the secure HTTPS URL
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      console.error("Error message:", error.message);

      // Return null to allow recipe creation without image
      // User can add image later or use placeholder
      Alert.alert(
        "Image Upload Failed",
        "Image couldn't be uploaded. Recipe will be saved without image.\n\nError: " +
          error.message +
          "\n\nYou can add the image later.",
        [{ text: "OK" }]
      );
      return null;
    }
  };

  const handleSaveRecipe = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors above");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = formData.image;

      // Upload new image if selected
      if (formData.image && formData.image.startsWith("file://")) {
        imageUrl = await uploadImage(formData.image);
      }

      // Compute estimated cost from ingredients if provided
      const estimatedCost = (formData.ingredients || []).reduce((sum, ing) => {
        const p = parseFloat(ing.price);
        return sum + (isNaN(p) ? 0 : p);
      }, 0);

      // Check if current user is admin or chef
      const userIsAdmin = await isAdmin(user);
      const userIsChef = await isChef(user);

      // Get author name based on user type
      let authorName = user.displayName || "Anonymous";
      if (userIsChef) {
        try {
          const chefQuery = query(
            collection(db, "chefs"),
            where("userId", "==", user.uid)
          );
          const chefSnapshot = await getDocs(chefQuery);
          if (!chefSnapshot.empty) {
            const chefData = chefSnapshot.docs[0].data();
            authorName = chefData.name || chefData.displayName || "Chef";
          }
        } catch (error) {
          console.warn("Error fetching chef name:", error);
        }
      } else if (userIsAdmin) {
        authorName = "Administrator";
      }

      const recipeData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        category: formData.category,
        prepTime: parseInt(formData.prepTime),
        servings: parseInt(formData.servings),
        // Use sum of ingredient prices for cost
        cost: estimatedCost || 0,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        image: imageUrl,
        userId: user.uid, // Always use current user's ID
        authorName: authorName,
        ratings: 0,
        totalRatings: 0,
        // Regular user recipes are not published to Home by default
        isPublished: userIsAdmin || userIsChef,
        // Only admin/chef-created recipes are marked as admin content
        isAdminContent: userIsAdmin || userIsChef,
      };

      if (editingId) {
        // Update existing recipe
        await updateDoc(doc(db, "recipes", editingId), {
          ...recipeData,
          updatedAt: new Date(),
        });
        Alert.alert("Success", "Recipe updated successfully!");
      } else {
        // Add new recipe
        const docRef = await addDoc(collection(db, "recipes"), {
          ...recipeData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Add to user's myRecipes array
        try {
          await updateDoc(doc(db, "users", user.uid), {
            myRecipes: arrayUnion(docRef.id),
          });
        } catch (err) {
          console.warn("Failed to update user's myRecipes array:", err);
        }
        Alert.alert("Success", "Recipe created successfully!");
      }

      resetForm();
      await fetchUserRecipes();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Delete image from storage (skip for Cloudinary URLs)
              const recipe = recipes.find((r) => r.recipeId === recipeId);
              if (
                recipe?.image &&
                !recipe.image.startsWith("https://res.cloudinary.com")
              ) {
                try {
                  const imageRef = ref(storage, recipe.image);
                  await deleteObject(imageRef);
                } catch (err) {
                  console.error("Error deleting image:", err);
                }
              }

              // Delete recipe document
              await deleteDoc(doc(db, "recipes", recipeId));
              // Remove from user's myRecipes array
              try {
                await updateDoc(doc(db, "users", user.uid), {
                  myRecipes: arrayRemove(recipeId),
                });
              } catch (err) {
                console.warn(
                  "Failed to remove recipe from user document:",
                  err
                );
              }
              await fetchUserRecipes();
              Alert.alert("Success", "Recipe deleted successfully!");
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Error", "Failed to delete recipe");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEditRecipe = (recipe) => {
    setEditingId(recipe.recipeId);
    setFormData({
      title: recipe.title,
      description: recipe.description || "",
      difficulty: recipe.difficulty,
      category: recipe.category,
      prepTime: recipe.prepTime.toString(),
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      image: recipe.image,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      difficulty: "",
      category: "",
      prepTime: "",
      servings: "",
      ingredients: [],
      instructions: [],
      image: null,
    });
    setFormErrors({});
  };

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { quantity: "", unit: "", name: "", price: "" },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateIngredient = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const handleAddInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, { instruction: "" }],
    }));
  };

  const handleRemoveInstruction = (index) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateInstruction = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      ),
    }));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#A12D2A" />
          <Text style={styles.centeredText}>
            Please sign in to manage recipes
          </Text>
          <Button
            title="Go to Login"
            onPress={() => router.push("/login")}
            variant="primary"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading your recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppLayout
      scrollable={true}
      hasHeader={true}
      header={<AppHeader title="My Recipes" showBack={false} />}
    >
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Create Recipe"
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          variant="primary"
          size="medium"
          iconName="add-outline"
          style={{ flex: 1 }}
        />
      </View>

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <Card variant="flat" padding={24} style={styles.emptyState}>
          <View style={styles.emptyContent}>
            <Ionicons name="document-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptyText}>
              Create your first recipe to share with the community!
            </Text>
          </View>
        </Card>
      ) : (
        <View style={styles.recipesList}>
          {recipes.map((recipe) => (
            <View key={recipe.recipeId} style={styles.recipeItemWrapper}>
              <RecipeCard
                recipe={recipe}
                onPress={() => router.push(`/recipe-detail/${recipe.recipeId}`)}
              />
              <View style={styles.recipeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditRecipe(recipe)}
                >
                  <Ionicons name="pencil-outline" size={18} color="#A12D2A" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={() => handleDeleteRecipe(recipe.recipeId)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                  <Text style={styles.dangerButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recipe Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingId ? "Edit Recipe" : "Create New Recipe"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Image Picker */}
            <View style={styles.formContent}>
              <ImagePicker
                label="Recipe Image"
                value={formData.image}
                onChange={(uri) =>
                  setFormData((prev) => ({ ...prev, image: uri }))
                }
                error={formErrors.image}
              />

              {/* Basic Info */}
              <TextInput
                label="Recipe Title"
                placeholder="e.g., Classic Spaghetti Carbonara"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                maxLength={100}
                error={formErrors.title}
              />

              <TextInput
                label="Description"
                placeholder="Describe your recipe..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                maxLength={500}
              />

              {/* Selects */}
              <View style={styles.row}>
                <Select
                  label="Difficulty"
                  options={DIFFICULTY_OPTIONS}
                  value={formData.difficulty}
                  onSelect={(value) =>
                    setFormData((prev) => ({ ...prev, difficulty: value }))
                  }
                  placeholder="Select difficulty"
                  error={formErrors.difficulty}
                  containerStyle={{ flex: 1 }}
                />
                <Select
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  value={formData.category}
                  onSelect={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  placeholder="Select category"
                  error={formErrors.category}
                  containerStyle={{ flex: 1, marginLeft: 12 }}
                />
              </View>

              {/* Numeric Inputs */}
              <View style={styles.row}>
                <TextInput
                  label="Prep Time (min)"
                  placeholder="30"
                  value={formData.prepTime}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, prepTime: text }))
                  }
                  keyboardType="number-pad"
                  error={formErrors.prepTime}
                  containerStyle={{ flex: 1 }}
                />
                <TextInput
                  label="Servings"
                  placeholder="4"
                  value={formData.servings}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, servings: text }))
                  }
                  keyboardType="number-pad"
                  error={formErrors.servings}
                  containerStyle={{ flex: 1, marginLeft: 12 }}
                />
              </View>

              {/* Ingredients */}
              <DynamicArray
                label="Ingredients"
                items={formData.ingredients}
                onAddItem={handleAddIngredient}
                onRemoveItem={handleRemoveIngredient}
                onUpdateItem={handleUpdateIngredient}
                fieldLabels={["quantity", "unit", "name"]}
                placeholders={["Qty", "Unit", "Ingredient name"]}
                error={formErrors.ingredients}
                showPrice={true}
              />

              {/* Total Cost Display */}
              {formData.ingredients.length > 0 && (
                <View style={styles.totalCostContainer}>
                  <Text style={styles.totalCostLabel}>Total Cost:</Text>
                  <Text style={styles.totalCostValue}>
                    ₱{totalCost.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Instructions */}
              <DynamicArray
                label="Instructions"
                items={formData.instructions}
                onAddItem={handleAddInstruction}
                onRemoveItem={handleRemoveInstruction}
                onUpdateItem={handleUpdateInstruction}
                fieldLabels={["instruction"]}
                placeholders={["Step description"]}
                error={formErrors.instructions}
              />

              {/* Form Actions */}
              <View style={styles.formActions}>
                <Button
                  title="Save Recipe"
                  onPress={handleSaveRecipe}
                  variant="primary"
                  size="medium"
                  loading={loading}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  variant="secondary"
                  size="medium"
                  style={{ flex: 1, marginLeft: 12 }}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centeredText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  actionButtons: {
    marginBottom: 16,
  },
  emptyState: {
    marginBottom: 20,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  recipesList: {
    gap: 12,
    marginBottom: 20,
  },
  recipeItemWrapper: {
    marginBottom: 0,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#A12D2A",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A12D2A",
  },
  dangerButton: {
    borderColor: "#E74C3C",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E74C3C",
  },
  formScroll: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  formContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  totalCostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 16,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A12D2A",
  },
});
