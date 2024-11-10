import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./GameContainer.css";

function GameContainer({ onClose, game = {} }) {
  const { _id: gameId = null, gameName = "", assetMenus: initialAssetMenus = [] } = game;

  const [windowTitle, setWindowTitle] = useState(gameName); // Initialize title from gameName passed from GameList
  const [assetMenus, setAssetMenus] = useState(initialAssetMenus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false); // State to toggle renaming mode
  const [newName, setNewName] = useState(gameName); // Local state for new name input

  // Debounce function to avoid too frequent API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch asset menus for the game on initial load
  useEffect(() => {
    if (gameId) {
      setIsLoading(true);
      axios
        .get(`http://localhost:3001/api/assetMenus?gameId=${gameId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setAssetMenus(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching asset menus:", error);
          setIsLoading(false);
        });
    }
  }, [gameId]);

  const updateGameName = async (newName) => {
    if (newName === gameName) return;  // Avoid unnecessary updates if the name is unchanged
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/games/${gameId}`,
        { gameName: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Game name updated successfully!");
      setIsRenaming(false); // Exit renaming mode after successful update
      setWindowTitle(newName); // Update the window title immediately
    } catch (error) {
      console.error("Error updating game name:", error.response?.data || error);
      setError("Failed to update game name.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedUpdateGameName = debounce(updateGameName, 500);

  const handleNameChange = (e) => {
    setNewName(e.target.value); // Update the new name locally
  };

  const handleRenameButtonClick = () => {
    setIsRenaming(true); // Toggle to renaming mode
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== windowTitle) {
      updateGameName(newName); // Direct call without debounce
    }
  };  

  const handleCancelRename = () => {
    setIsRenaming(false); // Cancel renaming mode
    setNewName(gameName); // Reset to original name if cancelled
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
        `http://localhost:3001/api/assetMenus`,
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

    // Handle the title update in the parent component
    const handleTitleUpdate = async (_id, newTitle) => {
      try {
        const response = await fetch(`/api/asset-menus/${_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newTitle }), // Send the updated title
        });
  
        if (response.ok) {
          const updatedMenu = await response.json();
          // Update the title in the state to reflect the changes
          setAssetMenus((prevMenus) =>
            prevMenus.map((menu) =>
              menu.id === _id ? { ...menu, title: updatedMenu.assetMenu.title } : menu
            )
          );
          console.log("Title updated successfully");
        } else {
          console.error("Failed to update title");
        }
      } catch (error) {
        console.error("Error updating title:", error);
      }
    };

  return (
    <div className="game-container">
      <div className="game-name-container">
        <h1>{windowTitle}</h1>

        {/* Rename Button */}
        {!isRenaming && (
          <button onClick={handleRenameButtonClick} disabled={isLoading}>
            Rename
          </button>
        )}

        {/* Editable Name Input */}
        {isRenaming && (
          <div>
            <input
              type="text"
              value={newName} // The new name being entered
              onChange={handleNameChange} // Update the name locally
              disabled={isLoading}
            />
            <button onClick={handleRenameSubmit} disabled={isLoading}>
              Submit
            </button>
            <button onClick={handleCancelRename} disabled={isLoading}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Create Asset Menu Button */}
      <button onClick={handleCreateAssetMenu} disabled={isLoading || !gameId}>
        {isLoading ? "Creating..." : "Create Asset Menu"}
      </button>

      {/* Error Display */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Loading State for Asset Menus */}
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
                          onTitleUpdate={handleTitleUpdate}
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
    gameName: PropTypes.string,
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
