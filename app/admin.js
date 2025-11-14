import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import Card from "../components/Card";
import DatePicker from "../components/DatePicker";

import DynamicArray from "../components/DynamicArray";
import ImagePicker from "../components/ImagePicker";
import Select from "../components/Select";
import TextInput from "../components/TextInput";
import { auth, db, storage } from "../firebaseConfig";
import { isAdmin } from "../lib/auth-helpers";

export default function AdminScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    activeUsers: 0,
    publishedRecipes: 0,
  });
  const [showChefForm, setShowChefForm] = useState(false);
  const [chefFormData, setChefFormData] = useState({
    name: "",
    bio: "",
    image: null,
    sex: "",
    cuisine: "",
  });
  const [chefFormErrors, setChefFormErrors] = useState({});
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeFormData, setRecipeFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    category: "",
    prepTime: "",
    servings: "",
    ingredients: [],
    instructions: [],
    image: null,
    chefId: "",
  });
  const [recipeFormErrors, setRecipeFormErrors] = useState({});
  const [editingChefId, setEditingChefId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);

    // Check admin privileges
    const checkAdminStatus = async () => {
      if (currentUser) {
        const adminStatus = await isAdmin(currentUser);
        setIsUserAdmin(adminStatus);
        if (adminStatus) {
          loadDashboardData();
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);

      // Load chefs
      const chefsSnapshot = await getDocs(collection(db, "chefs"));
      const chefsList = chefsSnapshot.docs.map((doc) => ({
        chefId: doc.id,
        ...doc.data(),
      }));
      setChefs(chefsList);

      // Load recipes
      const recipesSnapshot = await getDocs(collection(db, "recipes"));
      const recipesList = recipesSnapshot.docs.map((doc) => ({
        recipeId: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesList);

      // Calculate stats
      const totalUsers = usersList.length;
      const activeUsers = usersList.filter((u) => u.emailVerified).length;
      const totalRecipes = recipesList.length;
      const publishedRecipes = recipesList.filter((r) => r.isPublished).length;

      setStats({
        totalUsers,
        totalRecipes,
        activeUsers,
        publishedRecipes,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", userId));
              Alert.alert("Success", "User deleted successfully");
              loadDashboardData();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecipe = async (recipeId) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
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
              Alert.alert("Success", "Recipe deleted successfully");
              loadDashboardData();
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Error", "Failed to delete recipe");
            }
          },
        },
      ]
    );
  };

  const handleEditChef = (chefId) => {
    const chef = chefs.find((c) => c.chefId === chefId);
    if (chef) {
      setChefFormData({
        name: chef.name || "",
        bio: chef.bio || "",
        image: chef.image || null,
        birthdate: chef.birthdate || "",
        sex: chef.sex || "",
        cuisine: chef.cuisine || "",
      });
      setEditingChefId(chefId);
      setShowChefForm(true);
    }
  };

  const handleEditRecipe = (recipeId) => {
    const recipe = recipes.find((r) => r.recipeId === recipeId);
    if (recipe) {
      setRecipeFormData({
        title: recipe.title || "",
        description: recipe.description || "",
        difficulty: recipe.difficulty || "",
        category: recipe.category || "",
        prepTime: recipe.prepTime || "",
        servings: recipe.servings?.toString() || "",
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        image: recipe.image || null,
        chefId: recipe.chefId || "",
      });
      setEditingRecipeId(recipeId);
      setShowRecipeForm(true);
    }
  };

  const handleDeleteChef = async (chefId) => {
    Alert.alert(
      "Delete Chef",
      "Are you sure you want to delete this chef? All recipes by this chef will be attributed to 'Anonymous Chef'. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // First, update all recipes by this chef to be anonymous
              const recipesQuery = query(
                collection(db, "recipes"),
                where("chefId", "==", chefId)
              );
              const recipesSnapshot = await getDocs(recipesQuery);

              const updatePromises = recipesSnapshot.docs.map((recipeDoc) =>
                updateDoc(recipeDoc.ref, {
                  authorName: "Anonymous Chef",
                  chefId: null, // Remove chef reference
                  updatedAt: new Date(),
                })
              );

              // Wait for all recipe updates to complete
              if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
                console.log(
                  `Updated ${updatePromises.length} recipes to anonymous`
                );
              }

              // Then delete the chef
              await deleteDoc(doc(db, "chefs", chefId));
              Alert.alert(
                "Success",
                "Chef deleted successfully. Associated recipes have been updated to 'Anonymous Chef'."
              );
              loadDashboardData();
            } catch (error) {
              console.error("Error deleting chef:", error);
              Alert.alert("Error", "Failed to delete chef");
            }
          },
        },
      ]
    );
  };

  const validateChefForm = () => {
    const errors = {};

    if (!chefFormData.name.trim()) errors.name = "Chef name is required";
    if (!chefFormData.cuisine.trim())
      errors.cuisine = "Cuisine specialty is required";

    setChefFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sendNotificationToAllUsers = async (notificationData) => {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Send notification to each user
      const notificationPromises = users.map((user) =>
        addDoc(collection(db, "users", user.id, "notifications"), {
          ...notificationData,
          createdAt: new Date(),
          isRead: false,
        })
      );

      await Promise.all(notificationPromises);
      console.log(`Notification sent to ${users.length} users`);
    } catch (error) {
      console.error("Error sending notifications:", error);
      // Don't throw error to prevent blocking the main operation
    }
  };

  const handleSaveChef = async () => {
    if (!validateChefForm()) {
      Alert.alert("Validation Error", "Please fix the errors above");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = chefFormData.image;

      // Upload new image if selected
      if (chefFormData.image && chefFormData.image.startsWith("file://")) {
        // Reuse the uploadImage function from myrecipes.js logic
        const uploadImage = async (imageUri) => {
          if (!imageUri) return null;

          try {
            console.log("Starting image upload for URI:", imageUri);

            let blob;

            if (imageUri.startsWith("file://")) {
              blob = {
                uri: imageUri,
                type: "image/jpeg",
                name: `chef-${Date.now()}.jpg`,
              };
            } else if (
              imageUri.startsWith("http://") ||
              imageUri.startsWith("https://")
            ) {
              return imageUri;
            } else {
              const response = await fetch(imageUri);
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
              }
              blob = await response.blob();
            }

            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", "recipe_book_mobile");
            formData.append("folder", `chefs`);

            console.log("Uploading to Cloudinary...");

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
              throw new Error(
                `Cloudinary error: ${cloudinaryData.error.message}`
              );
            }

            console.log(
              "Image uploaded to Cloudinary successfully:",
              cloudinaryData.public_id
            );
            return cloudinaryData.secure_url;
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            Alert.alert(
              "Image Upload Failed",
              "Image couldn't be uploaded. Chef will be saved without image.\n\nError: " +
                error.message +
                "\n\nYou can add the image later.",
              [{ text: "OK" }]
            );
            return null;
          }
        };

        imageUrl = await uploadImage(chefFormData.image);
      }

      const chefData = {
        name: chefFormData.name,
        cuisine: chefFormData.cuisine,
        bio: chefFormData.bio,
        image: imageUrl,
        birthdate: chefFormData.birthdate || null,
        sex: chefFormData.sex || null,
        verified: true, // Admin-created chefs are verified
        updatedAt: new Date(),
      };

      let chefId;
      if (editingChefId) {
        // Update existing chef
        await updateDoc(doc(db, "chefs", editingChefId), chefData);
        chefId = editingChefId;
        Alert.alert("Success", "Chef updated successfully!");
      } else {
        // Create new chef
        chefData.createdAt = new Date();
        const docRef = await addDoc(collection(db, "chefs"), chefData);
        chefId = docRef.id;

        // Send notification to all users about new chef
        await sendNotificationToAllUsers({
          type: "new_chef",
          message: `New chef ${chefFormData.name} has joined! Check out their ${chefFormData.cuisine} specialties.`,
          chefId: chefId,
        });

        Alert.alert("Success", "Chef created successfully!");
      }

      resetChefForm();
      setEditingChefId(null);
      await loadDashboardData();
      setShowChefForm(false);
    } catch (error) {
      console.error("Error saving chef:", error);
      Alert.alert("Error", "Failed to save chef");
    } finally {
      setLoading(false);
    }
  };

  const resetChefForm = () => {
    setChefFormData({
      name: "",
      bio: "",
      image: null,
      birthdate: "",
      sex: "",
      cuisine: "",
    });
    setChefFormErrors({});
    setEditingChefId(null);
  };

  const validateRecipeForm = () => {
    const errors = {};

    if (!recipeFormData.title.trim()) errors.title = "Recipe title is required";
    if (!recipeFormData.difficulty)
      errors.difficulty = "Difficulty is required";
    if (!recipeFormData.category) errors.category = "Category is required";
    if (!recipeFormData.prepTime.trim())
      errors.prepTime = "Prep time is required";
    if (!recipeFormData.servings.trim())
      errors.servings = "Servings is required";
    if (!recipeFormData.ingredients.length)
      errors.ingredients = "At least one ingredient is required";
    if (!recipeFormData.instructions.length)
      errors.instructions = "At least one instruction is required";
    if (!recipeFormData.chefId) errors.chefId = "Chef selection is required";

    setRecipeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRecipe = async () => {
    if (!validateRecipeForm()) {
      Alert.alert("Validation Error", "Please fix the errors above");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = recipeFormData.image;

      // Upload new image if selected
      if (recipeFormData.image && recipeFormData.image.startsWith("file://")) {
        // Reuse the uploadImage function from myrecipes.js logic
        const uploadImage = async (imageUri) => {
          if (!imageUri) return null;

          try {
            console.log("Starting image upload for URI:", imageUri);

            let blob;

            if (imageUri.startsWith("file://")) {
              blob = {
                uri: imageUri,
                type: "image/jpeg",
                name: `recipe-${Date.now()}.jpg`,
              };
            } else if (
              imageUri.startsWith("http://") ||
              imageUri.startsWith("https://")
            ) {
              return imageUri;
            } else {
              const response = await fetch(imageUri);
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
              }
              blob = await response.blob();
            }

            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", "recipe_book_mobile");
            formData.append("folder", `recipes`);

            console.log("Uploading to Cloudinary...");

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
              throw new Error(
                `Cloudinary error: ${cloudinaryData.error.message}`
              );
            }

            console.log(
              "Image uploaded to Cloudinary successfully:",
              cloudinaryData.public_id
            );
            return cloudinaryData.secure_url;
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
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

        imageUrl = await uploadImage(recipeFormData.image);
      }

      // Compute estimated cost from ingredients if provided
      const estimatedCost = (recipeFormData.ingredients || []).reduce(
        (sum, ing) => {
          const p = parseFloat(ing.price);
          return sum + (isNaN(p) ? 0 : p);
        },
        0
      );

      // Find the selected chef to get their name
      const selectedChef = chefs.find(
        (chef) => chef.chefId === recipeFormData.chefId
      );

      const recipeData = {
        title: recipeFormData.title,
        description: recipeFormData.description,
        difficulty: recipeFormData.difficulty,
        category: recipeFormData.category,
        chefId: recipeFormData.chefId || null,
        prepTime: recipeFormData.prepTime,
        servings: parseInt(recipeFormData.servings),
        // Use sum of ingredient prices for cost
        cost: estimatedCost || 0,
        ingredients: recipeFormData.ingredients,
        instructions: recipeFormData.instructions,
        image: imageUrl,
        userId: user?.uid || "admin",
        authorName: selectedChef
          ? selectedChef.name
          : user?.displayName || "Admin",
        isPublished: true, // Admin-created recipes are published by default
        isAdminContent: true,
        updatedAt: new Date(),
      };

      let recipeId;
      if (editingRecipeId) {
        // Update existing recipe
        await updateDoc(doc(db, "recipes", editingRecipeId), recipeData);
        recipeId = editingRecipeId;
        Alert.alert("Success", "Recipe updated successfully!");
      } else {
        // Create new recipe
        recipeData.createdAt = new Date();
        const docRef = await addDoc(collection(db, "recipes"), recipeData);
        recipeId = docRef.id;

        // Send notification to all users about new recipe
        await sendNotificationToAllUsers({
          type: "new_recipe",
          message: `New recipe "${recipeFormData.title}" by ${
            selectedChef?.name || "Admin"
          } is now available!`,
          recipeId: recipeId,
        });

        Alert.alert("Success", "Recipe created successfully!");
      }

      // Clear editing state after successful save
      resetRecipeForm();
      setEditingRecipeId(null);
      await loadDashboardData();
      setShowRecipeForm(false);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setRecipeFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { quantity: "", unit: "", name: "", price: "" },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setRecipeFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateIngredient = (index, field, value) => {
    setRecipeFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const handleAddInstruction = () => {
    setRecipeFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, { instruction: "" }],
    }));
  };

  const handleRemoveInstruction = (index) => {
    setRecipeFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateInstruction = (index, field, value) => {
    setRecipeFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      ),
    }));
  };

  const resetRecipeForm = () => {
    setRecipeFormData({
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
    setRecipeFormErrors({});
  };

  // Access denied screen
  if (!loading && !isUserAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader
          title="Admin Access Denied"
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="shield-outline" size={64} color="#E74C3C" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            You need administrator privileges to access this section.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A12D2A" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDashboard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dashboard Overview</Text>

      {/* Current Admin Info */}
      <Card variant="flat" padding={16} style={styles.sectionCard}>
        <Text style={styles.cardTitle}>👤 Current Admin</Text>
        <Text style={styles.userName}>{user?.displayName || "Admin"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.userBadges}>
          <View style={[styles.badge, { backgroundColor: "#E74C3C" }]}>
            <Text style={styles.badgeText}>Administrator</Text>
          </View>
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={24} color="#A12D2A" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#27AE60"
            />
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={24} color="#3498DB" />
            <Text style={styles.statNumber}>{stats.totalRecipes}</Text>
            <Text style={styles.statLabel}>Total Recipes</Text>
          </View>
        </Card>

        <Card variant="flat" padding={16} style={styles.statCard}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={24} color="#F39C12" />
            <Text style={styles.statNumber}>{chefs.length}</Text>
            <Text style={styles.statLabel}>Chefs</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card variant="flat" padding={20} style={styles.sectionCard}>
        <Text style={styles.cardTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            title="Add Chef"
            onPress={() => {
              resetChefForm();
              setShowChefForm(true);
            }}
            variant="primary"
            iconName="person-add-outline"
            style={styles.quickActionButton}
          />
          <Button
            title="Add Recipe"
            onPress={() => {
              resetRecipeForm();
              setEditingRecipeId(null);
              setShowRecipeForm(true);
            }}
            variant="secondary"
            iconName="add-circle-outline"
            style={styles.quickActionButton}
          />
        </View>
      </Card>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 User Management</Text>
        <Text style={styles.countText}>({users.length} users)</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <Card variant="flat" padding={16} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(item.displayName || item.email || "U")[0]}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {item.displayName || "No Name"}
                </Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          item.role === "admin" ? "#E74C3C" : "#95A5A6",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.role || "user"}</Text>
                  </View>
                  {item.emailVerified && (
                    <View
                      style={[styles.badge, { backgroundColor: "#27AE60" }]}
                    >
                      <Text style={styles.badgeText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/chef-detail/${item.uid}`)}
              >
                <Ionicons name="eye-outline" size={20} color="#3498DB" />
              </TouchableOpacity>
              {item.uid !== user?.uid && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteUser(item.uid)}
                >
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );

  const renderChefs = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👨‍🍳 Chef Management</Text>
        <Text style={styles.countText}>({chefs.length} chefs)</Text>
      </View>

      <FlatList
        data={chefs}
        keyExtractor={(item) => item.chefId}
        renderItem={({ item }) => (
          <Card variant="flat" padding={16} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(item.name || item.displayName || "C")[0]}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {item.name || item.displayName || "No Name"}
                </Text>
                <Text style={styles.userEmail}>
                  {item.cuisine || item.bio || "No cuisine"}
                </Text>
                <View style={styles.userBadges}>
                  <View style={[styles.badge, { backgroundColor: "#3498DB" }]}>
                    <Text style={styles.badgeText}>Chef</Text>
                  </View>
                  {item.verified && (
                    <View
                      style={[styles.badge, { backgroundColor: "#27AE60" }]}
                    >
                      <Text style={styles.badgeText}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/chef-detail/${item.chefId}`)}
              >
                <Ionicons name="eye-outline" size={20} color="#3498DB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditChef(item.chefId)}
              >
                <Ionicons name="pencil-outline" size={20} color="#F39C12" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteChef(item.chefId)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );

  const renderRecipes = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🍳 Recipe Management</Text>
        <Text style={styles.countText}>({recipes.length} recipes)</Text>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.recipeId}
        renderItem={({ item }) => (
          <Card variant="flat" padding={16} style={styles.recipeCard}>
            <View style={styles.recipeHeader}>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>
                  {item.title || "Untitled"}
                </Text>
                <Text style={styles.recipeMeta}>
                  by {item.authorName || item.authorId?.slice(0, 8) + "..."} •{" "}
                  {item.category}
                </Text>
                <View style={styles.recipeBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: item.isPublished
                          ? "#27AE60"
                          : "#95A5A6",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "#F39C12" }]}>
                    <Text style={styles.badgeText}>{item.difficulty}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.recipeActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/recipe-detail/${item.recipeId}`)}
              >
                <Ionicons name="eye-outline" size={20} color="#3498DB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditRecipe(item.recipeId)}
              >
                <Ionicons name="pencil-outline" size={20} color="#F39C12" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteRecipe(item.recipeId)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );

  return (
    <>
      <AppLayout
        scrollable={false}
        header={
          <AppHeader
            title="Admin Dashboard"
            showBack={true}
            onBackPress={() => router.back()}
          />
        }
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: "dashboard", icon: "analytics-outline" },
            { key: "users", icon: "people-outline" },
            { key: "chefs", icon: "people" },
            { key: "recipes", icon: "restaurant-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={activeTab === tab.key ? "#FFF" : "#666"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "chefs" && renderChefs()}
          {activeTab === "recipes" && renderRecipes()}
        </View>
      </AppLayout>

      {showChefForm && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showChefForm}
          onRequestClose={() => setShowChefForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowChefForm(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#A12D2A" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingChefId ? "Edit Chef" : "Add New Chef"}
                </Text>
                <TextInput
                  label="Chef Name"
                  value={chefFormData.name}
                  onChangeText={(text) =>
                    setChefFormData({ ...chefFormData, name: text })
                  }
                  error={chefFormErrors.name}
                />
                <TextInput
                  label="Bio"
                  value={chefFormData.bio}
                  onChangeText={(text) =>
                    setChefFormData({ ...chefFormData, bio: text })
                  }
                  multiline
                  numberOfLines={4}
                />
                <Select
                  label="Sex"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  value={chefFormData.sex}
                  onValueChange={(value) =>
                    setChefFormData({ ...chefFormData, sex: value })
                  }
                  placeholder="Select sex"
                />
                <Select
                  label="Cuisine Specialty"
                  options={[
                    { value: "italian", label: "Italian" },
                    { value: "french", label: "French" },
                    { value: "chinese", label: "Chinese" },
                    { value: "japanese", label: "Japanese" },
                    { value: "mexican", label: "Mexican" },
                    { value: "indian", label: "Indian" },
                    { value: "thai", label: "Thai" },
                    { value: "mediterranean", label: "Mediterranean" },
                    { value: "american", label: "American" },
                    { value: "british", label: "British" },
                    { value: "other", label: "Other" },
                  ]}
                  value={chefFormData.cuisine}
                  onValueChange={(value) =>
                    setChefFormData({ ...chefFormData, cuisine: value })
                  }
                  placeholder="Select cuisine"
                />
                <DatePicker
                  label="Birthdate"
                  value={chefFormData.birthdate}
                  onChange={(value) =>
                    setChefFormData({ ...chefFormData, birthdate: value })
                  }
                  placeholder="Select birthdate"
                />
                <ImagePicker
                  label="Chef Image"
                  value={chefFormData.image}
                  onChange={(image) =>
                    setChefFormData({ ...chefFormData, image })
                  }
                />
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowChefForm(false);
                      resetChefForm();
                    }}
                    variant="secondary"
                  />
                  <Button
                    title="Save Chef"
                    onPress={handleSaveChef}
                    variant="primary"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {showRecipeForm && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRecipeForm}
          onRequestClose={() => setShowRecipeForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowRecipeForm(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#A12D2A" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingRecipeId ? "Edit Recipe" : "Add New Recipe"}
                </Text>
                <TextInput
                  label="Recipe Title"
                  value={recipeFormData.title}
                  onChangeText={(text) =>
                    setRecipeFormData({ ...recipeFormData, title: text })
                  }
                  error={recipeFormErrors.title}
                />
                <TextInput
                  label="Description"
                  value={recipeFormData.description}
                  onChangeText={(text) =>
                    setRecipeFormData({ ...recipeFormData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  error={recipeFormErrors.description}
                />
                <Select
                  label="Difficulty"
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "normal", label: "Normal" },
                    { value: "hard", label: "Hard" },
                    { value: "expert", label: "Expert" },
                  ]}
                  value={recipeFormData.difficulty}
                  onValueChange={(value) =>
                    setRecipeFormData({ ...recipeFormData, difficulty: value })
                  }
                  placeholder="Select difficulty"
                  error={recipeFormErrors.difficulty}
                />
                <Select
                  label="Category"
                  options={[
                    { value: "chicken", label: "Chicken" },
                    { value: "pork", label: "Pork" },
                    { value: "beef", label: "Beef" },
                    { value: "seafood", label: "Seafood" },
                    { value: "vegetables", label: "Vegetables" },
                    { value: "pasta", label: "Pasta" },
                    { value: "dessert", label: "Dessert" },
                    { value: "soup", label: "Soup" },
                    { value: "other", label: "Other" },
                  ]}
                  value={recipeFormData.category}
                  onValueChange={(value) =>
                    setRecipeFormData({ ...recipeFormData, category: value })
                  }
                  placeholder="Select category"
                  error={recipeFormErrors.category}
                />
                <TextInput
                  label="Prep Time"
                  value={recipeFormData.prepTime}
                  onChangeText={(text) =>
                    setRecipeFormData({ ...recipeFormData, prepTime: text })
                  }
                  placeholder="e.g. 30 minutes"
                  error={recipeFormErrors.prepTime}
                />
                <TextInput
                  label="Servings"
                  value={recipeFormData.servings}
                  onChangeText={(text) =>
                    setRecipeFormData({ ...recipeFormData, servings: text })
                  }
                  keyboardType="numeric"
                  error={recipeFormErrors.servings}
                />
                <DynamicArray
                  label="Ingredients"
                  items={recipeFormData.ingredients}
                  onAddItem={handleAddIngredient}
                  onRemoveItem={handleRemoveIngredient}
                  onUpdateItem={handleUpdateIngredient}
                  fieldLabels={["quantity", "unit", "name"]}
                  placeholders={["Qty", "Unit", "Ingredient name"]}
                  error={recipeFormErrors.ingredients}
                  showPrice={true}
                />
                <DynamicArray
                  label="Instructions"
                  items={recipeFormData.instructions}
                  onAddItem={handleAddInstruction}
                  onRemoveItem={handleRemoveInstruction}
                  onUpdateItem={handleUpdateInstruction}
                  fieldLabels={["instruction"]}
                  placeholders={["Step description"]}
                  error={recipeFormErrors.instructions}
                />
                <Select
                  label="Chef"
                  options={chefs.map((chef) => ({
                    value: chef.chefId,
                    label: chef.name,
                  }))}
                  value={recipeFormData.chefId}
                  onValueChange={(value) =>
                    setRecipeFormData({ ...recipeFormData, chefId: value })
                  }
                  placeholder="Select chef"
                  error={recipeFormErrors.chefId}
                />
                <ImagePicker
                  label="Recipe Image"
                  value={recipeFormData.image}
                  onChange={(image) =>
                    setRecipeFormData({ ...recipeFormData, image })
                  }
                />
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowRecipeForm(false);
                      resetRecipeForm();
                      setEditingRecipeId(null);
                    }}
                    variant="secondary"
                  />
                  <Button
                    title="Save Recipe"
                    onPress={handleSaveRecipe}
                    variant="primary"
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
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
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#A12D2A",
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A12D2A",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userBadges: {
    flexDirection: "row",
    gap: 4,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  recipeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recipeHeader: {
    flex: 1,
  },
  recipeInfo: {
    gap: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  recipeMeta: {
    fontSize: 12,
    color: "#666",
  },
  recipeBadges: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
});
