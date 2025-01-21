import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Password validation (basic example)
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await fetch("https://react-yum.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.missing) {
          if (data.missing.email) setEmailError("Email is required.");
          if (data.missing.password) setPasswordError("Password is required.");
        } else {
          throw new Error(data.message || 'Login failed');
        }
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-1/3 items-center justify-center font-roboto-mono">
        <h1 className="text-4xl font-bold text-gray-800">AI-Powered Recipes, Zero Clutter. Just Great Food Organised.</h1>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-24">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6 font-roboto-mono">Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-600 font-roboto-mono" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`font-space-mono w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-gray-600 font-roboto-mono" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className={`font-space-mono w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <button
            type="submit"
            className= "font-roboto-mono w-full py-2 bg-[#fabd00] text-black font-semibold rounded-md hover:bg-[#D9A500]"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 font-roboto-mono">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
