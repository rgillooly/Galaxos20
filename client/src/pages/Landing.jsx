import React, { useState } from "react";
import LoginPage from "./Login";
import GameList from "./GameList";
import styles from "./styles.module.css"; // Adjusted for CSS Modules

function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("id_token")
  ); // Use 'jwt' for consistency

  const handleLogin = (token) => {
    localStorage.setItem("id_token", token); // Store the token under 'jwt'
    setIsLoggedIn(true);
    setErrorMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("id_token"); // Remove the token on logout
    setIsLoggedIn(false);
  };

  const openSignupWindow = () => {
    setIsSignupOpen(true);
  };

  const closeSignupWindow = () => {
    setIsSignupOpen(false);
  };

  return (
    <div className={styles.landingContainer}>
      {/* Conditional rendering based on login status */}
      {isLoggedIn ? (
        <>
          <h2>Welcome to the Game List</h2>
          <GameList />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <h2>Please log in to view the games</h2>
          <LoginPage onLogin={handleLogin} />
        </>
      )}
    </div>
  );
}

export default Landing;
