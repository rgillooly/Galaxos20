import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./GameContainer.css";

// Debounce function to avoid too frequent API calls
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

function GameContainer({ onClose, game = {}, onRename }) {
  const { _id: gameId = null, gameName = "", assetMenus: initialAssetMenus = [] } = game;

  const [windowTitle, setWindowTitle] = useState(gameName);
  const [assetMenus, setAssetMenus] = useState(initialAssetMenus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(gameName);

  const updateGameName = async (newName) => {
    if (newName === gameName) return;
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
      setWindowTitle(newName);
      onRename(newName);  // Update parent with new name
      setIsRenaming(false);
    } catch (error) {
      console.error("Error updating game name:", error.response?.data || error);
      setError("Failed to update game name.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the API update call
  const debouncedUpdateGameName = useCallback(debounce(updateGameName, 500), []);

  const handleRenameToggle = () => {
    setIsRenaming(!isRenaming);
    setNewName(windowTitle);
  };

  const handleNameChange = (e) => {
    const updatedName = e.target.value;
    setNewName(updatedName);
    debouncedUpdateGameName(updatedName);  // Use debounced function
  };

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
          const sortedMenus = response.data
            .map((menu, index) => ({ ...menu, order: menu.order ?? index }))
            .sort((a, b) => a.order - b.order); // Sort by order

          setAssetMenus(sortedMenus);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching asset menus:", error);
          setIsLoading(false);
        });
    }
  }, [gameId]);

  const handleCreateAssetMenu = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const position = {
        top: Math.random() * 400,
        left: Math.random() * 400,
      };

      const newMenuData = {
        title: "",  // Default empty title
        position,
        gameId,
        assets: [],
        order: assetMenus.length,
      };

      const response = await axios.post(
        `http://localhost:3001/api/assetMenus`,
        newMenuData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAssetMenus((prevMenus) => [...prevMenus, response.data.assetMenu]);
      setError(null);
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

  const handleTitleUpdate = async (menuId, newTitle) => {
    const trimmedTitle = newTitle.trim();

    // Check if the title is empty
    if (!trimmedTitle) {
      console.error("Title cannot be empty.");
      return; // Exit if title is empty
    }

    try {
      const response = await axios.put(
        `http://localhost:3001/api/assetMenus/${menuId}`,
        { title: trimmedTitle }, // Send the trimmed title
        { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.status === 200) {
        // Update the state with the new title from the response
        setAssetMenus((prevMenus) =>
          prevMenus.map((menu) =>
            menu._id === menuId ? { ...menu, title: response.data.title || trimmedTitle } : menu
          )
        );
      } else {
        console.error("Failed to update title:", response.data);
      }
    } catch (error) {
      console.error("Error updating title:", error.response?.data || error);
    }
  };

  // Handle drag-and-drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedMenus = Array.from(assetMenus);
    const [movedMenu] = reorderedMenus.splice(result.source.index, 1);
    reorderedMenus.splice(result.destination.index, 0, movedMenu);

    const updatedMenusWithOrder = reorderedMenus.map((menu, index) => ({
      ...menu,
      order: index,
    }));

    setAssetMenus(updatedMenusWithOrder);
    await saveOrderToBackend(updatedMenusWithOrder);
  };

  const saveOrderToBackend = async (orderedMenus) => {
    try {
      const token = localStorage.getItem("token");
      const orderedData = orderedMenus.map(menu => ({
        _id: menu._id, // Ensure you're passing the correct _id here
        order: menu.order,
      }));

      // Log the orderedData to ensure the correct structure
      console.log("Ordered Data:", orderedData);

      // Send the request to update the order, passing headers separately
      await axios.put(
        "http://localhost:3001/api/assetMenus/update-order",
        { orderedData },  // This is the data payload
        { headers: { Authorization: `Bearer ${token}` } }  // This is the configuration for headers
      );

      console.log("Order updated successfully.");
    } catch (error) {
      console.error("Error updating asset menu order:", error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-name-container">
        {isRenaming ? (
          <div>
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
              autoFocus
              onBlur={() => setIsRenaming(false)}
            />
          </div>
        ) : (
          <h1 onClick={handleRenameToggle}>{windowTitle}</h1>
        )}
        <button onClick={handleCreateAssetMenu} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Asset Menu"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

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
                          key={menu._id}
                          id={menu._id}
                          title={menu.title || "Untitled"} // Ensure title is being displayed here, not _id
                          assets={menu.assets}
                          onClose={() => handleCloseAssetMenu(menu._id)}
                          onTitleUpdate={(newTitle) => handleTitleUpdate(menu._id, newTitle)}
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
  onRename: PropTypes.func,
};

export default GameContainer;
