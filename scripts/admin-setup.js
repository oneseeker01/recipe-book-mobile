/**
 * Admin Setup Script
 *
 * Run this script to create an admin user or grant admin privileges to existing users.
 * This script can be run from a Node.js environment with Firebase Admin SDK.
 */

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (replace with your config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};

initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

/**
 * Create a new admin user
 */
async function createAdminUser(email, password, displayName) {
  try {
    console.log(`Creating admin user: ${email}`);

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    console.log(`Successfully created user: ${userRecord.uid}`);

    // Create user document in Firestore with admin privileges
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: email,
        displayName: displayName || email.split("@")[0],
        fullName: displayName || email.split("@")[0],
        profilePicture: "",
        age: 0,
        sex: "",
        birthday: null,
        bio: "Admin user",
        followers: [],
        followersCount: 0,
        totalRecipes: 0,
        totalLikes: 0,
        averageRating: 0,
        totalReceivedRatings: 0,
        emailVerified: true,
        role: "admin",
        isAdmin: true,
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    console.log(`Admin user created successfully: ${email}`);
    return userRecord.uid;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

/**
 * Grant admin privileges to existing user
 */
async function grantAdminPrivileges(userId) {
  try {
    console.log(`Granting admin privileges to user: ${userId}`);

    await db.collection("users").doc(userId).update({
      role: "admin",
      isAdmin: true,
      updatedAt: new Date(),
    });

    console.log(`Admin privileges granted to user: ${userId}`);
  } catch (error) {
    console.error("Error granting admin privileges:", error);
    throw error;
  }
}

/**
 * Remove admin privileges from user
 */
async function removeAdminPrivileges(userId) {
  try {
    console.log(`Removing admin privileges from user: ${userId}`);

    await db.collection("users").doc(userId).update({
      role: "user",
      isAdmin: false,
      updatedAt: new Date(),
    });

    console.log(`Admin privileges removed from user: ${userId}`);
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    throw error;
  }
}

/**
 * List all users with their roles
 */
async function listUsers() {
  try {
    console.log("Fetching all users...");

    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("\nUser List:");
    console.log("=".repeat(60));
    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.displayName}`);
      console.log(`Role: ${user.role || "user"}`);
      console.log(`Admin: ${user.isAdmin ? "Yes" : "No"}`);
      console.log(`UID: ${user.uid}`);
      console.log("-".repeat(60));
    });

    return users;
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

// Example usage:
// await createAdminUser('admin@example.com', 'securepassword123', 'Admin User');
// await grantAdminPrivileges('user-uid-here');
// await listUsers();

export {
  createAdminUser,
  grantAdminPrivileges,
  listUsers,
  removeAdminPrivileges,
};
