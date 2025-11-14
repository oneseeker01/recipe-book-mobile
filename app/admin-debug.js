export default function handleEditRecipe(
  recipes,
  recipeId,
  setRecipeFormData,
  setEditingRecipeId,
  setShowRecipeForm
) {
  console.log("DEBUG: handleEditRecipe called with recipeId:", recipeId);
  const recipe = recipes?.find((r) => r.recipeId === recipeId);
  if (recipe) {
    setRecipeFormData({
      title: recipe.title || "",
      description: recipe.description || "",
      difficulty: recipe.difficulty || "",
      category: recipe.category || "",
      prepTime: recipe.prepTime || "",
      servings: recipe.servings?.toString() || "",
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      image: recipe.image || null,
      chefId: recipe.chefId || "",
    });
    console.log("DEBUG: About to set editingRecipeId to:", recipeId);
    setEditingRecipeId(recipeId);
    console.log("DEBUG: setEditingRecipeId completed, now showing form");
    setShowRecipeForm(true);
  }
}
