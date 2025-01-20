import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Homepage from "./components/Homepage";
import RecipeDetail from "./components/RecipeDetail"; // Import Recipe Detail Component
import MyRecipes from "./components/MyRecipes"; // Import MyRecipes Component
import './index.css';
import { useState, useEffect } from 'react'; 
import { jwtDecode } from 'jwt-decode'; 
function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/myrecipes" element={<MyRecipes userId={userId} />} />
      </Routes>
    </Router>
  );
}

export default App;
