/**
 * Type definitions for the Recipe Book Mobile App
 */

export interface Recipe {
  id: string;
  recipeId: string; // Firestore document ID
  title: string;
  description: string;
  imageUrl: string;
  image?: string; // Alternative image field used in components
  authorId: string;
  authorName: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number; // in minutes
  prepTime?: number; // Alternative prep time field
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  cuisine?: string; // Cuisine type (British, Italian, American, etc.)
  tags: string[];
  ratings: Record<string, Rating>;
  averageRating?: number;
  isAdminContent?: boolean; // Admin-added content flag
  isPublished?: boolean; // Published status
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string; // e.g., 'cup', 'tbsp', 'g', etc.
}

export interface Rating {
  score: number; // 1-5
  timestamp: Date;
  comment?: string;
}

export interface Chef {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  specialties: string[];
  createdAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  favoriteRecipes: string[];
  myRecipes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp?: Date;
}

export interface SearchFilter {
  query: string;
  category?: string;
  difficulty?: string;
  maxCookingTime?: number;
}
