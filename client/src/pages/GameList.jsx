import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_GAMES } from "../utils/queries";
import GameContainer from "./GameContainer";
import { CREATE_GAME } from "../utils/mutations"; // Import CREATE_GAME mutation
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const GameList = () => {
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [openGames, setOpenGames] = useState([]);
  const {
    loading: loadingGames,
    error: gamesError,
    data,
  } = useQuery(GET_GAMES);
  const [createGame] = useMutation(CREATE_GAME);

  // Track the drag state for each game
  const [draggingGame, setDraggingGame] = useState(null);
  const [positions, setPositions] = useState({}); // Track each game's position
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Ref to track GameContainer positions
  const containerRefs = useRef({});

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

  // Attach global listeners for dragging
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
    try {
      const id = uuidv4(); // Generate a unique id as expected by the backend
  
      // Call the mutation and update the cache
      await createGame({
        variables: {
          id, // Pass the generated id instead of _id
          input: {
            name: gameName,
            description: gameDescription,
          },
        },
        update(cache, { data: { createGame } }) {
          // Update the GET_GAMES query cache with the new game
          const { getGames } = cache.readQuery({ query: GET_GAMES });
          cache.writeQuery({
            query: GET_GAMES,
            data: {
              getGames: [...getGames, createGame], // Add the newly created game to the cache
            },
          });
        },
      });
  
      setGameName(""); // Clear input
      setGameDescription(""); // Clear input
    } catch (e) {
      console.error("Error creating game:", e);
    }
  };    
      
  const handleOpenGame = (game) => {
    setOpenGames((prev) => [...prev, game]);
    setPositions((prev) => ({
      ...prev,
      [game.id]: { top: 100, left: 100 }, // Default position for new game container
    }));
  };

  const handleCloseGame = (game) => {
    setOpenGames((prev) => prev.filter((g) => g.id !== game.id));
  };

  if (loadingGames) return <p>Loading games...</p>;
  if (gamesError) return <p>Error fetching games: {gamesError.message}</p>;

  const games = data.getGames || [];

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
            <li key={game.id}>
              <button onClick={() => handleOpenGame(game)}>{game.name}</button>
            </li>
          ))
        ) : (
          <p>No games available.</p>
        )}
      </ul>

      {openGames.map((game) => (
        <div
          key={game.id}
          ref={(el) => (containerRefs.current[game.id] = el)}
          style={{
            position: "absolute",
            top: `${positions[game.id]?.top}px`,
            left: `${positions[game.id]?.left}px`,
            cursor: "move",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "8px",
          }}
          onMouseDown={(e) => handleMouseDown(e, game.id)}
        >
          <GameContainer
            initialGameName={game.name}
            onClose={() => handleCloseGame(game)}
            game={game} // Pass the game object with assetMenus
          />
        </div>
      ))}
    </div>
  );
};

export default GameList;
