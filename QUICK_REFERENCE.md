# Recipe Book Mobile App - Quick Reference Guide

## App Navigation Flow

```
Login/Signup
    ↓
├─ Login with credentials → Firestore user check → Home
├─ Login as Guest → Home
└─ Forgot Password → Email reset → Login

Home (Tab)
├─ Filter: Recipes ↔ Chefs
├─ Sort: A-Z, Z-A, Newest, Top Rated, Most Liked
├─ Categories: (Recipes) or Cuisines: (Chefs)
├─ Recipe/Chef Card → Detail View
└─ Recipe Card → Favorite heart

My Recipes (Tab)
├─ View user's recipes
├─ + Button → Add Recipe Form
├─ Recipe Card → Edit
└─ Delete option (with confirmation)

Favorites (Tab)
├─ Recipes section (scrollable)
├─ Chefs section (scrollable)
└─ Remove from favorites

Gemini AI (Tab)
├─ Chat interface
├─ Message history (integrated)
├─ Start New Chat button
└─ Cooking-focused questions/suggestions

Notifications (Tab)
├─ Admin update feed
├─ Real-time sync
├─ Mark as read
└─ View notification details

Profile (Tab)
├─ Profile picture
├─ Full name
├─ Total recipes count
├─ Settings ⚙️ icon → Settings Screen
└─ Logout button

Recipe Detail
├─ Full recipe info (title, image, description)
├─ Ingredients list with ☐ checkboxes
├─ Instructions with ☐ checkboxes
├─ Ratings display
├─ Favorite ♥ button
└─ Completion trigger → "Congrats!" modal

Chef Detail
├─ Chef profile card
│  ├─ Name, Age, Sex, Birthday
│  ├─ Profile picture, Bio
│  └─ Cuisine specialty
├─ Follow/Unfollow button
└─ Recipes (scrollable cards)

Settings
├─ Full Name (editable, required)
├─ Email (read-only)
├─ Age (editable, optional)
├─ Sex/Gender (radio buttons, optional)
├─ Birthday (date picker, optional)
└─ Save/Cancel buttons
```

---

## Key Features by Screen

### 1. **Authentication**

- Email/Password login
- Guest login (anonymous)
- Sign up with email/password
- Forgot password (email-based reset)
- Firestore user validation

### 2. **Discovery (Home Screen)**

- Browse recipes and chefs
- Filter by category
- Sort (A-Z, Z-A, date, rating, likes)
- Search by name/description
- Real-time updates

### 3. **User Generated Content (My Recipes)**

- Create new recipes
- Edit existing recipes
- Delete recipes
- Include all recipe details

### 4. **Personalization (Favorites)**

- Save favorite recipes
- Save favorite chefs
- Manage favorites
- Quick access to loved items

### 5. **AI Assistant (Gemini)**

- Chat with Recipe Genie
- Cooking tips and suggestions
- Recipe recommendations
- Persistent chat history
- Fresh conversation option

### 6. **Notifications**

- Real-time admin updates
- New recipes notification
- Updated recipes notification
- Deleted recipes notification
- New chefs notification
- Read/unread tracking

### 7. **Profile Management**

- View profile info
- Edit personal details
- Manage privacy
- Access settings
- Logout

### 8. **Recipe Cooking Assistant**

- Check off ingredients while shopping
- Check off instructions while cooking
- Track progress
- Completion celebration popup

---

## User Journeys

### Journey 1: Discover and Cook a Recipe

1. Login/Signup
2. Browse Home (filter/sort recipes)
3. Select recipe → Recipe Detail
4. Review all information
5. Check off ingredients
6. Check off instructions
7. Complete → "Congrats!" popup
8. Add to Favorites (optional)

### Journey 2: Create Own Recipe

1. Login with credentials
2. My Recipes tab
3. - Button → Add Recipe
4. Fill all fields (title, ingredients, instructions, etc.)
5. Upload image
6. Save recipe
7. Recipe appears in My Recipes list

### Journey 3: Follow a Chef

1. Home → Switch to Chefs view
2. Browse chefs
3. Select chef → Chef Detail
4. Review chef info and recipes
5. Follow chef
6. View all chef's recipes

### Journey 4: Use AI Assistant

1. Gemini AI tab
2. Ask cooking question
3. Get response from Recipe Genie
4. Continue conversation
5. View chat history
6. Start new conversation if needed

### Journey 5: Manage Settings

1. Profile tab
2. Settings ⚙️ icon
3. Update personal info
4. Save changes
5. Return to profile

---

## Data Model Summary

