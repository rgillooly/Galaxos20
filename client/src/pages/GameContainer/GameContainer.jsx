import React, { useState } from "react";
import PropTypes from "prop-types";
import { CREATE_ASSET_MENU } from "../../utils/mutations";
import AssetMenu from "../AssetMenu/AssetMenu";
import "./GameContainer.css";

function GameContainer({ initialGameName, onClose, game }) {
  const [windowTitle, setWindowTitle] = useState(initialGameName);
  const [menuPosition, setMenuPosition] = useState({ top: 100, left: 100 });
  const [assetMenus, setAssetMenus] = useState(game.assetMenus || []);

  const [createAssetMenu, { loading, error }] = useMutation(CREATE_ASSET_MENU, {
    onCompleted: (data) => {
      if (data && data.createAssetMenu) {
        setAssetMenus((prev) => [...prev, data.createAssetMenu]);
        console.log("Asset menu created successfully:", data.createAssetMenu);
      }
    },
  });

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
    try {
      const result = await createAssetMenu({
        variables: {
          gameId: game.id, // Use the `game.id` directly from props
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
          ], // Ensure all assets are valid
        },
      });
      console.log("Asset Menu Created: ", result.data.createAssetMenu);
    } catch (error) {
      console.error("Error creating asset menu: ", error);
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
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </div>

      {/* Render AssetMenus safely, checking each for null and necessary properties */}
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
  initialGameName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  game: PropTypes.shape({
    id: PropTypes.string.isRequired,
    assetMenus: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
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
