import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipe.js'; 
import listEndpoints from 'express-list-endpoints';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // This means all routes in authRoutes will be prefixed with /api/auth
app.use('/api/recipes', recipeRoutes); // Ensure this line is present

// Serve static files from the React app
const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, 'client/build')));

// Serve static files from the root dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const endpoints = listEndpoints(app);
console.log(endpoints);

console.log('Current directory:', __dirname);
console.log('Serving from:', path.join(__dirname, 'dist'));

app.use(express.static(path.join(__dirname, 'dist')));