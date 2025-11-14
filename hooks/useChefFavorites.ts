import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";

/**
 * Custom hook to manage user's favorite chefs
 * Returns the list of favorite chef IDs for the current user
 */
export default function useChefFavorites() {
  const [favoriteChefIds, setFavoriteChefIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setFavoriteChefIds([]);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const favoriteChefs = userData.favoriteChefs || [];
          console.log(
            "useChefFavorites: favoriteChefs from user doc:",
            favoriteChefs
          );
          setFavoriteChefIds(favoriteChefs);
          console.log(
            "useChefFavorites: set favoriteChefIds to:",
            favoriteChefs
          );
        } else {
          console.log("useChefFavorites: user doc does not exist");
          setFavoriteChefIds([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching chef favorites:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { favoriteChefIds, loading };
}
