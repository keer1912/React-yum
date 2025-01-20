import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  name: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    ingredients: [ingredientSchema],
    instructions: [{ type: String, required: true }],
    image: { 
      type: String, 
      required: false 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    origin: { 
      type: Number, 
      required: true 
    }, 
  },
  { timestamps: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;