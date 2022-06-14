import { Outlet, Link } from "react-router-dom";
import React from "react"


const Layout = () => {
  return (
    <ul className="navbar-nav me-auto">
      <li className="nav-item">   
        <Link to="/" className="nav-link">Home</Link>
        </li>
      <li className="nav-item">
        <Link to="/About" className="nav-link">About</Link>
        </li>
      <li className="nav-item">
        <Link to="/Game" className="nav-link">Game</Link>
      </li>
      <li className="nav-item">
        <Link to="/Market" className="nav-link">Market</Link>
      </li>
      <li className="nav-item">
        <Link to="/Settings" className="nav-link">Settings</Link>
      </li>
      </ul>
    
  );
};

export default Layout;