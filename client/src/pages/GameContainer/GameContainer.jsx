import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios"; // Ensure you have axios installed
import AssetMenu from "../AssetMenu/AssetMenu";
import "./GameContainer.css";

function GameContainer({ initialGameName, onClose, game }) {
  const [windowTitle, setWindowTitle] = useState(initialGameName);
  const [menuPosition, setMenuPosition] = useState({ top: 100, left: 100 });
  const [assetMenus, setAssetMenus] = useState(game.assetMenus || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle creating a new asset menu
  const handleCreateAssetMenu = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/${game._id}/assetMenus`,
        {
          gameId: game._id,
          title: "New Asset Menu",
          position: { top: 0, left: 0 },
          assets: [], // Ensure valid assets
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to header
          },
        }
      );

      console.log("Asset Menu Created:", response.data);
    } catch (error) {
      console.error(
        "Error creating asset menu:",
        error.response?.data || error
      );
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
          disabled={loading || !game || !game._id}
        >
          {loading ? "Creating..." : "Create Asset Menu"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Render AssetMenus safely, checking each for null and necessary properties */}
      {assetMenus.length > 0 ? (
        assetMenus
          .filter((menu) => menu && menu.title && menu.position) // Only render valid menus
          .map((menu) => (
            <AssetMenu
              key={menu._id}
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
  initialGameName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  game: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    assetMenus: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        position: PropTypes.shape({
          top: PropTypes.number,
          left: PropTypes.number,
        }),
        assets: PropTypes.arrayOf(PropTypes.object),
      })
    ),
  }).isRequired,
};

export default GameContainer;
