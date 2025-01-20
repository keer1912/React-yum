import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Get the root element
const rootElement = document.getElementById('root');

// Create a root with the new API
const root = createRoot(rootElement);

// Render the App component
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
