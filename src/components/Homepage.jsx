import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Correct import statement
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { apiClient } from "../config/api";
import FilterModal from "./FilterModal";
import axios from 'axios';

const Homepage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [filters, setFilters] = useState({
    cuisines: [],
    diets: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        // Decode the token to get user data
        const decodedToken = jwtDecode(token);
        const { userId, username, email } = decodedToken;
        setUserData({ userId, username, email });
      } catch (error) {
        if (error.name === "InvalidTokenError") {
          console.error("Invalid token:", error);
          alert("Invalid token. Please log in again.");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [navigate]);

  const saveRecipe = async () => {
    try {
      if (!generatedRecipe || !generatedRecipe.title) {
        throw new Error("Generated recipe is missing a title");
      }

      const parseIngredient = (ingredient) => {
        const specialCases = ["to taste", "as needed"];
        const parts = ingredient.split(' ');
        const quantity = parseFloat(parts[0]);
        const unit = parts[1];
        const name = parts.slice(2).join(' ');

        // Handle special cases
        if (specialCases.includes(parts.slice(-2).join(' '))) {
          return {
            quantity: 0, // Use 0 for special cases
            unit: 'to taste', // Set a default unit for special cases
            name: ingredient
          };
        }

        // Remove repeated words or phrases
        const nameParts = name.split(' ');
        const uniqueNameParts = nameParts.filter((part, index) => nameParts.indexOf(part) === index);
        const uniqueName = uniqueNameParts.join(' ');

        return {
          quantity: isNaN(quantity) ? 1 : quantity, // Default to 1 if quantity is not a number
          unit: unit || 'unit', // Default to 'unit' if no unit is found
          name: uniqueName || ingredient // Default to the full ingredient string if no name is found
        };
      };

      const recipeData = {
        title: generatedRecipe.title,
        ingredients: generatedRecipe.ingredients.map(parseIngredient),
        instructions: generatedRecipe.instructions,
        origin: 1, // 1 indicates AI-generated recipe
        userId: userData.userId // Add userId here
      };

      const response = await apiClient.post("/recipes", recipeData); // Correct API endpoint

      if (response && response._id) { // Check for successful response
        setIsSaved(true);
        // Add visual feedback
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Recipe saved successfully!';
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
        document.body.appendChild(successMessage);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      // Add error feedback
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Failed to save recipe. Please try again.';
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg';
      document.body.appendChild(errorMessage);
      
      // Remove the error message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(errorMessage);
    }, 3000);
    }
  };

  
  const splitInstructions = (instructions) => {
    // Check if instructions is an array and not empty
    if (!Array.isArray(instructions) || instructions.length === 0) {
      return []; // Return an empty array if instructions are invalid
    }
  
    return instructions.map((instruction, index) => `${index + 1}. ${instruction.trim()}`);
  };
  

  // Generate recipe using AI (OpenAI)
  const generateRecipe = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setGeneratedRecipe(null);
    setError("");
    setIsSaved(false);

    // Log the filters before making the request
    console.log('Selected filters:', filters);
    console.log('Selected cuisines:', filters.cuisines);
    console.log('Selected diets:', filters.diets);

    try {
      const requestData = {
        ingredients: searchTerm,
        cuisines: filters.cuisines,
        diets: filters.diets
      };
      
      const data = await apiClient.post('/recipes/generate', requestData);
      console.log('Generated recipe data:', data);
      setGeneratedRecipe(data);
    } catch (error) {
      console.error("Recipe generation error:", error);
      setError(error.message || "Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
};



  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <NavBar username={userData?.username} />

      <div className="flex flex-col md:flex-row">
        <div className="container mx-auto flex justify-center min-h-screen p-4">
          <div className="w-full max-w-6xl">
            <div className="relative w-full md:w-3/5 mx-auto">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block w-full p-4 pl-10 pr-24 text-sm text-gray-900 border-2 border-gray-300 rounded-lg bg-transparent focus:ring-blue-500 focus:border-blue-500 font-space-mono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter ingredients, separated by commas"
                required
              />
              <div className="absolute right-2.5 bottom-2.5 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 border rounded hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#fabd00] text-black rounded hover:bg-[#D9A500] font-roboto-mono"
                  onClick={generateRecipe}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>

            {generatedRecipe && (
        <div className="mt-10">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl md:text-3xl font-bold font-roboto-mono">
              {generatedRecipe.title}
            </h3>
            <button
            onClick={saveRecipe}
            disabled={isSaved}
            className={`${
              isSaved 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded transition-colors duration-200 flex items-center gap-2`}
          >
            {isSaved ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved!
              </>
            ) : (
              'Save Recipe'
            )}
          </button>
          </div>

          <h4 className="text-xl md:text-2xl font-bold font-roboto-mono mt-4">
            Ingredients
          </h4>
          <ul className="space-y-2 mt-2 text-sm md:text-base font-space-mono">
            {generatedRecipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>

          <h4 className="text-xl md:text-2xl font-bold font-roboto-mono mt-4">
            Instructions
          </h4>
          <ol className="mt-2 text-sm md:text-base font-space-mono">
          {splitInstructions(generatedRecipe.instructions).map((instruction, index) => (
            <li className="mt-2" key={index}>{instruction}</li>
          ))}
        </ol>
        </div>
      )}

            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Homepage;
