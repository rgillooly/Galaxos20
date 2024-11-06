import React, { useState } from "react";
import PropTypes from "prop-types";
import "./GameContainer.css"; // Optional: Add your styles here

function GameContainer({ game, onClose, onOpenAssetMenu }) {
  const [isMinimized, setIsMinimized] = useState(false); // Track minimization state

  if (!game) return null; // If no game is selected, render nothing

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h3>{game.name}</h3>
        <button onClick={onClose} aria-label="Close game container">
          Close
        </button>
      </header>
      {!isMinimized && ( // Only render game content if not minimized
        <div className="game-content">
          <p>{game.description}</p>
          <button
            onClick={() => onOpenAssetMenu(game.name)}
            aria-label="Add asset menu"
          >
            Add Asset Menu
          </button>
        </div>
      )}
    </div>
  );
}

GameContainer.propTypes = {
  game: PropTypes.object, // Pass the selected game object
  onClose: PropTypes.func.isRequired, // Function to handle closing the container
  onOpenAssetMenu: PropTypes.func.isRequired,
};

export default GameContainer;
