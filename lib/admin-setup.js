/**
 * Simple Admin Creation Methods
 *
 * Multiple ways to create admin users for your recipe app:
 */

// ========================================
// METHOD 1: Firestore Console (Easiest)
// ========================================
/*
1. Go to Firebase Console → Firestore Database
2. Navigate to "users" collection
3. Either:
   a) Edit an existing user document:
      - Add/Update: role = "admin"
      - Add/Update: isAdmin = true
   
   b) Create new user document manually:
      uid: "generated-uid"
      email: "admin@example.com"
      displayName: "Admin User"
      role: "admin"
      isAdmin: true
      // ... other default fields

4. User can now login normally and will see admin dashboard button
*/

// ========================================
// METHOD 2: In-App Admin Creation (Development)
// ========================================
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Create admin user directly in your app (for development only)
 */
export const createAdminInApp = async (userId, adminData = {}) => {
  try {
    const adminUser = {
      uid: userId,
      email: adminData.email || "admin@example.com",
      displayName: adminData.displayName || "Admin User",
      role: "admin",
      isAdmin: true,
      emailVerified: true,
      bio: "Admin user",
      followers: [],
      followersCount: 0,
      totalRecipes: 0,
      totalLikes: 0,
      averageRating: 0,
      totalReceivedRatings: 0,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...adminData,
    };

    await setDoc(doc(db, "users", userId), adminUser, { merge: true });
    console.log("Admin user created successfully");
    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

/**
 * Grant admin privileges to existing user
 */
export const makeUserAdmin = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: "admin",
      isAdmin: true,
      updatedAt: new Date(),
    });
    console.log("User promoted to admin successfully");
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
};

/**
 * Remove admin privileges
 */
export const removeAdminPrivileges = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: "user",
      isAdmin: false,
      updatedAt: new Date(),
    });
    console.log("Admin privileges removed successfully");
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    throw error;
  }
};

// ========================================
// METHOD 3: Firebase Admin SDK Script
// ========================================
/*
For production use the admin-setup.js script:
1. npm install firebase-admin
2. Add your Firebase service account key
3. Run: node scripts/admin-setup.js
4. Use functions like:
   - createAdminUser('admin@example.com', 'password123', 'Admin Name')
   - grantAdminPrivileges('user-uid-here')
   - listUsers()
*/

// ========================================
// USAGE EXAMPLES
// ========================================
/*
// Quick admin creation for development:
import { createAdminInApp } from './admin-setup-utils';

// Create admin for current user (after they login)
const makeCurrentUserAdmin = async (currentUser) => {
  if (currentUser) {
    await createAdminInApp(currentUser.uid, {
      email: currentUser.email,
      displayName: currentUser.displayName || "Admin User"
    });
    // Force user to logout and login again to see admin button
  }
};

// Or use in your admin setup component:
const handleCreateAdmin = async (userId) => {
  try {
    await makeUserAdmin(userId);
    alert("User promoted to admin!");
  } catch (error) {
    alert("Error: " + error.message);
  }
};
*/

// Default export for easy importing
export default {
  createAdminInApp,
  makeUserAdmin,
  removeAdminPrivileges,
};
