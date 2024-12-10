import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createAssetMenu, updateItem } from "../reducers";
import PanContainer from "../PanContainer";
import GameTitleEditor from "../GameTitleEditor/GameTitleEditor";
import GameDescriptionEditor from "../GameDescriptionEditor/GameDescriptionEditor";
import AssetMenu from "../AssetMenu/AssetMenu";
import Asset from "../Asset/Asset"; // Assuming the Asset component is here
import SnapGrid from "../SnapGrid/SnapGrid"; // Import the SnapGrid component
import "./GameContainer.css";

const GameContainer = ({ game = {}, onRename, onDescriptionChange }) => {
  const { _id: gameId = null, gameName = "", gameDescription = "" } = game;
  const [windowTitle, setWindowTitle] = useState(gameName);
  const [gameDescriptionState, setGameDescriptionState] =
    useState(gameDescription);
  const [assetMenus, setAssetMenus] = useState([]);
  const [assetsState, setAssetsState] = useState([]); // Storing the assets
  const [grid, setGrid] = useState({}); // Grid state for the game
  const dispatch = useDispatch();

  // Fetch asset menus for the game
  useEffect(() => {
    if (gameId) {
      axios
        .get(`http://localhost:3001/api/assetMenus?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          if (response.data && Array.isArray(response.data.assetMenus)) {
            setAssetMenus(response.data.assetMenus);
          } else {
            console.error("Invalid response format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch asset menus:", error);
          alert("Failed to fetch asset menus. Please try again.");
        });
    }
  }, [gameId]);

  // Fetch grid information for the game
  useEffect(() => {
    if (gameId) {
      axios
        .get(`http://localhost:3001/api/grids?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          if (response.data && response.data.grid) {
            setGrid(response.data.grid);
          } else {
            console.error("Invalid grid response format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch grid:", error);
          alert("Failed to fetch grid. Please try again.");
        });
    }
  }, [gameId]);

  const debouncedUpdateGameName = async (name) => {
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
      console.error("Failed to update game name.");
      alert("Failed to update game name. Please try again.");
    }
  };

  const debouncedUpdateGameDescription = async (description) => {
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
      console.error("Failed to update game description.");
      alert("Failed to update game description. Please try again.");
    }
  };

  const handleCreateAssetMenu = async () => {
    const tempId = `temp-${Date.now()}`; // Temporary ID for optimistic update
    const defaultPosition = { top: 100, left: 100 }; // Default position for new menus
    const newMenu = {
      title: "New Menu",
      position: defaultPosition,
      _id: tempId,
      assets: [],
      gameId,
    };

    setAssetMenus((prevMenus) => [...prevMenus, newMenu]); // Add temporary menu

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/api/assetMenus",
        { title: "New Menu", position: defaultPosition, gameId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const createdMenu = response.data.assetMenu;
      setAssetMenus((prevMenus) =>
        prevMenus.map((menu) => (menu._id === tempId ? createdMenu : menu))
      );
    } catch (error) {
      console.error("Error creating asset menu:", error);
      setAssetMenus((prevMenus) =>
        prevMenus.filter((menu) => menu._id !== tempId)
      ); // Remove temporary menu
    }
  };

  const handleDrop = async (id, newPosition) => {
    setAssetMenus((prevMenus) =>
      prevMenus.map((menu) =>
        menu._id === id ? { ...menu, position: newPosition } : menu
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/assetMenus/${id}`,
        { position: newPosition },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to update asset menu position:", error);
    }
  };

  const createNewGrid = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/grids/create", // Updated URL to match the backend route
        {
          gameId,
          rows: 10, // Example: 10 rows
          columns: 10, // Example: 10 columns
          cellSize: 100, // Example: 100px per cell
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Created Grid:", response.data.grid);
      // Add the created grid to the state, or update UI
    } catch (error) {
      console.error("Error creating grid:", error);
    }
  };

  return (
    <div className="game-container">
      <div>
        <GameTitleEditor
          gameName={windowTitle}
          onChange={debouncedUpdateGameName}
        />
        <GameDescriptionEditor
          gameDescription={gameDescriptionState}
          onChange={debouncedUpdateGameDescription}
        />
      </div>

      <button onClick={handleCreateAssetMenu}>Create Asset Menu</button>
      <button onClick={createNewGrid}>Create New Grid</button>

      <PanContainer>
        <div className="grid-container">
          {grid.rows && grid.columns && grid.cellSize && (
            <SnapGrid
              id={grid._id || "snap-grid-1"} // ID for the grid
              rows={grid.rows} // Grid rows
              columns={grid.columns} // Grid columns
              cellSize={grid.cellSize} // Cell size in pixels
              onDrop={handleDrop}
            >
              {/* Here you can render assets as children */}
              {assetsState.map((asset) => (
                <Asset key={asset._id} asset={asset} />
              ))}
            </SnapGrid>
          )}
        </div>
        <div className="asset-menus-container">
          {assetMenus.map((menu) => (
            <AssetMenu
              key={menu._id}
              _id={menu._id}
              title={menu.title}
              position={menu.position}
              assets={menu.assets}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </PanContainer>
    </div>
  );
};

GameContainer.propTypes = {
  game: PropTypes.object,
  onRename: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
};

export default GameContainer;
