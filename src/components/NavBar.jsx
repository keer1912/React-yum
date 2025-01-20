import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ username }) => {
  return (
    <nav className=" p-4 flex justify-between items-center">
      <div className="text-black text-lg font-semibold font-roboto-mono">
        <Link to="/">react-yum</Link>
      </div>
      <div className="text-black text-lg font-roboto-mono">
        <Link to="/myrecipes">{username}</Link>
      </div>
    </nav>
  );
};

export default Navbar;
