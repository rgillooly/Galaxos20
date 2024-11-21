import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SnapGrid from "../SnapGrid/SnapGrid";
import { useDispatch, useSelector } from "react-redux";
import { addItem, updateItem, createAssetMenu } from "../reducers"; // Ensure correct import
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
  const [gameDescriptionState, setGameDescriptionState] =
    useState(gameDescription);
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
        .get(`http://localhost:3001/api/assetMenus?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          const sortedMenus = response.data
            .map((menu, index) => ({ ...menu, order: menu.order ?? index }))
            .sort((a, b) => a.order - b.order);
          dispatch(updateItem({ type: "assetMenus", items: sortedMenus }));
        })
        .catch((error) => console.error("Error fetching asset menus:", error))
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

  const handleAddGrid = () => {
    const newGrid = {
      id: `grid-${grids.length + 1}`,
      rows: 5,
      columns: 5,
      cellSize: 100,
      assets: [],
    };
    dispatch(addItem(newGrid));
  };

  const handleDragEndAssetMenu = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reorderedMenus = [...assetMenus];
    const [movedMenu] = reorderedMenus.splice(source.index, 1);
    reorderedMenus.splice(destination.index, 0, movedMenu);

    const updatedMenusWithOrder = reorderedMenus.map((menu, index) => ({
      ...menu,
      order: index,
    }));

    dispatch(updateItem({ type: "assetMenus", items: updatedMenusWithOrder }));

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/assetMenus/update-order`, // Replace with your endpoint
        { orderedData: updatedMenusWithOrder }, // Ensure this matches backend expectations
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving asset menu order:", error);
    }
  };

  // When creating a new asset menu
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
        dispatch(createAssetMenu(newAssetMenu)); // Dispatch to add the new asset menu
      } else {
        console.error("Asset menu creation failed: No _id received.");
      }
    } catch {
      setError("Failed to create asset menu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-container">
      <header>
        <h1>{windowTitle}</h1>
      </header>

      <section className="game-description">
        {isRenamingDescription ? (
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onBlur={() => debouncedUpdateGameDescription(newDescription)}
          />
        ) : (
          <p>{gameDescriptionState}</p>
        )}
        <button
          onClick={() => setIsRenamingDescription((prev) => !prev)}
          aria-label={
            isRenamingDescription ? "Save Description" : "Edit Description"
          }
        >
          {isRenamingDescription ? "Save" : "Edit"}
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
                    <Draggable
                      key={menu._id}
                      draggableId={menu._id}
                      index={index}
                    >
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
                  <p>No asset menus available</p> // Fallback message
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

      <section className="snap-grids">
        {grids.map((grid) => (
          <SnapGrid
            key={grid.id}
            id={grid.id}
            draggableId={grid.id} // Unique draggableId based on grid.id
            rows={grid.rows}
            columns={grid.columns}
            cellSize={grid.cellSize}
          />
        ))}
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
