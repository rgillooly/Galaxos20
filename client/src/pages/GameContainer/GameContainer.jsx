import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SnapGrid from "../SnapGrid/SnapGrid";
import { useDispatch, useSelector } from "react-redux";
import { addGrid, updateItem, createAssetMenu } from "../reducers"; // Ensure correct import
import "./GameContainer.css";

// Utility function for debouncing
const useDebounce = (func, delay) => {
  const timer = useRef(null);
  return (...args) =>
    new Promise((resolve, reject) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
};

function GameContainer({ onClose, game = {}, onRename, onDescriptionChange }) {
  const { _id: gameId = null, gameName = "", gameDescription = "" } = game;

  const [windowTitle, setWindowTitle] = useState(gameName);
  const [gameDescriptionState, setGameDescriptionState] = useState(gameDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isRenamingName, setIsRenamingName] = useState(false);
  const [isRenamingDescription, setIsRenamingDescription] = useState(false);

  const [newName, setNewName] = useState(gameName);
  const [newDescription, setNewDescription] = useState(gameDescription);

  // Redux state and dispatch
  const assetMenus = useSelector((state) => state.main.assetMenus); // Correct field name
  const grids = useSelector((state) => state.main.grids);
  const dispatch = useDispatch();

  useEffect(() => {
    if (gameId) {
      setIsLoading(true);
      axios
        .get(`http://localhost:3001/api/grids?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          dispatch(updateItem({ type: "grids", items: response.data }));
        })
        .catch((error) => {
          console.error("Failed to fetch grids.", error);
          setError("Failed to fetch grids.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [gameId, dispatch]);    

  const debouncedUpdateGameName = useDebounce(async (name) => {
    if (name === gameName) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/games/${gameId}`,
        { gameName: name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWindowTitle(name);
      onRename(name);
    } catch (error) {
      setError("Failed to update game name.");
    }
  }, 500);

  const debouncedUpdateGameDescription = useDebounce(async (description) => {
    if (description === gameDescriptionState) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/games/${gameId}`,
        { gameDescription: description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGameDescriptionState(description);
      onDescriptionChange(description);
    } catch (error) {
      setError("Failed to update game description.");
    }
  }, 500);

  const handleDragEndAssetMenu = async (result) => {
    const { destination, source } = result;
  
    if (!destination || destination.index === source.index) return;
  
    const previousState = [...assetMenus];
    const reorderedMenus = [...assetMenus];
    const [movedMenu] = reorderedMenus.splice(source.index, 1);
    reorderedMenus.splice(destination.index, 0, movedMenu);
  
    const updatedMenusWithOrder = reorderedMenus.map((menu, index) => ({
      _id: menu._id,
      order: index,
    }));
  
    dispatch(updateItem({ type: "assetMenus", items: reorderedMenus }));
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authorization token is missing.");
      return;
    }
  
    try {
      await axios.put(
        `http://localhost:3001/api/assetMenus/update-order`,
        { orderedData: updatedMenusWithOrder },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedMenus = await axios.get(
        `http://localhost:3001/api/assetMenus?gameId=${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateItem({ type: "assetMenus", items: updatedMenus.data }));
    } catch (error) {
      console.error("Error saving asset menu order:", error);
      dispatch(updateItem({ type: "assetMenus", items: previousState }));
    }
  };

  const handleCreateAssetMenu = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const position = { top: Math.random() * 400, left: Math.random() * 400 };
      const newMenu = {
        title: "",
        position,
        gameId,
        assets: [],
        order: assetMenus.length,
      };

      const response = await axios.post(
        `http://localhost:3001/api/assetMenus`,
        newMenu,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newAssetMenu = response.data.assetMenu;

      if (newAssetMenu && newAssetMenu._id) {
        dispatch(createAssetMenu(newAssetMenu));
      } else {
        console.error("Asset menu creation failed: No _id received.");
      }
    } catch {
      setError("Failed to create asset menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const handleEditTitleClick = () => setIsEditingTitle(true);
  const handleTitleChange = (e) => setWindowTitle(e.target.value);
  const handleTitleSave = () => {
    setIsEditingTitle(false);
    debouncedUpdateGameName(windowTitle);
  };

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const handleEditDescriptionClick = () => setIsEditingDescription(true);
  const handleDescriptionChange = (e) => setNewDescription(e.target.value);
  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    debouncedUpdateGameDescription(newDescription);
  };

  const handleAddGrid = async () => {
    try {
      const token = localStorage.getItem("token");
      const newGrid = {
        gameId, // Ensure this is set correctly
        rows: 5, // Grid row count
        columns: 5, // Grid column count
        cellSize: 100, // Cell size
      };
  
      console.log("Sending grid data to backend:", newGrid);
  
      const response = await axios.post(
        `http://localhost:3001/api/grids`,
        newGrid,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Received response:", response);
  
      // Assuming the response contains the new grid object
      const createdGrid = response.data.grid;
  
      // Update Redux state with the newly created grid
      if (createdGrid) {
        dispatch(addGrid(createdGrid)); // Ensure the addGrid action updates the Redux store
      } else {
        setError("Failed to create grid. No grid received.");
      }
  
      // Fetch the updated list of grids to ensure the UI is in sync
      const gridsResponse = await axios.get(
        `http://localhost:3001/api/grids?gameId=${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateItem({ type: "grids", items: gridsResponse.data }));
  
    } catch (error) {
      console.error("Error adding grid:", error);
      setError("Error adding grid.");
    }
  };

  const handleDragEndGrid = (result) => {
    const { destination, source } = result;
  
    // If dropped outside the list, do nothing
    if (!destination) {
      return;
    }
  
    // If the item has not moved, do nothing
    if (destination.index === source.index) {
      return;
    }
  
    // Reorder the grids
    const updatedGrids = Array.from(grids);
    const [removed] = updatedGrids.splice(source.index, 1);
    updatedGrids.splice(destination.index, 0, removed);
  
    // Dispatch action to update the grids in the state
    dispatch(updateItem({ type: "grids", items: updatedGrids }));
  };  
    
    return (
    <div className="game-container">
      {/* Editable Title */}
      <header>
        {isEditingTitle ? (
          <input
            type="text"
            value={windowTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            autoFocus
          />
        ) : (
          <h1 onClick={handleEditTitleClick}>{windowTitle}</h1>
        )}
                <button
          onClick={() => setIsEditingTitle((prev) => !prev)}
          aria-label={isEditingTitle ? "Save Description" : "Edit Description"}
        >
          {isEditingTitle ? "Save" : "Edit"}
        </button>
      </header>

      {/* Editable Description */}
      <section className="game-description">
        {isEditingDescription ? (
          <input
            type="text"
            value={newDescription}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionSave}
            autoFocus
          />
        ) : (
          <p onClick={handleEditDescriptionClick}>{gameDescriptionState}</p>
        )}
        <button
          onClick={() => setIsEditingDescription((prev) => !prev)}
          aria-label={isEditingDescription ? "Save Description" : "Edit Description"}
        >
          {isEditingDescription ? "Save" : "Edit"}
        </button>
      </section>

      <section className="asset-menus">
  <button onClick={handleCreateAssetMenu} aria-label="Add Asset Menu">
    Add Asset Menu
  </button>
  <DragDropContext onDragEnd={handleDragEndAssetMenu}>
    <Droppable droppableId="droppable" direction="horizontal">
      {(provided) => (
        <div
          className="asset-menus-list"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {assetMenus.length > 0 ? (
            assetMenus.map((menu, index) => (
              <Draggable key={menu._id} draggableId={menu._id} index={index}>
                {(provided) => (
                  <div
                    className="asset-menu-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <AssetMenu {...menu} />
                  </div>
                )}
              </Draggable>
            ))
          ) : (
            <p>No asset menus available</p>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
  <button onClick={handleAddGrid} aria-label="Add Grid">
    Add Grid
  </button>
</section>
    </div>
  );
}

GameContainer.propTypes = {
  game: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    gameName: PropTypes.string.isRequired,
    gameDescription: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
};

export default GameContainer;
