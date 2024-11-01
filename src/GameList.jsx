// GameList.js
import React, { useState } from "react";
import GameContainer from "./GameContainer"; // Import your GameContainer component
import "./GameList.css"; // Optional: Add your styles here

function GameList() {
  const [gameContainers, setGameContainers] = useState([]); // To track created game containers

  const createGameContainer = () => {
    const newGameName = `Game ${gameContainers.length + 1}`; // Generate a default name
    setGameContainers([
      ...gameContainers,
      { name: newGameName, id: Date.now() },
    ]); // Add new game with the default name
  };

  const renameGameContainer = (id, newName) => {
    setGameContainers(
      gameContainers.map((game) =>
        game.id === id ? { ...game, name: newName } : game
      )
    );
  };

  const closeGameContainer = (id) => {
    setGameContainers(gameContainers.filter((game) => game.id !== id)); // Remove game container by id
  };

  return (
    <div className="game-list" style={{ position: "relative" }}>
      <h2>Game List</h2>
      <button onClick={createGameContainer} className="create-game-button">
        Create Game
      </button>
      <ul>
        {gameContainers.map((game) => (
          <li key={game.id}>
            <GameContainer
              initialGameName={game.name}
              onClose={() => closeGameContainer(game.id)} // Pass the id to close the specific game container
              onRename={(newName) => renameGameContainer(game.id, newName)} // Pass the id and new name for renaming
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GameList;
