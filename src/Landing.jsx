// Landing.js
import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import GameList from "./GameList"; // Import the GameList component
import "./styles.module.css";

function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const openSignupWindow = () => {
    setIsSignupOpen(true);
  };

  const closeSignupWindow = () => {
    setIsSignupOpen(false);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div id="logout-container">
          <button
            id="logout-button"
            className="button-auth"
            onClick={handleLogout}
          >
            Logout
          </button>

          {/* Render the GameList component when logged in */}
          <GameList />
        </div>
      )}

      <button className="button-signup" onClick={openSignupWindow}>
        Sign Up
      </button>

      {isSignupOpen && <Signup onClose={closeSignupWindow} />}
    </div>
  );
}

export default Landing;
