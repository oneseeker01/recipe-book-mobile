/\*\*

- Quick Admin Creation for Development
-
- Add this temporary button to your profile screen to make yourself admin
- REMOVE THIS CODE AFTER CREATING ADMIN USERS!
  \*/

import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

// Add this button to your profile screen temporarily
const QuickAdminButton = () => {
const makeMeAdmin = async () => {
if (auth.currentUser) {
try {
await updateDoc(doc(db, "users", auth.currentUser.uid), {
role: "admin",
isAdmin: true,
updatedAt: new Date(),
});
alert("You are now an admin! Please logout and login again to see the admin button.");
} catch (error) {
console.error("Error making user admin:", error);
alert("Error: " + error.message);
}
}
};

return (
<TouchableOpacity
style={{ backgroundColor: "#FF6B6B", padding: 12, margin: 8, borderRadius: 8 }}
onPress={makeMeAdmin} >
<Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
🚀 Make Me Admin (Development Only)
</Text>
</TouchableOpacity>
);
};

// Add this to your profile screen JSX (for development only):
{**DEV** && <QuickAdminButton />}

// Remember to remove this entire component after creating your admin users!
