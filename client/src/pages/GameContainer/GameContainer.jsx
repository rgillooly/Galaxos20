import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createAssetMenu, updateItem } from "../reducers";
import PanContainer from "../PanContainer";
import GameTitleEditor from "../GameTitleEditor/GameTitleEditor";
import GameDescriptionEditor from "../GameDescriptionEditor/GameDescriptionEditor";
import AssetMenu from "../AssetMenu/AssetMenu";
import "./GameContainer.css";

// Utility function for debouncing
const useDebounce = (func, delay) => {
  const timer = useRef(null);
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => func(...args), delay);
  };
};

// Refactored GameContainer
function GameContainer({ game = {}, onRename, onDescriptionChange }) {
  const { _id: gameId = null, gameName = "", gameDescription = "" } = game;
  const [windowTitle, setWindowTitle] = useState(gameName);
  const [gameDescriptionState, setGameDescriptionState] =
    useState(gameDescription);
  const [assetMenus, setAssetMenus] = useState([]);
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

  // Debounced functions for updating game name and description
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
      console.error("Failed to update game name.");
      alert("Failed to update game name. Please try again.");
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
      console.error("Failed to update game description.");
      alert("Failed to update game description. Please try again.");
    }
  }, 500);

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
        { title: "New Menu", position: defaultPosition, gameId }, // Include position
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

  const handleTitleUpdate = (id, newTitle) => {
    setAssetMenus((prevMenus) =>
      prevMenus.map((menu) =>
        menu._id === id ? { ...menu, title: newTitle } : menu
      )
    );
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

      <PanContainer>
        <div className="asset-menus-container">
          {assetMenus.length > 0 ? (
            assetMenus.map((menu) => (
              <AssetMenu
                key={menu._id}
                _id={menu._id}
                title={menu.title}
                position={menu.position}
                assets={menu.assets}
                onDrop={handleDrop}
                onTitleUpdate={handleTitleUpdate}
                onAssetsUpdate={(updatedAssets) =>
                  console.log(`Assets updated for ${menu._id}`, updatedAssets)
                }
                onClose={() =>
                  setAssetMenus((prevMenus) =>
                    prevMenus.filter((m) => m._id !== menu._id)
                  )
                }
              />
            ))
          ) : (
            <p>No asset menus available</p>
          )}
        </div>
      </PanContainer>
    </div>
  );
}

GameContainer.propTypes = {
  game: PropTypes.object,
  onRename: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
};

export default GameContainer;
