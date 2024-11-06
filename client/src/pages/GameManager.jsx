import React, { useState } from "react";
import GameContainer from "./GameContainer"; // Import the GameContainer component

function GameManager() {
  const [games, setGames] = useState([]); // Store game containers

  const addGame = () => {
    const gameName = prompt("Enter game name:");
    if (gameName) {
      setGames((prev) => [
        ...prev,
        { id: Date.now(), name: gameName, assetMenus: [] },
      ]);
    }
  };

  const closeGame = (id) => {
    setGames((prev) => prev.filter((game) => game.id !== id));
  };

  const addAssetMenuToGame = (gameId) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              assetMenus: [
                ...game.assetMenus,
                {
                  id: Date.now(),
                  title: `Assets for ${game.name}`,
                  position: { top: 100, left: 100 },
                },
              ],
            }
          : game
      )
    );
  };

  const closeAssetMenu = (gameId, menuId) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              assetMenus: game.assetMenus.filter((menu) => menu.id !== menuId),
            }
          : game
      )
    );
  };

  const updateAssetMenuPosition = (gameId, menuId, newPosition) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              assetMenus: game.assetMenus.map((menu) =>
                menu.id === menuId ? { ...menu, position: newPosition } : menu
              ),
            }
          : game
      )
    );
  };

  return (
    <div>
      <h1>Game Manager</h1>
      <button onClick={addGame}>Add Game</button>
      {games.map((game) => (
        <GameContainer
          key={game.id}
          game={game}
          onClose={() => closeGame(game.id)}
          addAssetMenu={() => addAssetMenuToGame(game.id)}
          closeAssetMenu={closeAssetMenu}
          updateAssetMenuPosition={updateAssetMenuPosition}
        />
      ))}
    </div>
  );
}

export default GameManager;