### Core Entities:

- **Users:** Authentication + profile (name, age, sex, birthday, favorites)
- **Recipes:** Title, image, ingredients, instructions, difficulty, category, cost
- **Chefs:** Profile, cuisine, bio, followers, recipes
- **Favorites:** User-saved recipes and chefs
- **Notifications:** Admin updates about recipes/chefs
- **Chat History:** User-AI conversations

### Key Fields:

- **Recipe difficulty:** Easy, Normal, Hard, Expert
- **Recipe categories:** Chicken, Pork, Beef, Seafood, Vegetables, Pasta, Dessert, Soup
- **Chef cuisines:** Italian, Chinese, Japanese, Mexican, French, Indian, Thai, American, Mediterranean
- **User gender:** Male, Female, Other, Prefer not to say

---

## Component Hierarchy

```
App Root
├─ Auth Provider
│  ├─ Login Screen
│  └─ Signup Screen
├─ Main Navigation (Tabs)
│  ├─ Home Tab
│  │  ├─ HomeScreen
│  │  ├─ RecipeCard
│  │  ├─ ChefCard
│  │  └─ Search/Filter Controls
│  ├─ My Recipes Tab
│  │  ├─ MyRecipesScreen
│  │  ├─ RecipeCard
│  │  └─ AddRecipeForm
│  ├─ Favorites Tab
│  │  ├─ FavoritesScreen
│  │  ├─ RecipeCard
│  │  └─ ChefCard
│  ├─ Gemini Tab
│  │  ├─ GeminiScreen
│  │  ├─ ChatBubbles
│  │  └─ MessageInput
│  ├─ Notifications Tab
│  │  ├─ NotificationsScreen
│  │  └─ NotificationCard
│  └─ Profile Tab
│     ├─ ProfileScreen
│     └─ LogoutButton
├─ Recipe Detail (Modal Stack)
│  ├─ RecipeDetailScreen
│  ├─ CheckboxList
│  └─ CongratsModal
├─ Chef Detail (Modal Stack)
│  ├─ ChefDetailScreen
│  └─ RecipeCardList
└─ Settings (Modal Stack)
   └─ SettingsScreen
```

---

## Testing Priorities

### High Priority:

1. Authentication flow (all methods)
2. Recipe creation/editing/deletion
3. Ingredient/instruction checkboxes
4. Congratulations popup trigger
5. Home screen filtering and sorting
6. Notifications real-time updates

### Medium Priority:

1. Chat history persistence
2. Favorite add/remove
3. Chef profile display
4. Settings form save
5. Search functionality

### Low Priority:

1. UI polish and animations
2. Edge case error handling
3. Performance optimization on very low-end devices

---

## Configuration Checklist

### Before Launch:

- [ ] Firebase Firestore security rules
- [ ] Firebase Storage configuration
- [ ] Firebase Authentication enabled
- [ ] Gemini API key configured
- [ ] Email templates for password reset
- [ ] Test data (sample recipes, chefs)
- [ ] App icons and splash screen
- [ ] Privacy policy and terms

### Performance:

- [ ] Test on low-end device
- [ ] Verify caching works
- [ ] Check bundle size
- [ ] Monitor Firestore read/write costs
- [ ] API rate limits

### Security:

- [ ] Validate all user inputs
- [ ] Secure API keys
- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] Admin authentication for content

---

## Common Tasks

### For Users:

- "How do I reset my password?" → Login screen → "Forgot Password?"
- "How do I create a recipe?" → My Recipes tab → + button
- "How do I find a specific recipe?" → Home → Search bar
- "How do I get cooking tips?" → Gemini AI tab → Ask questions

### For Developers:

- Add new recipe category → Update CATEGORY_OPTIONS in home.js
- Add new chef cuisine → Update CHEF_CUISINES in home.js
- Modify Firebase schema → Update types and firestore-models.js
- Add new notification type → Update notifications.js logic

### For Admin:

- Add recipe → Manual entry to Firestore recipes collection
- Add chef → Manual entry to Firestore users collection
- Remove/update items → Direct Firestore modifications
- Monitor notifications → Check notifications collection

---

## Version Info

- **App Version:** 1.0.0
- **Last Updated:** November 12, 2025
- **Status:** Ready for Testing
- **Target Platforms:** iOS 12+, Android 7+
- **Optimization:** Low-end device compatible

---

**For detailed technical documentation, see:**

- `REFACTORING_SUMMARY.md` - Complete refactoring details
- `IMPLEMENTATION_VERIFICATION.md` - Testing and verification checklist
