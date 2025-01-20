import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-modal";

const API_KEY = "03ae88d2df604e0b8755b771351d8fc4";

const RecipeDetail = () => {
  const { id } = useParams();

  // Try to retrieve the recipe from sessionStorage
  const [recipe, setRecipe] = useState(() => {
    const savedRecipe = sessionStorage.getItem(`recipe-${id}`);
    return savedRecipe ? JSON.parse(savedRecipe) : null;
  });

  const [isLoading, setIsLoading] = useState(recipe === null);

  // State for modal and substitutes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [substitutes, setSubstitutes] = useState([]);
  const [substituteIngredient, setSubstituteIngredient] = useState("");

  useEffect(() => {
    if (!recipe) {
      const fetchRecipeDetails = async () => {
        try {
          const response = await fetch(
            `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
          );
          const data = await response.json();
          setRecipe(data);
          sessionStorage.setItem(`recipe-${id}`, JSON.stringify(data)); // Store recipe in sessionStorage
        } catch (error) {
          console.error("Error fetching recipe details:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecipeDetails();
    }
  }, [id, recipe]); // Fetch only if `recipe` is not already stored

  const fetchSubstitute = async (ingredientName) => {
    // Check if substitutes exist in sessionStorage
    const cachedSubstitutes = sessionStorage.getItem(`substitutes-${ingredientName}`);
    if (cachedSubstitutes) {
      setSubstitutes(JSON.parse(cachedSubstitutes));
      setSubstituteIngredient(ingredientName);
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=${ingredientName}&apiKey=${API_KEY}`
      );
      const data = await response.json();
      if (data.substitutes) {
        setSubstitutes(data.substitutes);
        setSubstituteIngredient(ingredientName);
        setIsModalOpen(true);
        sessionStorage.setItem(`substitutes-${ingredientName}`, JSON.stringify(data.substitutes)); // Store substitutes in sessionStorage
      }
    } catch (error) {
      console.error("Error fetching ingredient substitutes:", error);
    }
  };

  if (isLoading) return <p>Loading recipe...</p>;
  if (!recipe) return <p>Recipe not found</p>;

  // Destructure recipe details
  const {
    title,
    image,
    summary,
    instructions,
    vegetarian,
    vegan,
    glutenFree,
    dairyFree,
    veryHealthy,
    cheap,
    veryPopular,
    sustainable,
    lowFodmap,
    weightWatcherSmartPoints,
    healthScore,
    pricePerServing,
    sourceName,
    sourceUrl,
    cuisines,
    dishTypes,
    diets,
    servings,
    readyInMinutes,
    extendedIngredients,
  } = recipe;

  return (
    <div>
      <h1>{title}</h1>
      <img src={image} alt={title} width="300px" />

      <p dangerouslySetInnerHTML={{ __html: summary }}></p>

      <h3>Recipe Details:</h3>
      <ul>
        <li>Vegetarian: {vegetarian ? "Yes" : "No"}</li>
        <li>Vegan: {vegan ? "Yes" : "No"}</li>
        <li>Gluten-Free: {glutenFree ? "Yes" : "No"}</li>
        <li>Dairy-Free: {dairyFree ? "Yes" : "No"}</li>
        <li>Very Healthy: {veryHealthy ? "Yes" : "No"}</li>
        <li>Cheap: {cheap ? "Yes" : "No"}</li>
        <li>Very Popular: {veryPopular ? "Yes" : "No"}</li>
        <li>Sustainable: {sustainable ? "Yes" : "No"}</li>
        <li>Low FODMAP: {lowFodmap ? "Yes" : "No"}</li>
        <li>Weight Watcher Smart Points: {weightWatcherSmartPoints}</li>
        <li>Health Score: {healthScore}</li>
        <li>Price per Serving: ${pricePerServing.toFixed(2)}</li>
        <li>
          Source:{" "}
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            {sourceName}
          </a>
        </li>
      </ul>

      <h3>Dish Types:</h3>
      <p>{dishTypes?.join(", ") || "Not specified"}</p>

      <h3>Cuisines:</h3>
      <p>{cuisines?.join(", ") || "Not specified"}</p>

      <h3>Diets:</h3>
      <p>{diets?.join(", ") || "Not specified"}</p>

      <h3>Servings:</h3>
      <p>{servings}</p>

      <h3>Ready in Minutes:</h3>
      <p>{readyInMinutes} minutes</p>

      <h3>Ingredients:</h3>
      <ul>
        {extendedIngredients.map((ingredient) => (
          <li key={ingredient.id}>
            <strong
              onClick={() =>
                fetchSubstitute(ingredient.nameClean || ingredient.name)
              }
              style={{ cursor: "pointer", color: "blue" }}
            >
              {ingredient.nameClean || ingredient.name}
            </strong>
            {" - "}
            {ingredient.amount} {ingredient.unit}
          </li>
        ))}
      </ul>

      <h3>Instructions:</h3>
      <div>
        {instructions
          .replace(/<ol>/g, "")
          .replace(/<\/ol>/g, "")
          .replace(/<\/li>/g, "<br />")
          .replace(/<li>/g, "")
          .split("<br />")
          .map((instruction, index) => (
            <p key={index}>{instruction}</p>
          ))}
      </div>

      {/* Modal to show substitutes */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Ingredient Substitutes"
        ariaHideApp={false}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            width: "300px",
          },
        }}
      >
        <h2>Substitutes for {substituteIngredient}</h2>
        <ul>
          {substitutes.length > 0 ? (
            substitutes.map((substitute, index) => (
              <li key={index}>{substitute}</li>
            ))
          ) : (
            <li>No substitutes found</li>
          )}
        </ul>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default RecipeDetail;
