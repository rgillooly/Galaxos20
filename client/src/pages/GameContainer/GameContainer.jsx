import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AssetMenu from "../AssetMenu/AssetMenu";
import { useDispatch, useSelector } from "react-redux";
import { createAssetMenu, updateItem } from "../reducers"; // Correct import path to your reducer file
import PanContainer from "../PanContainer";
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

function GameContainer({ game = {}, onRename, onDescriptionChange }) {
  const { _id: gameId = null, gameName = "", gameDescription = "" } = game;
  const [windowTitle, setWindowTitle] = useState(gameName);
  const [gameDescriptionState, setGameDescriptionState] =
    useState(gameDescription);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newName, setNewName] = useState(gameName);
  const [newDescription, setNewDescription] = useState(gameDescription);
  const assetMenus = useSelector((state) => state.main.assetMenus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (gameId) {
      axios
        .get(`http://localhost:3001/api/assetMenus?gameId=${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          const menus = response.data.map((menu) => ({
            ...menu,
            position: menu.position || { top: 0, left: 0 }, // Default position if not set
          }));
          dispatch({
            type: "SET_ASSET_DATA",
            payload: menus, // Dispatch the menus to the Redux store
          });
        })
        .catch(() => console.error("Failed to fetch asset menus."));
    }
  }, [gameId, dispatch]);

  useEffect(() => {
    const savedMenus = localStorage.getItem("assetMenus");
    if (savedMenus) {
      dispatch(
        updateItem({ type: "assetMenus", items: JSON.parse(savedMenus) })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    // Save assetMenus state to localStorage when it changes
    localStorage.setItem("assetMenus", JSON.stringify(assetMenus));
  }, [assetMenus]);

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
    } catch {
      console.error("Failed to update game name.");
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
    } catch {
      console.error("Failed to update game description.");
    }
  }, 500);

  const handleCreateAssetMenu = async () => {
    try {
      const position = { top: Math.random() * 400, left: Math.random() * 400 };
      const newMenu = {
        title: "",
        position,
        gameId,
        assets: [],
      };

      const response = await axios.post(
        `http://localhost:3001/api/assetMenus`,
        newMenu,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      dispatch(createAssetMenu(response.data)); // Dispatch the action
    } catch {
      console.error("Error creating new asset menu.");
    }
  };

  const handleDrop = (id, position) => {
    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debugging: Check if token exists

    // If no token, log an error and stop the request
    if (!token) {
      console.error("Token not found. Authorization failed.");
      return;
    }

    // Create a new array with updated position
    const updatedMenus = assetMenus.map((menu) =>
      menu._id === id ? { ...menu, position } : menu
    );

    // Dispatch update to Redux
    dispatch(updateItem({ type: "assetMenus", items: updatedMenus }));

    // Save to localStorage
    localStorage.setItem("assetMenus", JSON.stringify(updatedMenus));

    // Optionally, update the backend position
    axios
      .put(
        `http://localhost:3001/api/assetMenus/${id}`,
        { position },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        console.log("Position saved:", response.data);
      })
      .catch((error) => {
        console.error(
          "Error saving position:",
          error.response || error.message
        );
        if (error.response && error.response.status === 401) {
          // Handle 401 Unauthorized error (e.g., redirect to login)
          alert("Your session has expired. Please log in again.");
          // Redirect to login page or handle re-authentication here
        }
      });
  };

  return (
    <div className="game-container">
      <div>
        <div>
          <h1 className="game-name">
            {isEditingTitle ? (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => {
                  debouncedUpdateGameName(newName);
                  setIsEditingTitle(false);
                }}
                autoFocus
              />
            ) : (
              <span onClick={() => setIsEditingTitle(true)}>{windowTitle}</span>
            )}
          </h1>
          <p>
            {isEditingDescription ? (
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={() => {
                  debouncedUpdateGameDescription(newDescription);
                  setIsEditingDescription(false);
                }}
                autoFocus
              />
            ) : (
              <span onClick={() => setIsEditingDescription(true)}>
                {gameDescriptionState}
              </span>
            )}
          </p>
        </div>
      </div>

      <button onClick={handleCreateAssetMenu}>Create Asset Menu</button>
      <PanContainer>
        <div className="asset-menus-container">
          {assetMenus.map((menu) => (
            <AssetMenu
              key={menu._id || `fallback-${menu.title}`} // Ensure the key is always unique
              _id={menu._id}
              title={menu.title}
              position={menu.position} // Make sure this is available and correct
              onDrop={handleDrop}
              onTitleUpdate={(id, newTitle) => {
                const updatedMenus = assetMenus.map((m) =>
                  m._id === id ? { ...m, title: newTitle } : m
                );
                dispatch(
                  updateItem({ type: "assetMenus", items: updatedMenus })
                );
              }}
            />
          ))}
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
