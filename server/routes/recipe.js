import express from 'express';
import cors from 'cors';  // Import the CORS package
import Recipe from '../models/Recipe.js';
import { OpenAI } from 'openai'; // Correct the import
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const router = express.Router();

router.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure the API key is correctly loaded
});

// Generate recipe using OpenAI
router.post('/generate', async (req, res) => {
  try {
    const { ingredients, cuisines = [], diets = [] } = req.body;
    
    // Log the received data
    console.log('Received request body:', req.body);
    console.log('Extracted cuisines:', cuisines);
    console.log('Extracted diets:', diets);
    
    if (!ingredients) {
      return res.status(400).json({ message: 'Ingredients are required' });
    }

    // Construct the prompt with dynamic cuisines and diets
    let prompt = `Create a recipe using these ingredients: ${ingredients}.`;

    if (cuisines.length > 0) {
      prompt += ` The recipe MUST be a ${cuisines.join(' or ')} dish. You MUST create a recipe that is authentically ${cuisines.join(' or ')}. Do not generate recipes from other cuisines or fusion dishes.`;
    }
    
    if (diets.length > 0) {
      prompt += ` The recipe MUST be suitable for ${diets.join(' and ')} diets.`;
    }

    prompt += ` Format the response as follows:
    Title:
    Ingredients:
    - ingredient 1
    - ingredient 2
    Instructions:
    1. Step one
    2. Step two

    Remember: This MUST be an authentic ${cuisines.join(' or ')} recipe. Do not suggest dishes from other cuisines.`;

    // Log the complete prompt
    console.log('Complete prompt being sent to OpenAI:', prompt);

    // Send the prompt to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ 
        role: "user", 
        content: prompt
      }],
    });

    // Log the AI's complete response
    console.log('AI Response:', response.choices[0].message.content);

    const recipeText = response.choices[0].message.content;
    const parsedRecipe = parseRecipeText(recipeText);
    
    // Log the final parsed recipe
    console.log('Parsed recipe:', parsedRecipe);

    res.json(parsedRecipe);
  } catch (err) {
    console.error('Error generating recipe:', err);
    res.status(500).json({ message: 'Error generating recipe' });
  }
});


// Helper function to parse AI esponse
function parseRecipeText(text) {
  const sections = text.split('\n');
  let title = '';
  const ingredients = [];
  const instructions = [];
  let currentSection = '';

  for (const line of sections) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.toLowerCase().startsWith('title:')) {
      title = trimmedLine.replace('Title:', '').trim();
      continue;
    }
    
    if (trimmedLine.toLowerCase().startsWith('ingredients:')) {
      currentSection = 'ingredients';
      continue;
    }
    
    if (trimmedLine.toLowerCase().startsWith('instructions:')) {
      currentSection = 'instructions';
      continue;
    }
    
    if (trimmedLine && trimmedLine !== '') {
      if (currentSection === 'ingredients') {
        const ingredient = trimmedLine.replace(/^-\s*/, '').trim();
        if (ingredient) ingredients.push(ingredient);
      } else if (currentSection === 'instructions') {
        const instruction = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (instruction) instructions.push(instruction);
      }
    }
  }

  return { title, ingredients, instructions };
}

// Get recipes by user ID
router.get('/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new recipe
router.post('/', async (req, res) => {
  const { userId, title, ingredients, instructions, image,origin } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const recipe = new Recipe({
    userId,
    title,
    ingredients,
    instructions,
    image,
    origin
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error("Error saving recipe:", err);
    res.status(400).json({ message: err.message });
  }
});

// Update a recipe
router.put('/:recipeId', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.recipeId, userId: req.body.userId },
      {
        $set: {
          title: req.body.title,
          ingredients: req.body.ingredients,
          instructions: req.body.instructions,
          image: req.body.image,
        },
      },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a recipe
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ 
      _id: req.params.recipeId, 
      userId: req.body.userId 
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
