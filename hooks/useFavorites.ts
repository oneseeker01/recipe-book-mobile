import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";

/**
 * Custom hook to manage user's favorite recipes
 * Returns the list of favorite recipe IDs for the current user
 */
export default function useFavorites() {
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setFavoriteRecipeIds([]);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setFavoriteRecipeIds(userData.favoriteRecipes || []);
        } else {
          setFavoriteRecipeIds([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching favorites:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { favoriteRecipeIds, loading };
}
