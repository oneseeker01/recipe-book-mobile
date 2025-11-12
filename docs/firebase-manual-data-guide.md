# Firebase Manual Data Guide - Recipe Book App

## How to Add Recipes and Chefs Manually to Firebase

This guide will walk you through manually adding recipes and chefs to your Firebase Firestore database for the Recipe Book app.

## 🔥 Accessing Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `recipe-book-mobile-86ccb`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on **Start Collection** or **Add Collection**

## 👨‍🍳 Adding Chefs (Users Collection)

### Step 1: Create Users Collection

- Click **Start Collection**
- Collection ID: `users`
- Document ID: Leave empty (Firebase will generate automatically)

### Step 2: Add Chef Document

Click **Add Document** and fill in these required fields:

```json
{
  "uid": "generated-uid-here",
  "email": "chef@email.com",
  "displayName": "Chef Name",
  "profilePicture": "https://example.com/image.jpg",
  "bio": "Professional chef specializing in Italian cuisine",
  "age": 30,
  "sex": "Male",
  "birthday": "1993-05-15",
  "cuisine": "Italian",
  "followers": [],
  "followersCount": 0,
  "totalRecipes": 0,
  "totalLikes": 0,
  "averageRating": 0,
  "totalReceivedRatings": 0,
  "isGuest": false,
  "createdAt": "2024-11-12T14:30:00.000Z",
  "updatedAt": "2024-11-12T14:30:00.000Z"
}
```

### Field Descriptions:

- `uid`: Unique identifier (use Firebase-generated or create your own)
- `email`: Chef's email address
- `displayName`: Chef's full name
- `profilePicture`: URL to profile image (optional)
- `bio`: Short biography
- `age`: Age in years (optional)
- `sex`: "Male", "Female", or other (optional)
- `birthday`: Date in YYYY-MM-DD format (optional)
- `cuisine`: Cuisine specialization (e.g., "Italian", "Chinese", "Mexican")
- `followers`: Array of follower UIDs (start with empty array)
- `followersCount`: Number of followers (start with 0)
- `totalRecipes`: Number of recipes by this chef (start with 0)
- `totalLikes`: Total likes received on all recipes
- `averageRating`: Average rating (start with 0)
- `totalReceivedRatings`: Number of ratings received
- `isGuest`: Always false for registered users
- `createdAt`: Timestamp when account was created
- `updatedAt`: Timestamp when profile was last updated

## 🍳 Adding Recipes (Recipes Collection)

### Step 1: Create Recipes Collection

- Click **Start Collection**
- Collection ID: `recipes`
- Document ID: Leave empty (Firebase will generate automatically)

### Step 2: Add Recipe Document

Click **Add Document** and fill in these required fields:

```json
{
  "title": "Classic Spaghetti Carbonara",
  "description": "A traditional Italian pasta dish with eggs, cheese, and pancetta",
  "difficulty": "medium",
  "category": "pasta",
  "prepTime": 25,
  "servings": 4,
  "cost": 12.5,
  "image": "https://example.com/recipe-image.jpg",
  "userId": "uid-of-the-chef",
  "authorName": "Chef Name",
  "ingredients": [
    {
      "quantity": "400",
      "unit": "g",
      "name": "Spaghetti",
      "price": 3.5
    },
    {
      "quantity": "200",
      "unit": "g",
      "name": "Pancetta",
      "price": 6.0
    },
    {
      "quantity": "3",
      "unit": "pieces",
      "name": "Eggs",
      "price": 2.0
    },
    {
      "quantity": "100",
      "unit": "g",
      "name": "Pecorino Romano",
      "price": 4.0
    }
  ],
  "instructions": [
    {
      "instruction": "Bring a large pot of salted water to boil"
    },
    {
      "instruction": "Cook spaghetti according to package directions"
    },
    {
      "instruction": "Meanwhile, cook pancetta in a pan until crispy"
    },
    {
      "instruction": "Beat eggs with cheese in a bowl"
    },
    {
      "instruction": "Drain pasta, reserving 1 cup pasta water"
    },
    {
      "instruction": "Mix hot pasta with egg mixture, adding pasta water as needed"
    },
    {
      "instruction": "Add pancetta and serve immediately"
    }
  ],
  "ratings": 4.5,
  "totalRatings": 25,
  "totalLikes": 15,
  "isPublished": true,
  "isFavoritedBy": [],
  "createdAt": "2024-11-12T14:30:00.000Z",
  "updatedAt": "2024-11-12T14:30:00.000Z"
}
```

### Field Descriptions:

