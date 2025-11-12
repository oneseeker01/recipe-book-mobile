/**
 * Type definitions for the Recipe Book Mobile App
 */

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number; // in minutes
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  ratings: Record<string, Rating>;
  averageRating?: number;
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
