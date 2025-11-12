/**
 * Firestore Data Models & Schema Definitions
 * Defines the structure for all Firestore collections
 * Used for validation, type hints, and consistent data structure
 */

// ===== USERS COLLECTION =====
/**
 * User profile document
 * Location: /users/{uid}
 */
export const UserModel = {
  uid: "string", // Firebase Auth UID
  email: "string",
  displayName: "string", // User's display name
  fullName: "string",
  profilePicture: "string (URL)", // Storage URL
  age: "number",
  sex: "string", // "male" | "female" | "other"
  birthday: "timestamp",
  bio: "string",
  followers: ["string"], // Array of UIDs who follow this user
  followersCount: "number", // Cache of followers array length
  totalRecipes: "number",
  totalLikes: "number",
  averageRating: "number", // Average rating from all recipes
  totalReceivedRatings: "number", // Count of ratings received
  emailVerified: "boolean",
  role: "string", // "user" | "admin" | "super_admin"
  isAdmin: "boolean", // Quick access for admin checks
  isGuest: "boolean", // true for anonymous auth users
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

// ===== RECIPES COLLECTION =====
/**
 * Recipe document
 * Location: /recipes/{recipeId}
 */
export const RecipeModel = {
  recipeId: "string", // auto-generated
  authorId: "string", // uid of recipe creator
  title: "string",
  description: "string",
  image: "string (URL)", // Storage URL
  category: "string", // "Chicken" | "Pork" | "Vegetables" | "Seafood" | etc.
  difficulty: "string", // "easy" | "normal" | "hard" | "expert"
  prepTime: "number", // in minutes
  servings: "number",
  cost: "number", // estimated cost
  ingredients: [
    {
      name: "string",
      quantity: "number",
      unit: "string", // "g" | "ml" | "cup" | "tbsp" | etc.
    },
  ],
  instructions: [
    {
      step: "number",
      instruction: "string",
    },
  ],
  isPublished: "boolean", // false = private, true = shared
  ratings: "number", // average rating 1-5
  totalRatings: "number", // count of ratings
  totalLikes: "number",
  tags: ["string"], // searchable tags
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

// ===== REVIEWS COLLECTION =====
/**
 * Review document (nested or separate)
 * Location: /recipes/{recipeId}/reviews/{reviewId}
 * OR /reviews/{reviewId}
 */
export const ReviewModel = {
  reviewId: "string",
  recipeId: "string",
  userId: "string", // uid of reviewer
  rating: "number", // 1-5 stars
  comment: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

// ===== FAVORITES COLLECTION =====
/**
 * Favorite recipe bookmark
 * Location: /users/{userId}/favorites/{favoriteId}
 * OR /favorites/{favoriteId}
 */
export const FavoriteModel = {
  favoriteId: "string",
  userId: "string",
  recipeId: "string",
  addedAt: "timestamp",
};

// ===== NOTIFICATIONS COLLECTION =====
/**
 * User notification
 * Location: /users/{userId}/notifications/{notificationId}
 */
export const NotificationModel = {
  notificationId: "string",
  userId: "string", // recipient
  type: "string", // "recipe_liked" | "recipe_reviewed" | "recipe_rated" | "new_follower"
  triggeredBy: "string", // uid of user who triggered
  recipeId: "string", // if applicable
  reviewId: "string", // if applicable
  message: "string",
  isRead: "boolean",
  createdAt: "timestamp",
};

// ===== CHAT HISTORY COLLECTION (for Gemini AI) =====
/**
 * AI chat conversation
 * Location: /users/{userId}/chatHistory/{conversationId}
 */
export const ChatHistoryModel = {
  conversationId: "string",
  userId: "string",
  messages: [
    {
      role: "string", // "user" | "assistant"
      content: "string",
      timestamp: "timestamp",
    },
  ],
  topic: "string", // "cooking" or restricted keyword
  createdAt: "timestamp",
  updatedAt: "timestamp",
};

// ===== DEFAULT USER DOCUMENT =====
export const createDefaultUserDoc = (
  uid,
  email,
  isGuest = false,
  isAdmin = false
) => {
  return {
    uid,
    email,
    displayName: isGuest ? "Guest User" : "",
    fullName: isGuest ? "Guest User" : "",
    profilePicture: "",
    age: 0,
    sex: "",
    birthday: null,
    bio: "",
    followers: [],
    followersCount: 0,
    totalRecipes: 0,
    totalLikes: 0,
    averageRating: 0,
    totalReceivedRatings: 0,
    emailVerified: false,
    role: isAdmin ? "admin" : "user",
    isAdmin,
    isGuest,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// ===== DEFAULT RECIPE DOCUMENT =====
export const createDefaultRecipeDoc = (authorId, title = "") => {
  return {
    authorId,
    title,
    description: "",
    image: "",
    category: "",
    difficulty: "easy",
    prepTime: 0,
    servings: 1,
    cost: 0,
    ingredients: [],
    instructions: [],
    isPublished: false,
    ratings: 0,
    totalRatings: 0,
    totalLikes: 0,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
