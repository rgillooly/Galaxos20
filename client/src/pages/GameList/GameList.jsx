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
    return new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        try {
          resolve(func(...args)); // Resolve after function execution
        } catch (error) {
          reject(error); // Reject if an error occurs
        }
      }, delay);
    });
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

  // Fetch user games on component mount
  useEffect(() => {
    const fetchUserGames = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your games.");
        return;
      }

      try {
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

  // Update game description in the backend
  const updateGameDescriptionInDB = async (gameId, newDescription) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3001/api/games/${gameId}/description`,
        { description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return response.data.game; // Return updated game
      } else {
        throw new Error("Failed to update description in the database.");
      }
    } catch (error) {
      console.error("Error updating game description:", error);
      setError("Failed to update game description.");
      return null;
    }
  };

  const debouncedUpdateGameDescription = debounce(
    async (gameId, newDescription) => {
      if (newDescription === selectedGame?.gameDescription) return; // Don't update if there's no change
      return updateGameDescriptionInDB(gameId, newDescription);
    },
    500
  );

  const handleDescriptionChange = async (e) => {
    const newDescription = e.target.value;

    // Update state
    setGameDescription(newDescription);

    // If editing a selected game, update the game's description
    if (selectedGame) {
      setSelectedGame((prev) => ({
        ...prev,
        gameDescription: newDescription,
      }));

      setGames((prevGames) =>
        prevGames.map((game) =>
          game._id === selectedGame._id
            ? { ...game, gameDescription: newDescription }
            : game
        )
      );

      // Use debounced function to update the backend asynchronously
      await debouncedUpdateGameDescription(selectedGame._id, newDescription);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create a game.");
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
            onChange={handleDescriptionChange}
            required
            disabled={gameLoading}
          />
        </div>
        <button type="submit" disabled={gameLoading}>
          {gameLoading ? "Creating..." : "Create Game"}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      <h3>Your Games</h3>
      <ul>
        {games.length > 0 ? (
          games.map((game) => (
            <li key={game._id}>
              <strong>{game.gameName}</strong>: {game.gameDescription}
              <button
                onClick={() => setSelectedGame(game)}
                disabled={selectedGame && selectedGame._id === game._id}
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
            key={selectedGame._id}
            game={selectedGame}
            onRename={(newName) => handleRename(selectedGame._id, newName)}
            onClose={() => setSelectedGame(null)}
            description={selectedGame.gameDescription}
            onDescriptionChange={(newDesc) =>
              handleDescriptionChange({ target: { value: newDesc } })
            }
          />
        </MovableWindow>
      )}
      <Link to="/logout">Logout</Link>
    </div>
  );
};

export default GameList;
