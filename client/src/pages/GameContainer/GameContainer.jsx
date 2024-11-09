import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./GameContainer.css";

function GameContainer({ initialGameName = "Untitled Game", onClose, game = {} }) {
  const { _id: gameId = null, name = "", assetMenus: initialAssetMenus = [] } = game;

  const [windowTitle, setWindowTitle] = useState(initialGameName || name);
  const [assetMenus, setAssetMenus] = useState(initialAssetMenus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (name) setWindowTitle(name);
  }, [name]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch asset menus directly by `gameId`
  useEffect(() => {
    if (game && game._id) {
      setIsLoading(true);
      axios
        .get(`http://localhost:3001/api/assetMenus?gameId=${game._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          console.log("Fetched Asset Menus:", response.data); // Log response
          setAssetMenus(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching asset menus:", error);
          setIsLoading(false);
        });
    }
  }, [game]); // Run effect every time the game prop changes

  const updateGameName = async (newName) => {
    if (newName === name) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/games/${gameId}`,
        { name: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Game name updated successfully!");
    } catch (error) {
      console.error("Error updating game name:", error.response?.data || error);
      setError("Failed to update game name.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedUpdateGameName = debounce(updateGameName, 500);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setWindowTitle(newName);
    debouncedUpdateGameName(newName);
  };

  const handleCreateAssetMenu = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      setError("Authentication token is missing.");
      return;
    }

    setIsLoading(true);
    try {
      const position = {
        top: Math.random() * 400, // Random top position
        left: Math.random() * 400, // Random left position
      };

      const response = await axios.post(
        `http://localhost:3001/api/assetMenus`, // Directly creating an asset menu
        {
          title: "New Asset Menu",
          position,
          gameId, // Attach the current game's ID
          assets: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Asset Menu Created:", response.data);
      setAssetMenus((prevMenus) => [...prevMenus, response.data]); // Add the new menu to the state
      setError(null); // Clear any previous error
    } catch (error) {
      console.error("Error creating asset menu:", error.response?.data || error);
      setError("Failed to create asset menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAssetMenu = (menuId) => {
    setAssetMenus((prevMenus) => prevMenus.filter((menu) => menu._id !== menuId));
  };

  // Handle reordering of asset menus on drag end
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedMenus = Array.from(assetMenus);
    const [movedMenu] = reorderedMenus.splice(result.source.index, 1);
    reorderedMenus.splice(result.destination.index, 0, movedMenu);

    setAssetMenus(reorderedMenus); // Update state with reordered menus
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <input
          type="text"
          value={windowTitle}
          onChange={handleNameChange}
          placeholder="Game Name"
          disabled={isLoading}
        />
        <button onClick={onClose} disabled={isLoading}>
          Close
        </button>
      </header>
      <button onClick={handleCreateAssetMenu} disabled={isLoading || !game || !game._id}>
        {isLoading ? "Creating..." : "Create Asset Menu"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isLoading ? (
        <p>Loading asset menus...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="assetMenuGrid" direction="horizontal">
            {(provided) => (
              <div
                className="asset-menu-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {assetMenus.map((menu, index) => (
                  <Draggable key={menu._id} draggableId={menu._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="asset-menu-grid-item"
                      >
                        <AssetMenu
                          title={menu.title}
                          assets={menu.assets}
                          onClose={() => handleCloseAssetMenu(menu._id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

GameContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  game: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    assetMenus: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        assets: PropTypes.arrayOf(PropTypes.object),
      })
    ),
  }),
};

export default GameContainer;
