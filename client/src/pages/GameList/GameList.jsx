import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { Link } from "react-router-dom";
import GameContainer from "../GameContainer/GameContainer";
import MovableWindow from "../MovableWindow/MovableWindow";

// Utility function for debouncing
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const GameList = () => {
  const { user } = useUser();
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [error, setError] = useState("");
  const [gameLoading, setLoading] = useState(false);

  // Consolidated fetch user games on component mount
  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token not found");
          return;
        }

        const response = await axios.get(
          "http://localhost:3001/api/games/user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setGames(response.data.games);
        } else {
          setError(response.data.message || "Failed to load games.");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setError(
          error.response?.data?.message ||
          "An error occurred while fetching games."
        );
      }
    };

    fetchUserGames();
  }, []);

  // API call to update game name
  const updateGameNameInDB = async (gameId, newName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3001/api/games/${gameId}`,
        { gameName: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        console.log("Game name updated in the database!");
        return response.data.game;
      } else {
        throw new Error("Failed to update game name in the database");
      }
    } catch (error) {
      console.error("Error updating game name:", error);
      setError("Failed to update game name.");
    }
  };

  const debouncedUpdateGameName = debounce(updateGameNameInDB, 500);

  // Handle renaming a game and update the state immediately
  const handleRename = (gameId, newName) => {
    // Update state instantly for user feedback
    setGames((prevGames) =>
      prevGames.map((game) =>
        game._id === gameId ? { ...game, gameName: newName } : game
      )
    );
    if (selectedGame && selectedGame._id === gameId) {
      setSelectedGame((prevSelectedGame) => ({
        ...prevSelectedGame,
        gameName: newName,
      }));
    }

    // Update the name in the database after debouncing
    debouncedUpdateGameName(gameId, newName);
  };

  // Handle form submission to create a new game
  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    if (!gameName || !gameDescription) {
      setError("Both game name and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newGame = { gameName, gameDescription, user: user._id };

      const response = await axios.post(
        "http://localhost:3001/api/games",
        newGame,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Game created successfully!");
        setGameName("");
        setGameDescription("");
        setGames((prevGames) => [...prevGames, response.data.game]);
      } else {
        setError(response.data.message || "Failed to create game.");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      setError(
        error.response?.data?.message ||
        "An error occurred while creating the game."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Game Name:</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
            disabled={gameLoading}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={gameDescription}
            onChange={(e) => setGameDescription(e.target.value)}
            required
            disabled={gameLoading}
          />
        </div>
        <button type="submit" disabled={gameLoading}>
          {gameLoading ? "Creating..." : "Create Game"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Your Games</h3>
      <ul>
        {games.length > 0 ? (
          games.map((game) => (
            <li key={game._id || game.id}>
              <strong>{game.gameName}</strong>: {game.gameDescription}
              <button
                onClick={() => setSelectedGame(game)}
                disabled={selectedGame && selectedGame._id === game._id} // Disable button for selected game
              >
                Open
              </button>
            </li>
          ))
        ) : (
          <p>No games created yet.</p>
        )}
      </ul>

      {selectedGame && selectedGame._id && (
        <MovableWindow
          title={selectedGame.gameName}
          onClose={() => setSelectedGame(null)}
        >
          <GameContainer
            key={selectedGame._id} // Updated here to avoid missing props reference
            game={selectedGame}
            onRename={(newName) => handleRename(selectedGame._id, newName)}
            onClose={() => console.log("Closing GameContainer")}
          />
        </MovableWindow>
      )}

      <Link to="/logout">Logout</Link>
    </div>
  );
};

export default GameList;
