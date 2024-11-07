import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios"; // Add axios for making API requests
import AssetMenu from "../AssetMenu/AssetMenu";
import "./GameContainer.css";

function GameContainer({ initialGameName, onClose, game }) {
  const [windowTitle, setWindowTitle] = useState(initialGameName);
  const [assetMenus, setAssetMenus] = useState(game.assetMenus || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ensure game object is valid
  if (!game || !game.id) {
    return (
      <div>
        <h2>Error: Game data is missing or invalid.</h2>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  // Handle creating a new asset menu
  const handleCreateAssetMenu = async () => {
    setLoading(true);
    setError(null);

    try {
      // Define the payload for the new asset menu
      const newAssetMenu = {
        title: "Asset Menu Title",
        position: { top: 0, left: 0 },
        assets: [
          {
            name: "Asset 1",
            type: "image",
            url: "http://example.com/image1.png",
          },
          {
            name: "Asset 2",
            type: "video",
            url: "http://example.com/video1.mp4",
          },
        ],
      };

      // Replace with your actual API endpoint for creating an asset menu
      const response = await axios.post(
        `http://localhost:3001/api/games/${game.id}/assetMenus`,
        newAssetMenu,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data && response.data.success) {
        // Append the newly created asset menu to the state
        setAssetMenus((prev) => [...prev, response.data.assetMenu]);
        console.log(
          "Asset menu created successfully:",
          response.data.assetMenu
        );
      } else {
        setError("Failed to create asset menu.");
      }
    } catch (error) {
      console.error("Error creating asset menu: ", error);
      setError("An error occurred while creating the asset menu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <input
          type="text"
          value={windowTitle}
          onChange={(e) => setWindowTitle(e.target.value)}
          placeholder="Game Name"
        />
        <button onClick={onClose}>Close</button>
      </header>

      <div className="game-content">
        <button
          onClick={handleCreateAssetMenu}
          disabled={loading || !game || !game.id}
        >
          {loading ? "Creating..." : "Create Asset Menu"}
        </button>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>

      {/* Render AssetMenus */}
      {assetMenus.length > 0 ? (
        assetMenus
          .filter((menu) => menu && menu.title && menu.position) // Only render valid menus
          .map((menu) => (
            <AssetMenu
              key={menu.id}
              title={menu.title}
              position={menu.position}
              assets={menu.assets}
              onClose={() => {
                setAssetMenus((prev) => prev.filter((m) => m.id !== menu.id));
              }}
            />
          ))
      ) : (
        <p>No asset menus available. Click "Create Asset Menu" to add one.</p>
      )}
    </div>
  );
}

GameContainer.propTypes = {
  game: PropTypes.shape({
    _id: PropTypes.string.isRequired, // This will now match the database `_id`
    gameName: PropTypes.string.isRequired,
    gameDescription: PropTypes.string.isRequired,
    assetMenus: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        position: PropTypes.shape({
          top: PropTypes.number,
          left: PropTypes.number,
        }),
        assets: PropTypes.arrayOf(PropTypes.object),
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GameContainer;