- `title`: Recipe name
- `description`: Short description of the recipe
- `difficulty`: "easy", "medium", "hard", or "expert"
- `category`: "chicken", "pork", "beef", "seafood", "vegetables", "pasta", "dessert", "soup"
- `prepTime`: Preparation time in minutes
- `servings`: Number of people served
- `cost`: Estimated cost in PHP
- `image`: URL to recipe image (optional)
- `userId`: UID of the chef who created this recipe
- `authorName`: Name of the chef (for display)
- `ingredients`: Array of ingredient objects
  - `quantity`: Amount needed
  - `unit`: Unit of measurement (g, ml, pieces, etc.)
  - `name`: Ingredient name
  - `price`: Cost of this ingredient (optional)
- `instructions`: Array of instruction objects
  - `instruction`: Step description
- `ratings`: Average rating (0-5)
- `totalRatings`: Number of people who rated
- `totalLikes`: Number of people who liked this recipe
- `isPublished`: Always true for public recipes
- `isFavoritedBy`: Array of user UIDs who favorited this recipe
- `createdAt`: Timestamp when recipe was created
- `updatedAt`: Timestamp when recipe was last updated

## 📝 Sample Data Templates

### Chef Template

Use this template when adding new chefs:

```json
{
  "uid": "chef-unique-id",
  "email": "chef@example.com",
  "displayName": "Full Name",
  "profilePicture": "",
  "bio": "Short biography",
  "age": null,
  "sex": "",
  "birthday": null,
  "cuisine": "Cuisine Type",
  "followers": [],
  "followersCount": 0,
  "totalRecipes": 0,
  "totalLikes": 0,
  "averageRating": 0,
  "totalReceivedRatings": 0,
  "isGuest": false,
  "createdAt": "2024-11-12T14:33:00.000Z",
  "updatedAt": "2024-11-12T14:33:00.000Z"
}
```

### Recipe Template

Use this template when adding new recipes:

```json
{
  "title": "Recipe Name",
  "description": "Short description",
  "difficulty": "medium",
  "category": "category",
  "prepTime": 30,
  "servings": 4,
  "cost": 10.0,
  "image": "",
  "userId": "chef-uid",
  "authorName": "Chef Name",
  "ingredients": [
    {
      "quantity": "1",
      "unit": "cup",
      "name": "Ingredient",
      "price": 2.0
    }
  ],
  "instructions": [
    {
      "instruction": "Step 1 description"
    }
  ],
  "ratings": 0,
  "totalRatings": 0,
  "totalLikes": 0,
  "isPublished": true,
  "isFavoritedBy": [],
  "createdAt": "2024-11-12T14:33:00.000Z",
  "updatedAt": "2024-11-12T14:33:00.000Z"
}
```

## 🎯 Tips for Adding Data

### Best Practices:

1. **Use Consistent Data Types**: Follow the exact format shown above
2. **Validate URLs**: Make sure image URLs are valid and accessible
3. **Use Proper Timestamps**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
4. **Check Required Fields**: Don't leave required fields empty
5. **Test After Adding**: Check the app to ensure data displays correctly

### Common Mistakes to Avoid:

1. **Wrong Date Format**: Use YYYY-MM-DD for birthdays
2. **Missing Required Fields**: All fields shown above are required
3. **Invalid User References**: Make sure `userId` exists in users collection
4. **Incorrect Difficulty Values**: Use exactly "easy", "medium", "hard", or "expert"
5. **Wrong Category Values**: Use exactly "chicken", "pork", "beef", "seafood", "vegetables", "pasta", "dessert", or "soup"

## 🔧 Troubleshooting

### Data Not Showing in App:

1. Check if `isPublished` is set to `true`
2. Verify all required fields are filled
3. Ensure timestamps are in correct format
4. Check Firebase rules allow reading the data

### App Crashes:

1. Verify data types match expected format (numbers vs strings)
2. Check if arrays are properly formatted
3. Ensure all required nested fields exist

### Images Not Loading:

1. Use publicly accessible image URLs
2. Check if URLs start with `http://` or `https://`
3. Test URLs in a browser to ensure they work

## 📊 Example Datasets

### Sample Chefs:

1. **Mario Rossi** - Italian cuisine expert
2. **Li Wei** - Chinese cuisine specialist
3. **Maria Garcia** - Mexican cuisine chef

### Sample Recipes:

1. **Classic Spaghetti Carbonara** (Italian, Medium)
2. **Kung Pao Chicken** (Chinese, Medium)
3. **Chicken Tacos** (Mexican, Easy)

Start with a few sample entries to test the app functionality, then gradually add more content!
