import {
  confirmPasswordReset,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Send password reset email to user
 * @param {Object} auth - Firebase auth instance
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (auth, email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: "https://recipe-book.firebaseapp.com/login", // Update with your app URL
    });
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification to user
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user, {
      url: "https://recipe-book.firebaseapp.com/login", // Update with your app URL
    });
    return { success: true, message: "Verification email sent" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Verify password reset code and set new password
 * Used when user clicks link from reset email
 * @param {Object} auth - Firebase auth instance
 * @param {string} code - Verification code from email link
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
export const confirmPasswordResetWithCode = async (auth, code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if user's email is verified
 * @param {Object} user - Firebase user object
 * @returns {boolean}
 */
export const isEmailVerified = (user) => {
  return user?.emailVerified || false;
};

/**
 * Check if user has admin privileges
 * @param {Object} user - Firebase user object
 * @returns {Promise<boolean>}
 */
export const isAdmin = async (user) => {
  if (!user) return false;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role === "admin" || userDoc.data().isAdmin === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Check if user has super admin privileges
 * @param {Object} user - Firebase user object
 * @returns {Promise<boolean>}
 */
export const isSuperAdmin = async (user) => {
  if (!user) return false;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role === "super_admin";
    }
    return false;
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
};

/**
 * Get user's admin role
 * @param {Object} user - Firebase user object
 * @returns {Promise<string>}
 */
export const getUserRole = async (user) => {
  if (!user) return "user";

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role || "user";
    }
    return "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
};
