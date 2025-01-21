import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ username }) => {
  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem("token");
    // Redirect to the login page
    window.location.href = "/login";
  };

  return (
    <nav className="relative p-4 flex justify-between items-center">
      <div className="text-black text-lg font-semibold font-roboto-mono">
        <Link to="/">react-yum</Link>
      </div>
      <div className="text-black text-lg font-roboto-mono flex items-center">
        <Link to="/myrecipes" className="mr-4">{username}</Link>
      </div>
      <button 
        onClick={handleLogout} 
        className="absolute bottom-4 left-4 text-black"
      >
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
    </nav>
  );
};

export default Navbar;