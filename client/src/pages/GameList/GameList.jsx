import React, { useState, useRef, useEffect } from "react";
import axios from "axios"; // Import Axios
import GameContainer from "../GameContainer/GameContainer";

const GameList = () => {
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [openGames, setOpenGames] = useState([]);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState(null);

  // Track the drag state for each game
  const [draggingGame, setDraggingGame] = useState(null);
  const [positions, setPositions] = useState({});
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRefs = useRef({});

  useEffect(() => {
    // Fetch games using Axios
    const fetchGames = async () => {
      setLoadingGames(true);
      try {
        const response = await axios.get("http://localhost:3001/api/games");
        setGames(response.data); // Assuming the API returns an array of games
        setLoadingGames(false);
      } catch (error) {
        setGamesError(error);
        setLoadingGames(false);
      }
    };
    fetchGames();
  }, []);

  const handleMouseDown = (e, gameId) => {
    setDraggingGame(gameId);
    const initialPosition = positions[gameId] || { top: 100, left: 100 };
    setOffset({
      x: e.clientX - initialPosition.left,
      y: e.clientY - initialPosition.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingGame) return;

    const newTop = e.clientY - offset.y;
    const newLeft = e.clientX - offset.x;

    setPositions((prevPositions) => ({
      ...prevPositions,
      [draggingGame]: { top: newTop, left: newLeft },
    }));
  };

  const handleMouseUp = () => {
    setDraggingGame(null);
  };

  useEffect(() => {
    if (draggingGame) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingGame]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Retrieve token from localStorage
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      console.error('Token not found');
      return; // Optionally show an error message to the user
    }

    try {
      const newGame = {
        name: gameName,
        description: gameDescription,
        userId: user._Id, // Replace with actual user ID (you might want to get it from state or context)
      };

      // Send the token in the Authorization header
      const response = await axios.post(
        "http://localhost:3001/api/games", 
        newGame, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
          }
        }
      );

      // Handle response
      setGames((prevGames) => [...prevGames, response.data.game]); // Assuming the response contains the game object
      setGameName("");
      setGameDescription("");
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const handleOpenGame = (game) => {
    setOpenGames((prev) => [...prev, game]);
    setPositions((prev) => ({
      ...prev,
      [game._id]: { top: 100, left: 100 },
    }));
  };

  const handleCloseGame = (game) => {
    setOpenGames((prev) => prev.filter((g) => g._id !== game._id));
  };

  if (loadingGames) return <p>Loading games...</p>;
  if (gamesError) return <p>Error fetching games: {gamesError.message}</p>;

  return (
    <div>
      <h2>Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <input
              type="text"
              value={gameDescription}
              onChange={(e) => setGameDescription(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Create Game</button>
      </form>

      <h2>Game List</h2>
      <ul>
        {games.length > 0 ? (
          games.map((game) => (
            <li key={game._id}>
              <button onClick={() => handleOpenGame(game)}>{game.name}</button>
            </li>
          ))
        ) : (
          <p>No games available.</p>
        )}
      </ul>

      {openGames.map((game) => (
        <div
          key={game._id}
          ref={(el) => (containerRefs.current[game._id] = el)}
          style={{
            position: "absolute",
            top: `${positions[game._id]?.top}px`,
            left: `${positions[game._id]?.left}px`,
            cursor: "move",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "8px",
          }}
          onMouseDown={(e) => handleMouseDown(e, game._id)}
        >
          <GameContainer
            initialGameName={game.name}
            onClose={() => handleCloseGame(game)}
            game={game}
          />
        </div>
      ))}
    </div>
  );
};

export default GameList;
