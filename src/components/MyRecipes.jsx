import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import NavBar from "./NavBar";

const MyRecipes = ({ userId, userData }) => {
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [image, setImage] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // Toggle visibility of the form
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Store selected recipe details
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // State for delete confirmation modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/recipes/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;
        setRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    };

    fetchRecipes();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][name] = value;
    setIngredients(updatedIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: "", unit: "", name: "" }]);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const listItem = e.target.closest('li');
    if (listItem) {
      if (draggedIndex < index) {
        listItem.style.borderBottom = '2px solid #4299e1';
        listItem.style.borderTop = 'none';
      } else {
        listItem.style.borderTop = '2px solid #4299e1';
        listItem.style.borderBottom = 'none';
      }
    }
  };

  const handleDragLeave = (e) => {
    const listItem = e.target.closest('li');
    if (listItem) {
      listItem.style.borderTop = 'none';
      listItem.style.borderBottom = 'none';
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const listItem = e.target.closest('li');
    if (listItem) {
      listItem.style.borderTop = 'none';
      listItem.style.borderBottom = 'none';
    }

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newInstructions = [...instructions];
    const [draggedItem] = newInstructions.splice(draggedIndex, 1);
    newInstructions.splice(dropIndex, 0, draggedItem);

    setInstructions(newInstructions);
    setDraggedIndex(null);
  };

  const resetForm = () => {
    setRecipeTitle('');
    setIngredients([{ quantity: '', unit: '', name: '' }]);
    setInstructions(['']);
    setImage('');
    setSelectedRecipe(null);
  };

  // Update the handleSubmit function's API calls
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!recipeTitle.trim()) {
        throw new Error("Recipe title is required");
      }

      const recipeData = {
        title: recipeTitle,
        ingredients: ingredients.filter(ing => ing.name.trim() !== ''), // Filter out empty ingredients
        instructions: instructions.filter(inst => inst.trim() !== ''), // Filter out empty instructions
        image: image,
        userId: userId,
        origin: selectedRecipe ? selectedRecipe.origin : 0 // Preserve origin for edited recipes
      };

      let response;
      if (selectedRecipe) {
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/recipes/${selectedRecipe._id}`,
          recipeData
        );
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => 
            recipe._id === selectedRecipe._id ? response.data : recipe
          )
        );
      } else {
        response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/recipes`, recipeData);
        setRecipes(prevRecipes => [...prevRecipes, response.data]);
      }

      setIsFormVisible(false);
      resetForm(); // Now this function is defined
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert("Failed to submit the recipe. Please ensure all required fields are filled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the handleDeleteRecipe function
  const handleDeleteRecipe = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/recipes/${selectedRecipe._id}`,
        { data: { userId: userId } }  // Send userId in request body
      );
      
      setRecipes(prevRecipes => 
        prevRecipes.filter(recipe => recipe._id !== selectedRecipe._id)
      );
      setSelectedRecipe(null);
      setIsDeleteModalVisible(false); // Close modal after deletion
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    // Populate form with recipe data when editing
    setRecipeTitle(recipe.title || '');
    setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ quantity: '', unit: '', name: '' }]);
    setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
    setImage(recipe.image || '');
    setIsFormVisible(false);
  };

  const handleFormToggle = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      resetForm(); // Reset form when opening new recipe form
    }
  };

  return (
    <div className="flex">
      <NavBar username={userData?.username} />
     {/* Sidebar */}
        <div className="w-1/4 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-roboto-mono">Your Recipes</h2>
            <button
            onClick={handleFormToggle}
            className={`font-roboto-mono px-4 py-2 bg-transparent text-black rounded hover:bg-gray-100 ${
              isFormVisible ? 'text-lg' : 'text-xl'
            }`}
          >
            {isFormVisible ? 'Cancel' : '+'}
          </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-roboto-mono">My own yums</h3>
            <ul className="space-y-2">
              {recipes.filter(recipe => recipe.origin === 0).map((recipe) => (
                <li
                  key={recipe._id}
                  className={`font-medium font-roboto-mono p-2 hover:bg-gray-100 rounded cursor-pointer ${
                    selectedRecipe?._id === recipe._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  {recipe.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mt-12 font-roboto-mono">AI yums</h3>
            <ul className="space-y-2">
              {recipes.filter(recipe => recipe.origin !== 0).map((recipe) => (
                <li
                  key={recipe._id}
                  className={`font-medium font-roboto-mono p-2 hover:bg-gray-100 rounded cursor-pointer ${
                    selectedRecipe?._id === recipe._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  {recipe.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
          
      {/* Right section */}
      <div className="w-3/4 p-4">
        {isFormVisible ? (
          <>
            <h2 className="text-xl font-bold mb-4">
              {selectedRecipe ? 'Edit Recipe' : 'Add Recipe'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={recipeTitle || ''}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="Recipe Title"
                className="border p-2 w-full rounded"
                required
              />
  
              {/* Ingredients Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="number"
                        name="quantity"
                        value={ingredient.quantity || ''}
                        onChange={(e) => handleIngredientChange(index, e)}
                        placeholder="Quantity"
                        className="border p-2 w-24 rounded"
                        min="0"
                        step="any"
                      />
                      <select
                        name="unit"
                        value={ingredient.unit || ''}
                        onChange={(e) => handleIngredientChange(index, e)}
                        className="border p-2 w-32 rounded"
                      >
                        <option value="">Select Unit</option>
                        <option value="tbsp">Tablespoon</option>
                        <option value="tsp">Teaspoon</option>
                        <option value="cup">Cup</option>
                        <option value="oz">Ounce</option>
                        <option value="g">Gram</option>
                        <option value="kg">Kilogram</option>
                        <option value="lb">Pound</option>
                        <option value="ml">Milliliter</option>
                        <option value="l">Liter</option>
                        <option value="piece">Piece</option>
                      </select>
                      <input
                        type="text"
                        name="name"
                        value={ingredient.name || ''}
                        onChange={(e) => handleIngredientChange(index, e)}
                        placeholder="Ingredient Name"
                        className="border p-2 flex-1 rounded"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newIngredients = ingredients.filter((_, i) => i !== index);
                            setIngredients(newIngredients);
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIngredients([...ingredients, { quantity: '', unit: '', name: '' }])}
                  className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Add Ingredient
                </button>
              </div>
  
              {/* Instructions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <ul className="space-y-2">
                  {instructions.map((instruction, index) => (
                    <li
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className="flex items-center gap-2 bg-white rounded transition-colors"
                    >
                      <div className="p-2 cursor-move text-gray-400 hover:text-gray-600">
                        ⋮⋮
                      </div>
                      <input
                        type="text"
                        value={instruction || ''}
                        onChange={(e) => {
                          const updatedInstructions = [...instructions];
                          updatedInstructions[index] = e.target.value;
                          setInstructions(updatedInstructions);
                        }}
                        placeholder={`Step ${index + 1}`}
                        className="border p-2 flex-1 rounded"
                      />
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newInstructions = instructions.filter((_, i) => i !== index);
                            setInstructions(newInstructions);
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setInstructions([...instructions, ''])}
                  className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Add Instruction
                </button>
              </div>
  
              {/* Image URL Input */}
              <input
                type="text"
                value={image || ''}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Image URL (optional)"
                className="border p-2 w-full rounded"
              />
  
              {/* Submit Button */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Saving...' : selectedRecipe ? 'Update Recipe' : 'Add Recipe'}
                </button>
                {selectedRecipe && (
                  <button
                    type="button"
                    onClick={() => {
                      handleFormToggle();
                      setSelectedRecipe(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        ) : selectedRecipe ? (
          <div>
            {/* Recipe Display */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-roboto-mono">{selectedRecipe.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteModalVisible(true)} // Show delete confirmation modal
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
  
            {/* Display Image if exists */}
            {selectedRecipe.image && (
              <div className="mb-6">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full max-h-96 object-cover rounded"
                />
              </div>
            )}
  
            {/* Ingredients List */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 font-roboto-mono">Ingredients</h3>
              <ul className="space-y-2 font-space-mono">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex gap-2">
                    <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Instructions List */}
            <div>
              <h3 className="text-lg font-semibold mb-2 font-roboto-mono">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {selectedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="font-space-mono mt-2">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-roboto-mono">
            <p>Select a recipe to view details or create a new one</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this recipe?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsDeleteModalVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecipe}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;